"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TocItem } from "@/mdx-components";

export function TocList({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-3 inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.14em] text-muted uppercase">
        <Sparkles className="size-3 text-[var(--accent-amber)]" />
        On this page
      </p>
      <ul className="grid gap-1.5 border-l border-line">
        {items.map((t) => {
          const active = activeId === t.id;
          return (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                className={cn(
                  "-ml-px block border-l-2 py-0.5 text-[12.5px] leading-snug transition-colors",
                  t.depth === 3 ? "pl-6" : "pl-3",
                  active
                    ? "border-l-[var(--accent-blue)] font-semibold text-foreground"
                    : "border-l-transparent text-muted hover:border-l-[var(--accent-blue)] hover:text-foreground",
                )}
              >
                {t.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
