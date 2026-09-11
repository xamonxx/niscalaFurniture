/**
 * NISCALA FURNITURE - admin credential helper
 *
 *   npm run admin:secret     -> a fresh ADMIN_SECRET
 *   npm run admin:password   -> an ADMIN_PASSWORD_HASH for a password you type
 *
 * Why this exists
 * ---------------
 * `src/lib/auth.ts` now refuses to run on defaults, which is only an
 * improvement if producing real values is easy. Without this, the path of
 * least resistance would be pasting something short and memorable into
 * ADMIN_SECRET, and the signing key would be guessable again by another route.
 *
 * scrypt rather than bcrypt or argon2 on purpose: it ships inside Node. The
 * other two are native addons, and a build on this project's shared host has
 * already died once over a native binary compiled against a newer glibc.
 */

import crypto from "node:crypto";
import readline from "node:readline";

/** 32 bytes of entropy, hex-encoded. Comfortably past the 32-character floor. */
function generateSecret() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Cost parameters.
 *
 * N=2^15 keeps a single verification near a tenth of a second on modest shared
 * hardware - slow enough to make offline guessing expensive, fast enough that
 * a login does not feel broken. Node's default maxmem is too small for this N,
 * so it is raised to match: 128 * N * r * 2.
 */
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 128 * 32768 * 8 * 2 };
const KEY_LENGTH = 32;

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT);
  // Parameters first, so the verifier never has to guess them. See the note in
  // src/lib/auth.ts about what happened when it did.
  return [
    "scrypt",
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString("hex"),
    key.toString("hex"),
  ].join("$");
}

/** Reads a line without echoing it, so the password stays out of the scrollback. */
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const onData = (char) => {
      if (["\n", "\r", "\u0004"].includes(String(char))) {
        process.stdin.removeListener("data", onData);
        return;
      }
      // Redraw the prompt with nothing after it.
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(question);
    };

    process.stdout.write(question);
    process.stdin.on("data", onData);

    rl.question("", (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const mode = process.argv[2];

  if (mode === "secret") {
    console.log("\nAdd this to .env.local on your machine and to the environment on the server:\n");
    console.log(`ADMIN_SECRET=${generateSecret()}`);
    console.log(
      "\nChanging this value signs every existing session out, including any an\n" +
        "attacker may hold. That is the only way to revoke one, because the token\n" +
        "carries no server-side state.\n"
    );
    return;
  }

  if (mode === "password") {
    const password = await askHidden("New admin password (not echoed): ");

    if (password.length < 12) {
      console.error("\nToo short. Use at least 12 characters.\n");
      process.exitCode = 1;
      return;
    }

    // Next.js's env loader interpolates unescaped `$word` as a reference to
    // another env var, so the hash's `$`-delimited fields must be escaped or
    // they get silently gutted on load. See CHANGELOG.md.
    const escapedHash = hashPassword(password).replace(/\$/g, "\\$");

    console.log("\nAdd this to .env.local and to the environment on the server:\n");
    console.log(`ADMIN_PASSWORD_HASH=${escapedHash}`);
    console.log("\nRemove any ADMIN_PASSWORD line once this is in place.\n");
    return;
  }

  console.error("Usage: npm run admin:secret  |  npm run admin:password");
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
