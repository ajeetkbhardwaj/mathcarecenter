import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calendar, Clock, PenLine } from "lucide-react";
import { getPages } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Blog & Essays",
  "Mathematical intuition, linear algebra for AI, and strategies for reading research papers.",
);

export const dynamic = "force-static";

export default function BlogDirectoryPage() {
  const posts = getPages("blog").filter((p) => p.slug !== "index");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--accent-amber)] uppercase">
          Blog & Essays
        </p>
        <h1 className="mt-2 text-[clamp(2rem,4.4vw,2.8rem)] leading-[1.08] font-bold tracking-[-0.038em]">
          Mathematical Intuition & Deep Dives
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
          Essays on geometric intuition, linear algebra for artificial intelligence, and how
          mathematicians read dense research papers.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.slug}
            className="flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-xs transition-all hover:border-line-strong"
          >
            <span className="mb-4 inline-grid size-10 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--accent-amber)_12%,transparent)] text-[var(--accent-amber)]">
              <PenLine className="size-5" />
            </span>

            <h2 className="text-[18px] font-bold tracking-[-0.02em]">{p.title}</h2>
            <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">
              {p.description}
            </p>

            <div className="mt-6 border-t border-line pt-4 flex items-center justify-between text-[12px] text-muted font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" /> {p.minutes} min read
              </span>
              <Link
                href={`/blog/${p.slug}`}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--accent-blue)] hover:underline"
              >
                Read <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
