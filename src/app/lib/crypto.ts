import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCODING: BufferEncoding = "base64";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is not set. " +
        "Generate one with: node scripts/generateEncryptionKey.ts",
    );
  }
  const keyBuffer = Buffer.from(key, ENCODING);
  if (keyBuffer.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY must be exactly 32 bytes (256 bits) encoded in base64.",
    );
  }
  return keyBuffer;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a string in the format: iv:ciphertext:authTag (all base64-encoded).
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString(ENCODING),
    encrypted.toString(ENCODING),
    authTag.toString(ENCODING),
  ].join(":");
}

/**
 * Decrypts a string produced by encrypt().
 * Expects format: iv:ciphertext:authTag (all base64-encoded).
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(":");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted text format. Expected iv:ciphertext:authTag",
    );
  }

  const iv = Buffer.from(parts[0], ENCODING);
  const encrypted = Buffer.from(parts[1], ENCODING);
  const authTag = Buffer.from(parts[2], ENCODING);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Creates a deterministic SHA-256 hash of the input.
 * Used for email lookups — allows finding a user by email
 * without storing the email in plain text.
 */
export function hashDeterministic(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

/**
 * Safely attempts to decrypt a value. If the value doesn't look encrypted
 * (not in iv:ciphertext:authTag format), returns it as-is.
 * Useful during migration when some values may still be plain text.
 */
export function safeDecrypt(value: string | null | undefined): string {
  if (!value) return "";
  // Check if the value looks like an encrypted string (3 base64 parts separated by colons)
  const parts = value.split(":");
  if (parts.length === 3) {
    try {
      return decrypt(value);
    } catch {
      // If decryption fails, return as-is (likely plain text)
      return value;
    }
  }
  return value;
}
