"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface AuthFormProps {
  mode?: "login" | "register";
  next?: string;
}

export function AuthForm({ mode: initialMode = "login", next = "/dashboard" }: AuthFormProps) {
  const router = useRouter();
  const formId = useId();

  // Mode: "login" | "register" | "forgot"
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  
  // Forgot password step: 1 (send email) | 2 (enter code & new password)
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Eye toggle state for passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // UI status
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const redirectTarget = next || "/dashboard";

  // Reset errors when switching modes
  const switchMode = (newMode: "login" | "register" | "forgot") => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode(newMode);
    setForgotStep(1);
  };

  // -------------------------------------------------------------
  // 1. Social Login (Google & GitHub with Supabase)
  // -------------------------------------------------------------
  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setErrorMessage(null);
    setOauthLoading(provider);

    try {
      if (isSupabaseConfigured()) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTarget)}`;

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: callbackUrl,
          },
        });

        if (error) throw error;
      } else {
        // Fallback demo OAuth simulation
        const demoEmail = `${provider}.student@mathcarecenter.edu`;
        const demoName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} Student`;

        const res = await fetch("/api/auth/sync-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: demoEmail,
            name: demoName,
            next: redirectTarget,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to sign in with provider.");

        window.location.href = data.redirectUrl || redirectTarget;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to sign in with ${provider}.`;
      setErrorMessage(msg);
      setOauthLoading(null);
    }
  };

  // -------------------------------------------------------------
  // 2. Sign In (Email + Password)
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Try local session login first
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          next: redirectTarget,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        // Also sign in to Supabase if configured (for RLS/client queries)
        if (isSupabaseConfigured()) {
          try {
            await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          } catch {
            // Ignore background client sync error if server session is active
          }
        }

        setSuccessMessage("Signed in successfully! Redirecting...");
        window.location.href = data.redirectUrl || redirectTarget;
        return;
      }

      // 2. If local login failed, check if user exists in Supabase
      if (isSupabaseConfigured()) {
        const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!supaErr && supaData?.user) {
          // Sync Supabase user into app session
          const userName = supaData.user.user_metadata?.full_name || cleanEmail.split("@")[0];
          const syncRes = await fetch("/api/auth/sync-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: cleanEmail,
              name: userName,
              next: redirectTarget,
            }),
          });

          const syncData = await syncRes.json();
          if (syncRes.ok) {
            setSuccessMessage("Signed in successfully! Redirecting...");
            window.location.href = syncData.redirectUrl || redirectTarget;
            return;
          }
        }
      }

      // If both failed, display error
      throw new Error(data.error || "Incorrect email or password. Please try again.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 3. Sign Up (Create Account)
  // -------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. If Supabase is active, register user in Supabase
      let supabaseCreated = false;
      if (isSupabaseConfigured()) {
        const { data: supaData, error: supaErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName },
          },
        });

        if (supaErr) {
          // If email is already registered in Supabase
          if (supaErr.message.toLowerCase().includes("already registered")) {
            throw new Error("An account with this email already exists. Please sign in.");
          }
        } else {
          supabaseCreated = true;
        }
      }

      // 2. Register user in database and create active session
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          next: redirectTarget,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If already registered in local DB
        throw new Error(data.error || "Failed to create account.");
      }

      setSuccessMessage("Account created successfully! Redirecting to your dashboard...");
      window.location.href = data.redirectUrl || redirectTarget;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 4. Forgot Password - Step 1: Send Code
  // -------------------------------------------------------------
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // If Supabase is configured, send reset email via Supabase
      if (isSupabaseConfigured()) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${origin}/auth/callback?next=/update-password`,
        });
      }

      // Also generate reset OTP via API
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, purpose: "reset" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset code.");

      if (data.code) {
        setResetCode(data.code);
      }

      setSuccessMessage(data.message || "Reset instructions sent to your email!");
      setForgotStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset code.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 5. Forgot Password - Step 2: Reset Password with Code
  // -------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = resetCode.trim();

    if (!cleanCode) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanCode,
          newPassword,
          next: redirectTarget,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password.");

      setSuccessMessage("Password reset successfully! Logging you in...");
      window.location.href = data.redirectUrl || redirectTarget;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password reset failed.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--accent-blue)] font-serif text-[20px] font-bold text-white shadow-sm">
            π
          </span>
          <div className="text-left">
            <span className="block text-[18px] leading-tight font-bold text-foreground">
              Math Care Center
            </span>
            <span className="block text-[11px] font-medium text-muted">
              Interactive Mathematics Academy
            </span>
          </div>
        </Link>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-line bg-surface p-7 shadow-lg">
        {/* Top Header / Mode Switcher */}
        {mode !== "forgot" ? (
          <div className="mb-6">
            <div className="flex rounded-xl bg-background p-1 border border-line">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-all ${
                  mode === "login"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-all ${
                  mode === "register"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to Sign In
            </button>
            <h2 className="mt-2 text-[20px] font-bold tracking-tight text-foreground">
              Reset Your Password
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              {forgotStep === 1
                ? "Enter your account email to receive a password reset code."
                : `Enter the 6-digit code sent to ${email} and your new password.`}
            </p>
          </div>
        )}

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-[13px] text-rose-600 dark:text-rose-400">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-[13px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SOCIAL SIGN IN (Available on Login & Register) */}
        {/* ------------------------------------------------------------- */}
        {mode !== "forgot" && (
          <div className="mb-5">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={loading || !!oauthLoading}
                onClick={() => handleOAuthSignIn("google")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-background text-[13px] font-medium text-foreground transition-all hover:bg-surface hover:border-muted/50 disabled:opacity-50"
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="size-4 animate-spin text-muted" />
                ) : (
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Google</span>
              </button>

              <button
                type="button"
                disabled={loading || !!oauthLoading}
                onClick={() => handleOAuthSignIn("github")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-background text-[13px] font-medium text-foreground transition-all hover:bg-surface hover:border-muted/50 disabled:opacity-50"
              >
                {oauthLoading === "github" ? (
                  <Loader2 className="size-4 animate-spin text-muted" />
                ) : (
                  <svg className="size-4 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                )}
                <span>GitHub</span>
              </button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-muted">
                <span className="bg-surface px-2">or continue with email</span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE: SIGN IN */}
        {/* ------------------------------------------------------------- */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor={`${formId}-login-email`}
                className="block text-[12px] font-medium text-foreground mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  id={`${formId}-login-email`}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-line bg-background py-2.5 pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted/60 transition-colors focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`${formId}-login-password`}
                  className="text-[12px] font-medium text-foreground"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-[12px] font-medium text-[var(--accent-blue)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  id={`${formId}-login-password`}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-line bg-background py-2.5 pl-10 pr-11 text-[14px] text-foreground placeholder:text-muted/60 transition-colors focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/20"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1 rounded-md"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!oauthLoading}
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] px-4 text-[14px] font-semibold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE: CREATE ACCOUNT (SIGN UP) */}
        {/* ------------------------------------------------------------- */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor={`${formId}-register-name`}
                className="block text-[12px] font-medium text-foreground mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  id={`${formId}-register-name`}
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Euler Gauss"
                  className="w-full rounded-xl border border-line bg-background py-2.5 pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted/60 transition-colors focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={`${formId}-register-email`}
                className="block text-[12px] font-medium text-foreground mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  id={`${formId}-register-email`}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-line bg-background py-2.5 pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted/60 transition-colors focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={`${formId}-register-password`}
                className="block text-[12px] font-medium text-foreground mb-1.5"
              >
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  id={`${formId}-register-password`}
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-line bg-background py-2.5 pl-10 pr-11 text-[14px] text-foreground placeholder:text-muted/60 transition-colors focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/20"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1 rounded-md"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!oauthLoading}
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] px-4 text-[14px] font-semibold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE: FORGOT PASSWORD */}
        {/* ------------------------------------------------------------- */}
        {mode === "forgot" && (
          <div>
            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label
                    htmlFor={`${formId}-forgot-email`}
                    className="block text-[12px] font-medium text-foreground mb-1.5"
                  >
                    Your Account Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                    <input
                      id={`${formId}-forgot-email`}
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full rounded-xl border border-line bg-background py-2.5 pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted/60 transition-colors focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] px-4 text-[14px] font-semibold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor={`${formId}-reset-code`}
                    className="block text-[12px] font-medium text-foreground mb-1.5"
                  >
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                    <input
                      id={`${formId}-reset-code`}
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      className="w-full font-mono tracking-widest text-center rounded-xl border border-line bg-background py-2.5 pl-10 pr-4 text-[16px] font-bold text-foreground placeholder:text-muted/60 transition-colors focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-new-password`}
                    className="block text-[12px] font-medium text-foreground mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                    <input
                      id={`${formId}-new-password`}
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-line bg-background py-2.5 pl-10 pr-11 text-[14px] text-foreground placeholder:text-muted/60 transition-colors focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/20"
                    />
                    <button
                      type="button"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1 rounded-md"
                    >
                      {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-background px-4 text-[13px] font-semibold text-muted hover:text-foreground transition-colors"
                  >
                    Resend
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] px-4 text-[14px] font-semibold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Quick Test Credential Hint (Subtle footer) */}
      <div className="mt-4 text-center">
        <p className="text-[12px] text-muted">
          Demo student account:{" "}
          <button
            type="button"
            onClick={() => {
              setEmail("student@mathcarecenter.edu");
              setPassword("exploremath2025");
              setMode("login");
            }}
            className="font-medium text-[var(--accent-blue)] hover:underline"
          >
            student@mathcarecenter.edu
          </button>{" "}
          / <span className="font-mono text-[11px]">exploremath2025</span>
        </p>
      </div>
    </div>
  );
}
