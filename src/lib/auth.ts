import { cookies } from "next/headers";
import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "niscala_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Raised when the admin credentials are not configured.
 *
 * Deliberately a distinct type: callers have to tell "no admin is configured"
 * apart from "the wrong password was typed", because the two need opposite
 * handling - one is an operator mistake to surface loudly, the other is a
 * login attempt to answer vaguely.
 */
export class AdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminConfigError";
  }
}

/**
 * Every one of these used to have a fallback, and that was the whole
 * vulnerability.
 *
 * `ADMIN_PASSWORD` defaulted to a literal in the source, and the session
 * signing key defaulted to that same literal plus a fixed suffix. The
 * repository is public, so the signing key was public: anyone could compute
 * `<timestamp>.HMAC(timestamp, key)`, set the session cookie and hold a valid
 * admin session without ever touching the login form - which also meant the
 * rate limiter never saw them. A default that silently works is worse than a
 * process that refuses to start, so these now fail closed.
 */
function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function getAdminUsername(): string {
  const username = readEnv("ADMIN_USERNAME");
  if (!username) {
    throw new AdminConfigError(
      "ADMIN_USERNAME is not set. The admin panel is disabled until it is."
    );
  }
  return username;
}

/**
 * The session signing key, which must be its own secret.
 *
 * Deriving it from the password was the second half of the bypass: it meant
 * that guessing or leaking the password also handed over the ability to mint
 * sessions forever. Rotating this value is also the only way to revoke
 * outstanding sessions, because the token carries no server-side state.
 */
function getSessionSecret(): string {
  const secret = readEnv("ADMIN_SECRET");
  if (!secret) {
    throw new AdminConfigError(
      "ADMIN_SECRET is not set. Generate one with `npm run admin:secret`."
    );
  }
  if (secret.length < 32) {
    throw new AdminConfigError(
      "ADMIN_SECRET is shorter than 32 characters. Generate one with `npm run admin:secret`."
    );
  }
  return secret;
}

/**
 * Constant-time comparison of two strings of any length.
 *
 * `crypto.timingSafeEqual` throws on a length mismatch, which would leak the
 * expected length; hashing both sides first makes every comparison the same
 * 32 bytes.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Verifies a password against `ADMIN_PASSWORD_HASH`, falling back to a
 * plaintext `ADMIN_PASSWORD`.
 *
 * The hash format is `scrypt$<N>$<r>$<p>$<saltHex>$<keyHex>`, produced by
 * `npm run admin:password`. scrypt ships inside Node, which matters here:
 * bcrypt and argon2 are native addons, and this project has already had a
 * build die on Hostinger over a native binary built against a newer glibc.
 *
 * Plaintext stays supported because for a single-operator panel an
 * environment variable is a reasonable place for a password. The hash is
 * better only in the narrow case where the environment leaks but the process
 * does not - so it is preferred, not required.
 */
function verifyPassword(candidate: string): boolean {
  const stored = readEnv("ADMIN_PASSWORD_HASH");

  if (stored) {
    /*
      The cost parameters travel inside the hash, the way every serious
      password-hash format does, rather than being a constant this file and the
      generator both have to agree on. The first cut of this kept them in two
      places, they disagreed - N of 32768 against Node's default of 16384 - and
      the correct password was rejected. Self-describing means the generator can
      raise the cost later without locking anyone out.
    */
    const [scheme, nRaw, rRaw, pRaw, saltHex, keyHex] = stored.split("$");
    const N = Number(nRaw);
    const r = Number(rRaw);
    const parallelisation = Number(pRaw);

    if (
      scheme !== "scrypt" ||
      !Number.isInteger(N) ||
      !Number.isInteger(r) ||
      !Number.isInteger(parallelisation) ||
      !saltHex ||
      !keyHex
    ) {
      throw new AdminConfigError(
        "ADMIN_PASSWORD_HASH is malformed. Regenerate it with `npm run admin:password`."
      );
    }

    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(keyHex, "hex");
    const actual = crypto.scryptSync(candidate, salt, expected.length, {
      N,
      r,
      p: parallelisation,
      // Node's default ceiling is below what these costs need; scale it to suit.
      maxmem: 256 * N * r,
    });

    return crypto.timingSafeEqual(actual, expected);
  }

  const plaintext = readEnv("ADMIN_PASSWORD");
  if (!plaintext) {
    throw new AdminConfigError(
      "Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set. The admin panel is disabled until one of them is."
    );
  }

  return timingSafeEqual(candidate, plaintext);
}

/** Signs the issue time so the cookie cannot be minted by the client. */
function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(timestamp)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

function verifySessionToken(token: string): boolean {
  if (!token) return false;

  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(timestamp)
    .digest("hex");

  if (!timingSafeEqual(signature, expectedSignature)) return false;

  const issuedAt = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(issuedAt)) return false;

  /*
    Bounded at both ends. The lower bound is the one that was missing: the
    check used to be `Date.now() - issuedAt < MAX_AGE`, and a timestamp in the
    future makes that difference negative, which passes. A forged token dated
    to the year 5138 was therefore valid forever.
  */
  const ageMs = Date.now() - issuedAt;
  return ageMs >= 0 && ageMs < SESSION_MAX_AGE * 1000;
}

/**
 * Verifies username and password together.
 *
 * Both sides are always evaluated - no short-circuit - so a wrong username
 * costs the same as a wrong password.
 */
export function verifyAdminCredentials(username: string, password: string): boolean {
  const userMatches = timingSafeEqual(username.trim(), getAdminUsername());
  const passMatches = verifyPassword(password);
  return userMatches && passMatches;
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * The single gate in front of every admin page and every admin server action.
 *
 * A missing configuration denies rather than throws. Throwing here would take
 * down `next build`, which renders these routes, and would turn a
 * misconfiguration into a broken deployment of the whole site rather than a
 * disabled admin panel. The login action reports the real reason; this only
 * has to say no.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return false;

    return verifySessionToken(cookie.value);
  } catch (error) {
    if (error instanceof AdminConfigError) {
      console.error(`[admin] ${error.message}`);
      return false;
    }
    throw error;
  }
}

/**
 * Extracts the client IP from request headers.
 *
 * Every one of these headers is client-supplied and none of them is verified,
 * so the result is a hint, not an identity. It feeds the login rate limiter,
 * which should be read as friction rather than as a control.
 */
export function extractClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}
