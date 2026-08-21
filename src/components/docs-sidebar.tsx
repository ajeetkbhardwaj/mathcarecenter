"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type SidebarGroup = {
  key: string;
  label: string;
  emoji: string;
  accent: string;
  href: string;
  pages: { href: string; title: string; emoji: string }[];
};

export function DocsSidebar({ groups }: { groups: SidebarGroup[] }) {
  const pathname = usePathname();

  const activeKey =
    groups.find((g) =>
      g.key === "docs"
        ? pathname === "/docs" ||
          (pathname.startsWith("/docs") &&
            !groups.some((o) => o.key !== "docs" && pathname.startsWith(`/docs/${o.key}`)))
        : pathname.startsWith(`/docs/${g.key}`),
    )?.key ?? groups[0]?.key;

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Documentation navigation" className="text-[13.5px]">
      {groups.map((g) => {
        const isOpen = !collapsed[g.key];
        const isActiveGroup = g.key === activeKey;

        return (
          <div key={g.key} className="mb-1.5">
            <button
              type="button"
              onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left font-semibold transition-colors",
                isActiveGroup ? "text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              <ChevronRight
                className={cn(
                  "size-3.5 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-90",
                )}
              />
              <span className="shrink-0">{g.emoji}</span>
              <span className="truncate">{g.label}</span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="mt-0.5 mb-2 ml-[19px] grid gap-0.5 border-l border-line pl-3">
                    {g.pages.map((p) => {
                      const active = pathname === p.href;
                      return (
                        <li key={p.href}>
                          <Link
                            href={p.href}
                            className={cn(
                              "-ml-3 block rounded-r-lg border-l-2 py-1.5 pl-3 transition-colors",
                              active
                                ? "border-l-[var(--accent-blue)] bg-surface-2 font-semibold text-foreground"
                                : "border-l-transparent text-muted hover:bg-surface-2 hover:text-foreground",
                            )}
                          >
                            {p.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

export function MobileDocsNav({ groups }: { groups: SidebarGroup[] }) {
  const pathname = usePathname();
  const all = groups.flatMap((g) => g.pages);

  return (
    <details className="mb-6 rounded-xl border border-line bg-surface px-4 py-3 lg:hidden">
      <summary className="cursor-pointer text-[13px] font-semibold text-foreground">
        Browse documentation & courses
      </summary>
      <ul className="mt-3 grid gap-1">
        {all.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className={cn(
                "block rounded-lg px-2.5 py-1.5 text-[13.5px]",
                pathname === p.href ? "bg-surface-2 font-semibold text-foreground" : "text-muted",
              )}
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
