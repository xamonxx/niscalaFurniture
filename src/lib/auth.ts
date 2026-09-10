import { cookies } from "next/headers";
import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "niscala_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "niscala2026";
}

function getSecretKey(): string {
  return process.env.ADMIN_SECRET || getAdminPassword() + "_salt_niscala";
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
 * Validates a session token.
 */
function verifySessionToken(token: string): boolean {
  if (!token) return false;
  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", getSecretKey())
    .update(timestamp)
    .digest("hex");

  if (signature !== expectedSignature) return false;

  const ageMs = Date.now() - parseInt(timestamp, 10);
  // Valid if less than 7 days old
  return ageMs < SESSION_MAX_AGE * 1000;
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  return password === expected;
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
