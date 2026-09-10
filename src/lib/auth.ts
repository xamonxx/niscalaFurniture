import { cookies } from "next/headers";
import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "niscala_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || "admin";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "niscala2026";
}

function getSecretKey(): string {
  return process.env.ADMIN_SECRET || getAdminPassword() + "_salt_niscala";
}

/**
 * Timing-safe string comparison to prevent timing attack side-channel leaks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Generates an encrypted/hashed session token for admin verification.
 */
function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(timestamp)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

/**
 * Validates a session token using timing-safe comparison.
 */
function verifySessionToken(token: string): boolean {
  if (!token) return false;
  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", getSecretKey())
    .update(timestamp)
    .digest("hex");

  if (!timingSafeEqual(signature, expectedSignature)) return false;

  const ageMs = Date.now() - parseInt(timestamp, 10);
  // Valid if less than 7 days old
  return ageMs < SESSION_MAX_AGE * 1000;
}

/**
 * Verifies both username and password securely with timing-safe comparison.
 */
export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUser = getAdminUsername();
  const expectedPass = getAdminPassword();

  const userMatches = timingSafeEqual(username.trim(), expectedUser.trim());
  const passMatches = timingSafeEqual(password, expectedPass);

  return userMatches && passMatches;
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  return timingSafeEqual(password, expected);
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = createSessionToken();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
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

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return false;

  return verifySessionToken(cookie.value);
}

/**
 * Extracts the client IP from request headers.
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
