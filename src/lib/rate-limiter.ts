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

type AttemptRecord = {
  failures: number;
  lockedUntil: number | null;
  lastAttempt: number;
};

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
function createLimiter() {
  const store = new Map<string, AttemptRecord>();

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
      return {
        isBlocked: true,
        remainingAttempts: 0,
        retryAfterMinutes: 10,
      };
    }

    store.set(key, record);

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
    store.delete(key);
  }

  return { getStatus, recordFailedAttempt, reset };
}

const ipLimiter = createLimiter();
const usernameLimiter = createLimiter();

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
