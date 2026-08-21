"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, FileText, Hash, Search, Tag, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { TAG_FILTERS } from "@/lib/constants/tags";

type Hit = {
  title: string;
  description: string;
  href: string;
  collection: string;
  tags: string[];
  difficulty: string;
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [index, setIndex] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void fetch("/api/search")
      .then((r) => r.json())
      .then((d: { results: Hit[] }) => {
        if (!cancelled) setIndex(d.results ?? []);
      })
      .catch(() => undefined);
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return index
      .filter((h) => {
        if (selectedTag) {
          const filter = TAG_FILTERS.find((t) => t.id === selectedTag);
          if (filter) {
            const matchesTag = filter.keywords.some((k) =>
              `${h.title} ${h.description} ${h.tags.join(" ")}`.toLowerCase().includes(k),
            );
            if (!matchesTag) return false;
          }
        }
        if (!term) return true;
        return (
          h.title.toLowerCase().includes(term) ||
          h.description.toLowerCase().includes(term) ||
          h.collection.toLowerCase().includes(term) ||
          h.tags.some((t) => t.toLowerCase().includes(term)) ||
          h.difficulty.toLowerCase().includes(term)
        );
      })
      .slice(0, 10);
  }, [q, selectedTag, index]);

  useEffect(() => setActive(0), [q, selectedTag]);

  function go(href: string) {
    setOpen(false);
    setQ("");
    setSelectedTag(null);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-foreground"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search site…</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-line bg-background px-1 font-mono text-[10px] md:inline-flex">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-start justify-center bg-black/45 px-4 pt-[10vh] backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
            >
              {/* Search input bar */}
              <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
                <Search className="size-4 text-muted" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActive((a) => Math.min(results.length - 1, a + 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActive((a) => Math.max(0, a - 1));
                    } else if (e.key === "Enter" && results[active]) {
                      go(results[active].href);
                    }
                  }}
                  placeholder="Search start guide, courses, blog…"
                  className="flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close search"
                  className="grid size-6 cursor-pointer place-items-center rounded-md text-muted hover:bg-surface-2"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-background-subtle px-3.5 py-2">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                  <Tag className="size-3" /> Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                    selectedTag === null
                      ? "bg-[var(--accent-blue)] text-white"
                      : "bg-surface text-muted hover:bg-surface-2",
                  )}
                >
                  All
                </button>
                {TAG_FILTERS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === t.id ? null : t.id)}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                      selectedTag === t.id
                        ? "bg-[var(--accent-blue)] text-white"
                        : "bg-surface text-muted hover:bg-surface-2",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <p className="px-3 py-8 text-center text-[13.5px] text-muted">
                    No results for “{q}”{selectedTag ? ` in ${selectedTag}` : ""}.
                  </p>
                ) : (
                  results.map((h, i) => (
                    <button
                      key={h.href}
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(h.href)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        i === active ? "bg-surface-2" : "hover:bg-surface-2",
                      )}
                    >
                      <FileText className="mt-0.5 size-4 shrink-0 text-muted" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold">{h.title}</span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-muted">
                          {h.description}
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                          <span className="rounded border border-line px-1.5 py-0.5 font-medium">
                            {h.collection}
                          </span>
                        </span>
                      </span>
                      {i === active ? (
                        <CornerDownLeft className="mt-1 size-3.5 shrink-0 text-muted" />
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
