"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const isLogin = mode === "login";
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTarget = next || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email, password, next: redirectTarget }
        : { name, email, password, next: redirectTarget };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl || redirectTarget);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  async function loginAsDemo() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ada@mathcare.dev",
          password: "mathematics",
          next: redirectTarget,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Demo login failed.");
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl || redirectTarget);
      router.refresh();
    } catch {
      setError("Network error during demo login.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-7 shadow-lg">
      <div className="mb-6">
        <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-[var(--accent-blue)] font-serif text-[20px] font-bold text-white shadow-xs">
          π
        </span>
        <h1 className="text-[24px] font-bold tracking-[-0.03em]">
          {isLogin ? "Sign in to Math Care Center" : "Create your student account"}
        </h1>
        <p className="mt-1 text-[13.5px] text-muted">
          {isLogin
            ? "Access your enrolled courses, bookmarks, and progress."
            : "Free access to the core curriculum and formula sheets."}
        </p>
      </div>

      {isLogin ? (
        <button
          type="button"
          onClick={loginAsDemo}
          disabled={loading}
          className="mb-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-blue)] bg-[color-mix(in_oklab,var(--accent-blue)_8%,transparent)] text-[13px] font-semibold text-[var(--accent-blue)] transition-colors hover:bg-[color-mix(in_oklab,var(--accent-blue)_16%,transparent)] disabled:opacity-50"
        >
          <Sparkles className="size-3.5 text-[var(--accent-amber)]" />
          1-Click Demo Login (Ada Lovelace)
        </button>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4">
        {!isLogin ? (
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-semibold text-foreground">
              Full name
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className="h-10 w-full rounded-xl border border-line bg-background px-3.5 text-[13.5px] outline-none transition-colors focus:border-[var(--accent-blue)]"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-1 block text-[12.5px] font-semibold text-foreground">
            Email address
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-10 w-full rounded-xl border border-line bg-background px-3.5 text-[13.5px] outline-none transition-colors focus:border-[var(--accent-blue)]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12.5px] font-semibold text-foreground">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? "••••••••" : "At least 8 characters"}
            className="h-10 w-full rounded-xl border border-line bg-background px-3.5 text-[13.5px] outline-none transition-colors focus:border-[var(--accent-blue)]"
          />
        </label>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--accent-rose)] bg-[color-mix(in_oklab,var(--accent-rose)_8%,transparent)] px-3.5 py-2.5 text-[13px] text-[var(--accent-rose)]">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              {isLogin ? "Sign in" : "Create account"}
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] text-muted">
        {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-[var(--accent-blue)] hover:underline"
        >
          {isLogin ? "Create one free" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
