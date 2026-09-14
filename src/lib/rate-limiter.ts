/**
 * In-Memory Rate Limiter for Login Protection.
 * Rules:
 * - Max 3 failed attempts per key.
 * - Lockout for 10 minutes (600 seconds) once limit is reached.
 * - Automatically restored after 10 minutes.
 *
 * Two independent limiters are exported below, keyed differently on purpose.
 * `X-Forwarded-For` (what the IP limiter keys on) is client-supplied and
 * unverified - see the note on `extractClientIp` in `auth.ts` - so an
 * attacker who sends a different fake IP on every request gets a fresh set
 * of 3 attempts every time and the IP limiter never engages. The username
 * limiter has no such escape hatch: this panel has exactly one account, so
 * capping failures against that username, independent of whatever IP is
 * claimed, is what actually bounds total guesses.
 */

import fs from "node:fs";
import path from "node:path";

type AttemptRecord = {
  failures: number;
  lockedUntil: number | null;
  lastAttempt: number;
};

/**
 * Where attempt counts survive a restart.
 *
 * The lockout exists to stop exactly this: an attacker who can force or wait
 * out a restart (a redeploy, a crash, a host reboot) got a fresh 3 attempts
 * every time counters lived only in the in-memory Map. This app runs as a
 * single Node process on Hostinger with no horizontal scaling (see
 * AGENTS.md), so a plain JSON file is enough here - it does not need to
 * survive concurrent writers the way public-reviews.json does, since a
 * failed login is rare enough that a 50ms debounce never overlaps two writes.
 *
 * Not committed: this is runtime security bookkeeping, not content. See
 * .gitignore.
 */
const STATE_FILE = path.join(process.cwd(), "src", "data", ".rate-limit-state.json");

type PersistedState = {
  ip?: Record<string, AttemptRecord>;
  username?: Record<string, AttemptRecord>;
};

function readPersistedState(): Required<PersistedState> {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      ip: parsed.ip && typeof parsed.ip === "object" ? parsed.ip : {},
      username: parsed.username && typeof parsed.username === "object" ? parsed.username : {},
    };
  } catch {
    // Missing on first run, or corrupt - either way, start clean rather than
    // let a bad file take the login form down.
    return { ip: {}, username: {} };
  }
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced so one failed login - which updates both the IP and the
 * username limiter - costs a single write, and a burst of attempts never
 * queues up disk I/O behind the response the visitor is waiting on.
 */
function schedulePersist() {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    try {
      fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
      const snapshot: PersistedState = {
        ip: Object.fromEntries(ipLimiter.store),
        username: Object.fromEntries(usernameLimiter.store),
      };
      fs.writeFileSync(STATE_FILE, JSON.stringify(snapshot), "utf-8");
    } catch (error) {
      console.error("[rate-limiter] Failed to persist attempt state:", error);
    }
  }, 50);
}

type RateLimitStatus = {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterMinutes: number;
  retryAfterSeconds: number;
};

type FailedAttemptResult = {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterMinutes: number;
};

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const RECORD_TTL_MS = 60 * 60 * 1000; // 1 hour memory cleanup

/** One independent (key -> attempt record) counter, so the IP and username limiters never share state. */
function createLimiter(initial: Record<string, AttemptRecord>) {
  const store = new Map<string, AttemptRecord>(Object.entries(initial));

  function cleanupStaleRecords() {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now - record.lastAttempt > RECORD_TTL_MS) {
        store.delete(key);
      }
    }
  }

  function getStatus(key: string): RateLimitStatus {
    const now = Date.now();
    const record = store.get(key);

    if (!record) {
      return {
        isBlocked: false,
        remainingAttempts: MAX_FAILED_ATTEMPTS,
        retryAfterMinutes: 0,
        retryAfterSeconds: 0,
      };
    }

    // Check if locked
    if (record.lockedUntil && record.lockedUntil > now) {
      const diffMs = record.lockedUntil - now;
      return {
        isBlocked: true,
        remainingAttempts: 0,
        retryAfterMinutes: Math.ceil(diffMs / 60000),
        retryAfterSeconds: Math.ceil(diffMs / 1000),
      };
    }

    // If previous lockout has expired, reset failures
    if (record.lockedUntil && record.lockedUntil <= now) {
      store.delete(key);
      return {
        isBlocked: false,
        remainingAttempts: MAX_FAILED_ATTEMPTS,
        retryAfterMinutes: 0,
        retryAfterSeconds: 0,
      };
    }

    const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.failures);
    return {
      isBlocked: remaining === 0,
      remainingAttempts: remaining,
      retryAfterMinutes: 0,
      retryAfterSeconds: 0,
    };
  }

  function recordFailedAttempt(key: string): FailedAttemptResult {
    const now = Date.now();
    let record = store.get(key);

    if (!record || (record.lockedUntil && record.lockedUntil <= now)) {
      record = {
        failures: 1,
        lockedUntil: null,
        lastAttempt: now,
      };
    } else {
      record.failures += 1;
      record.lastAttempt = now;
    }

    if (record.failures >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
      store.set(key, record);
      schedulePersist();
      return {
        isBlocked: true,
        remainingAttempts: 0,
        retryAfterMinutes: 10,
      };
    }

    store.set(key, record);
    schedulePersist();

    // Trigger occasional cleanup
    if (store.size > 200) {
      cleanupStaleRecords();
    }

    return {
      isBlocked: false,
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.failures),
      retryAfterMinutes: 0,
    };
  }

  function reset(key: string): void {
    if (!store.has(key)) return;
    store.delete(key);
    schedulePersist();
  }

  return { getStatus, recordFailedAttempt, reset, store };
}

const persisted = readPersistedState();
const ipLimiter = createLimiter(persisted.ip);
const usernameLimiter = createLimiter(persisted.username);

/** Case-insensitive so varying "admin" / "Admin" / "ADMIN" can't each buy a fresh set of attempts. */
function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** Checks if an IP is currently blocked and gets remaining attempts. */
export function getRateLimitStatus(ip: string): RateLimitStatus {
  return ipLimiter.getStatus(ip);
}

/** Records a failed attempt for an IP. If failures >= 3, locks out for 10 minutes. */
export function recordFailedAttempt(ip: string): FailedAttemptResult {
  return ipLimiter.recordFailedAttempt(ip);
}

/** Resets an IP's failed attempts after a successful login. */
export function resetRateLimit(ip: string): void {
  ipLimiter.reset(ip);
}

/** Same as {@link getRateLimitStatus}, keyed by the attempted username instead of the claimed IP. */
export function getUsernameRateLimitStatus(username: string): RateLimitStatus {
  return usernameLimiter.getStatus(normalizeUsername(username));
}

/** Same as {@link recordFailedAttempt}, keyed by the attempted username instead of the claimed IP. */
export function recordUsernameFailedAttempt(username: string): FailedAttemptResult {
  return usernameLimiter.recordFailedAttempt(normalizeUsername(username));
}

/** Resets a username's failed attempts after a successful login. */
export function resetUsernameRateLimit(username: string): void {
  usernameLimiter.reset(normalizeUsername(username));
}
