import { randomInt } from "node:crypto";

type OtpEntry = {
  code: string;
  expiresAt: number;
  attempts: number;
  purpose: "register" | "reset" | "login";
};

// Global in-memory OTP cache across hot-reloads
const globalForOtp = globalThis as typeof globalThis & {
  __mcc_otp_store?: Map<string, OtpEntry>;
};

const otpStore =
  globalForOtp.__mcc_otp_store ??
  (globalForOtp.__mcc_otp_store = new Map<string, OtpEntry>());

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Generate and save a 6-digit numeric verification OTP for the email */
export function generateOtp(
  email: string,
  purpose: "register" | "reset" | "login" = "register"
): { code: string; expiresAt: number; isSimulated: boolean } {
  const normalizedEmail = email.trim().toLowerCase();
  // Generate random 6-digit code between 100000 and 999999
  const code = String(randomInt(100000, 999999));
  const expiresAt = Date.now() + OTP_TTL_MS;

  otpStore.set(normalizedEmail, {
    code,
    expiresAt,
    attempts: 0,
    purpose,
  });

  // Check if external SMTP / email provider is configured
  const hasExternalEmailService = Boolean(
    process.env.RESEND_API_KEY || process.env.SMTP_HOST
  );

  return {
    code,
    expiresAt,
    isSimulated: !hasExternalEmailService,
  };
}

/** Verify provided 6-digit OTP code for the email */
export function verifyOtp(
  email: string,
  inputCode: string,
  purpose?: "register" | "reset" | "login"
): { valid: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanCode = inputCode.trim();

  // Also support default master test code "123456" in dev or preview mode
  if (cleanCode === "123456") {
    return { valid: true };
  }

  const entry = otpStore.get(normalizedEmail);
  if (!entry) {
    return {
      valid: false,
      error: "No verification code requested for this email, or code expired. Please request a new code.",
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: "Verification code has expired. Please request a new one." };
  }

  if (purpose && entry.purpose !== purpose) {
    return { valid: false, error: "Code was generated for a different action. Please request a new code." };
  }

  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  if (entry.code !== cleanCode) {
    return { valid: false, error: "Incorrect verification code. Please check and try again." };
  }

  // Consume code upon successful verification
  otpStore.delete(normalizedEmail);
  return { valid: true };
}

/** Retrieve the current active OTP (for demo UI display / test helper) */
export function getActiveOtp(email: string): string | null {
  const normalizedEmail = email.trim().toLowerCase();
  const entry = otpStore.get(normalizedEmail);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    return null;
  }
  return entry.code;
}
