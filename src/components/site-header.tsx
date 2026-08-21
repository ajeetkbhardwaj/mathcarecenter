"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "./search-dialog";

const NAV = [
  { href: "/docs", label: "Start Guide" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
];

export type HeaderUser = { id: number; name: string; email: string } | null;

function PiMark() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-blue)] font-serif text-[17px] leading-none font-bold text-white shadow-xs">
      π
    </span>
  );
}

function UserMenu({ user }: { user: NonNullable<HeaderUser> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-surface text-[11px] font-bold text-foreground transition-colors hover:border-line-strong"
      >
        {user.name.slice(0, 1).toUpperCase()}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
          >
            <div className="border-b border-line px-3.5 py-3">
              <p className="truncate text-[13px] font-semibold">{user.name}</p>
              <p className="truncate text-[11.5px] text-muted">{user.email}</p>
            </div>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors hover:bg-surface-2"
            >
              <LayoutDashboard className="size-3.5 text-muted" />
              Dashboard
            </Link>
            <Link
              href="/dashboard#bookmarks"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors hover:bg-surface-2"
            >
              <Bookmark className="size-3.5 text-muted" />
              Bookmarks
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 border-t border-line px-3.5 py-2.5 text-left text-[13px] text-[var(--accent-rose)] transition-colors hover:bg-surface-2"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SiteHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);

  useEffect(() => setMobile(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 h-[57px] border-b border-line bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <PiMark />
          <span className="text-[15.5px] font-bold tracking-[-0.02em] whitespace-nowrap">
            Math Care Center
          </span>
        </Link>

        <nav className="ml-5 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active =
              n.href === "/courses"
                ? pathname.startsWith("/courses")
                : n.href === "/blog"
                  ? pathname.startsWith("/blog")
                  : pathname.startsWith("/docs");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-surface-2 font-semibold text-foreground"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-8 items-center rounded-lg px-3 text-[13px] font-medium text-muted transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-8 items-center rounded-lg bg-[var(--accent-blue)] px-3 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <User className="mr-1.5 size-3.5" />
                Create account
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobile((v) => !v)}
            aria-label="Toggle menu"
            className="grid size-8 place-items-center rounded-lg border border-line bg-surface text-muted lg:hidden"
          >
            {mobile ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobile ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-line bg-background lg:hidden"
          >
            <div className="grid gap-1 px-4 py-3">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-2 text-[14px] font-medium text-muted hover:bg-surface-2 hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
