"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, BookmarkCheck, CircleCheck, Clock, Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFICULTY_STYLE: Record<string, string> = {
  Beginner:
    "text-[var(--accent-emerald)] border-[color-mix(in_oklab,var(--accent-emerald)_35%,transparent)] bg-[color-mix(in_oklab,var(--accent-emerald)_10%,transparent)]",
  Intermediate:
    "text-[var(--accent-blue)] border-[color-mix(in_oklab,var(--accent-blue)_35%,transparent)] bg-[color-mix(in_oklab,var(--accent-blue)_10%,transparent)]",
  Advanced:
    "text-[var(--accent-purple)] border-[color-mix(in_oklab,var(--accent-purple)_35%,transparent)] bg-[color-mix(in_oklab,var(--accent-purple)_10%,transparent)]",
  Olympiad:
    "text-[var(--accent-amber)] border-[color-mix(in_oklab,var(--accent-amber)_35%,transparent)] bg-[color-mix(in_oklab,var(--accent-amber)_10%,transparent)]",
};

function readFlag(key: string) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function ReadingProgress({
  slug,
  minutes,
  difficulty,
  lessonId,
}: {
  slug: string;
  minutes: number;
  difficulty: string;
  lessonId?: number;
}) {
  const readKey = `mcc:read:${slug}`;
  const markKey = `mcc:bm:${slug}`;

  const [read, setRead] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [scroll, setScroll] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const r = readFlag(readKey);
    const m = readFlag(markKey);
    const timer = window.setTimeout(() => {
      setRead(r);
      setBookmarked(m);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [readKey, markKey]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setScroll(max <= 0 ? 0 : Math.min(100, Math.round((doc.scrollTop / max) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  function sync(endpoint: string, body: Record<string, unknown>) {
    void fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => undefined);
  }

  function toggleRead() {
    const next = !read;
    setRead(next);
    try {
      window.localStorage.setItem(readKey, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (lessonId) sync("/api/progress", { lessonId, completed: next });
    flash(next ? "Marked as read" : "Removed from read list");
  }

  function toggleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    try {
      window.localStorage.setItem(markKey, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    sync("/api/bookmarks", { lessonSlug: slug, bookmarked: next });
    flash(next ? "Bookmark saved" : "Bookmark removed");
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      flash("Link copied to clipboard");
    } catch {
      flash("Link copied to clipboard");
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 top-[57px] z-40 h-[2px] bg-transparent">
        <div
          className="h-full bg-[var(--accent-blue)] transition-[width] duration-150 ease-out"
          style={{ width: `${scroll}%` }}
        />
      </div>

      <div className="not-prose mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-background px-2.5 py-1.5 text-[11.5px] font-semibold text-muted">
          <Clock className="size-3.5" />
          {minutes} min read
        </span>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold",
            DIFFICULTY_STYLE[difficulty] ?? DIFFICULTY_STYLE.Intermediate,
          )}
        >
          {difficulty}
        </span>

        <span className="hidden items-center gap-1.5 rounded-lg border border-line bg-background px-2.5 py-1.5 text-[11.5px] font-semibold text-muted sm:inline-flex">
          {scroll}% scrolled
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRead}
            disabled={!hydrated}
            aria-pressed={read}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors",
              read
                ? "border-[var(--accent-emerald)] bg-[color-mix(in_oklab,var(--accent-emerald)_10%,transparent)] text-[var(--accent-emerald)]"
                : "border-line bg-background text-muted hover:border-line-strong",
            )}
          >
            <CircleCheck className="size-3.5" />
            {read ? "Read" : "Mark as read"}
          </button>

          <button
            type="button"
            onClick={toggleBookmark}
            disabled={!hydrated}
            aria-pressed={bookmarked}
            aria-label="Bookmark this page"
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors",
              bookmarked
                ? "border-[var(--accent-amber)] bg-[color-mix(in_oklab,var(--accent-amber)_10%,transparent)] text-[var(--accent-amber)]"
                : "border-line bg-background text-muted hover:border-line-strong",
            )}
          >
            {bookmarked ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
            {bookmarked ? "Saved" : "Bookmark"}
          </button>

          <button
            type="button"
            onClick={share}
            aria-label="Share this page"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-background px-2.5 py-1.5 text-[11.5px] font-semibold text-muted transition-colors hover:border-line-strong"
          >
            <Share2 className="size-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-surface px-4 py-2 text-[12.5px] font-semibold shadow-lg"
          >
            <span className="inline-flex items-center gap-2">
              <Link2 className="size-3.5 text-[var(--accent-blue)]" />
              {toast}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
