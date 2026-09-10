/**
 * In-Memory Rate Limiter for Login Protection.
 * Rules:
 * - Max 3 failed attempts per IP.
 * - Lockout for 10 minutes (600 seconds) once limit is reached.
 * - Automatically restored after 10 minutes.
 */

type AttemptRecord = {
  failures: number;
  lockedUntil: number | null;
  lastAttempt: number;
};

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const RECORD_TTL_MS = 60 * 60 * 1000; // 1 hour memory cleanup

const ipStore = new Map<string, AttemptRecord>();

// Cleanup stale records periodically
function cleanupStaleRecords() {
  const now = Date.now();
  for (const [ip, record] of ipStore.entries()) {
    if (now - record.lastAttempt > RECORD_TTL_MS) {
      ipStore.delete(ip);
    }
  }
}

/**
 * Checks if an IP is currently blocked and gets remaining attempts.
 */
export function getRateLimitStatus(ip: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterMinutes: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const record = ipStore.get(ip);

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
    ipStore.delete(ip);
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

/**
 * Records a failed attempt for an IP.
 * If failures >= 3, locks out for 10 minutes.
 */
export function recordFailedAttempt(ip: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterMinutes: number;
} {
  const now = Date.now();
  let record = ipStore.get(ip);

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
    ipStore.set(ip, record);
    return {
      isBlocked: true,
      remainingAttempts: 0,
      retryAfterMinutes: 10,
    };
  }

  ipStore.set(ip, record);

  // Trigger occasional cleanup
  if (ipStore.size > 200) {
    cleanupStaleRecords();
  }

  return {
    isBlocked: false,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.failures),
    retryAfterMinutes: 0,
  };
}

/**
 * Resets failed attempts after a successful login.
 */
export function resetRateLimit(ip: string): void {
  ipStore.delete(ip);
}
