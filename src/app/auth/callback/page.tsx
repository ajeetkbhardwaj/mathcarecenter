"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Finalizing authentication with Supabase...");

  useEffect(() => {
    let unmounted = false;

    async function syncAndRedirect(sessionUser: { email?: string; user_metadata?: Record<string, any> }) {
      const next = searchParams.get("next") || "/dashboard";
      const email = sessionUser.email;
      if (!email) {
        throw new Error("No verified email found in authentication payload.");
      }

      const name =
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        email.split("@")[0];

      setStatus("Syncing session...");

      const res = await fetch("/api/auth/sync-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, next }),
      });

      if (!res.ok) {
        throw new Error("Failed to synchronize application session.");
      }

      if (!unmounted) {
        setStatus("Success! Redirecting to dashboard...");
        setTimeout(() => {
          router.push(next);
          router.refresh();
        }, 300);
      }
    }

    async function handleCallback() {
      const code = searchParams.get("code");

      try {
        if (!isSupabaseConfigured()) {
          router.push(searchParams.get("next") || "/dashboard");
          return;
        }

        // If PKCE authorization code is present in query parameters
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          if (data.session?.user) {
            await syncAndRedirect(data.session.user);
            return;
          }
        }

        // Check active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          await syncAndRedirect(session.user);
          return;
        }

        // Set auth state change listener for hash tokens (#access_token=...)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            authListener.subscription.unsubscribe();
            await syncAndRedirect(session.user);
          }
        });

        // Timeout fallback
        setTimeout(() => {
          if (!unmounted && !error) {
            router.push(searchParams.get("next") || "/dashboard");
          }
        }, 3000);
      } catch (err: unknown) {
        if (!unmounted) {
          const message = err instanceof Error ? err.message : "Authentication failed";
          setError(message);
        }
      }
    }

    handleCallback();

    return () => {
      unmounted = true;
    };
  }, [router, searchParams, error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-xl">
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[var(--accent-blue)] font-serif text-[22px] font-bold text-white shadow-xs">
          π
        </span>

        {error ? (
          <div className="mt-4">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <AlertCircle className="size-5" />
            </div>
            <h2 className="mt-2 text-[18px] font-bold text-foreground">Authentication Error</h2>
            <p className="mt-1 text-[13px] text-muted">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-5 inline-flex h-9 items-center justify-center rounded-xl bg-[var(--accent-blue)] px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Loader2 className="size-5 animate-spin" />
            </div>
            <h2 className="mt-2 text-[18px] font-bold text-foreground">Authenticating</h2>
            <p className="mt-1 text-[13px] text-muted">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
