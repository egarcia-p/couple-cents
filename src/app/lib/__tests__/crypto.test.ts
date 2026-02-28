import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { encrypt, decrypt, hashDeterministic, safeDecrypt } from "../crypto";

// A mock valid 32-byte key encoded in base64 for testing
const TEST_KEY = "RpjGstp2ozdRkHBcCrJz0BOYv+UH4eIU7dvVFMQQgow=";

describe("crypto", () => {
  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("encrypt", () => {
    it("should return a string in iv:ciphertext:authTag format", () => {
      const result = encrypt("hello world");
      const parts = result.split(":");
      expect(parts).toHaveLength(3);
      // Each part should be valid base64
      for (const part of parts) {
        expect(part.length).toBeGreaterThan(0);
        expect(() => Buffer.from(part, "base64")).not.toThrow();
      }
    });

    it("should produce different ciphertext for the same plaintext (random IV)", () => {
      const result1 = encrypt("same input");
      const result2 = encrypt("same input");
      expect(result1).not.toEqual(result2);
    });

    it("should handle empty string", () => {
      const result = encrypt("");
      const parts = result.split(":");
      expect(parts).toHaveLength(3);
    });

    it("should handle special characters", () => {
      const specialText = "Hello! @#$%^&*() 日本語 emoji: 🎉";
      const encrypted = encrypt(specialText);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toEqual(specialText);
    });

    it("should handle very long strings", () => {
      const longText = "a".repeat(10000);
      const encrypted = encrypt(longText);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toEqual(longText);
    });

    it("should throw if ENCRYPTION_KEY is not set", () => {
      vi.stubEnv("ENCRYPTION_KEY", "");
      expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY");
    });

    it("should throw if ENCRYPTION_KEY is wrong length", () => {
      // 16 bytes instead of 32
      vi.stubEnv("ENCRYPTION_KEY", Buffer.alloc(16).toString("base64"));
      expect(() => encrypt("test")).toThrow("32 bytes");
    });
  });

  describe("decrypt", () => {
    it("should correctly decrypt an encrypted value", () => {
      const plaintext = "hello world";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toEqual(plaintext);
    });

    it("should handle numeric strings (amounts)", () => {
      const amount = "12345";
      const encrypted = encrypt(amount);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toEqual(amount);
    });

    it("should throw for invalid format (missing parts)", () => {
      expect(() => decrypt("invalid")).toThrow("Invalid encrypted text format");
    });

    it("should throw for invalid format (too many parts)", () => {
      expect(() => decrypt("a:b:c:d")).toThrow("Invalid encrypted text format");
    });

    it("should throw for tampered ciphertext", () => {
      const encrypted = encrypt("hello");
      const parts = encrypted.split(":");
      // Tamper with the ciphertext
      const tampered = Buffer.from(parts[1], "base64");
      tampered[0] = tampered[0] ^ 0xff;
      parts[1] = tampered.toString("base64");
      expect(() => decrypt(parts.join(":"))).toThrow();
    });

    it("should throw for tampered auth tag", () => {
      const encrypted = encrypt("hello");
      const parts = encrypted.split(":");
      // Tamper with the auth tag
      const tamperedTag = Buffer.from(parts[2], "base64");
      tamperedTag[0] = tamperedTag[0] ^ 0xff;
      parts[2] = tamperedTag.toString("base64");
      expect(() => decrypt(parts.join(":"))).toThrow();
    });

    it("should throw if decrypting with wrong key", () => {
      const encrypted = encrypt("hello");
      // Switch to a different key
      const wrongKey = Buffer.alloc(32, 1).toString("base64");
      vi.stubEnv("ENCRYPTION_KEY", wrongKey);
      expect(() => decrypt(encrypted)).toThrow();
    });
  });

  describe("encrypt/decrypt roundtrip", () => {
    const testCases = [
      "simple text",
      "",
      "12345",
      "0",
      "-500",
      "99.99",
      "Hello, World! 🌍",
      "line1\nline2\ttab",
      "a:b:c", // contains colons like the encrypted format
      ' "quoted" & <special> ',
    ];

    for (const testCase of testCases) {
      it(`should roundtrip: "${testCase}"`, () => {
        const encrypted = encrypt(testCase);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toEqual(testCase);
      });
    }
  });

  describe("hashDeterministic", () => {
    it("should produce a hex string", () => {
      const hash = hashDeterministic("test@example.com");
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("should be deterministic (same input = same output)", () => {
      const hash1 = hashDeterministic("test@example.com");
      const hash2 = hashDeterministic("test@example.com");
      expect(hash1).toEqual(hash2);
    });

    it("should be case-insensitive", () => {
      const hash1 = hashDeterministic("Test@Example.com");
      const hash2 = hashDeterministic("test@example.com");
      expect(hash1).toEqual(hash2);
    });

    it("should trim whitespace", () => {
      const hash1 = hashDeterministic("  test@example.com  ");
      const hash2 = hashDeterministic("test@example.com");
      expect(hash1).toEqual(hash2);
    });

    it("should produce different hashes for different inputs", () => {
      const hash1 = hashDeterministic("user1@example.com");
      const hash2 = hashDeterministic("user2@example.com");
      expect(hash1).not.toEqual(hash2);
    });
  });

  describe("safeDecrypt", () => {
    it("should return empty string for null", () => {
      expect(safeDecrypt(null)).toEqual("");
    });

    it("should return empty string for undefined", () => {
      expect(safeDecrypt(undefined)).toEqual("");
    });

    it("should return empty string for empty string", () => {
      expect(safeDecrypt("")).toEqual("");
    });

    it("should decrypt a properly encrypted value", () => {
      const encrypted = encrypt("hello");
      const result = safeDecrypt(encrypted);
      expect(result).toEqual("hello");
    });

    it("should return plaintext as-is when it has no colons", () => {
      const plaintext = "just a plain string";
      const result = safeDecrypt(plaintext);
      expect(result).toEqual(plaintext);
    });

    it("should return plaintext as-is when it has fewer than 2 colons", () => {
      const plaintext = "one:colon";
      const result = safeDecrypt(plaintext);
      expect(result).toEqual(plaintext);
    });

    it("should return plaintext as-is when it has more than 2 colons", () => {
      const plaintext = "a:b:c:d";
      const result = safeDecrypt(plaintext);
      expect(result).toEqual(plaintext);
    });

    it("should fallback to returning value as-is when 3 parts but not valid encrypted data", () => {
      // This has 3 colon-separated parts but isn't valid encrypted data
      const fakeEncrypted = "not:valid:encrypted";
      const result = safeDecrypt(fakeEncrypted);
      expect(result).toEqual(fakeEncrypted);
    });

    it("should correctly handle encrypted numeric amounts", () => {
      const amount = "5000";
      const encrypted = encrypt(amount);
      const result = safeDecrypt(encrypted);
      expect(result).toEqual(amount);
    });
  });
});
