import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPage, getPages } from "@/lib/content";
import { extractToc, renderMdx } from "@/mdx-components";
import { ReadingProgress } from "@/components/mdx/reading-progress";
import { DocsSidebar, MobileDocsNav, type SidebarGroup } from "@/components/docs-sidebar";
import { TocList } from "@/components/toc-list";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const pages = getPages("docs");
  return pages.map((p) => ({
    slug: p.slug === "index" ? [] : [p.slug],
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pageSlug = slug && slug.length > 0 ? slug.join("/") : "index";
  const rec = getPage("docs", pageSlug);
  return rec
    ? pageMetadata(rec.meta.title, rec.meta.description)
    : { title: "Not found" };
}

function sidebarGroups(): SidebarGroup[] {
  return [
    {
      key: "docs",
      label: "Start Guide",
      emoji: "✦",
      accent: "blue",
      href: "/docs",
      pages: getPages("docs").map((p) => ({
        href: p.href,
        title: p.title,
        emoji: p.emoji,
      })),
    },
  ];
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const pageSlug = slug && slug.length > 0 ? slug.join("/") : "index";
  const rec = getPage("docs", pageSlug);
  if (!rec) notFound();

  const { meta, body } = rec;
  const toc = extractToc(body);
  const pages = getPages("docs");
  const idx = pages.findIndex((p) => p.slug === meta.slug);
  const prev = idx > 0 ? pages[idx - 1] : null;
  const next = idx >= 0 && idx < pages.length - 1 ? pages[idx + 1] : null;
  const groups = sidebarGroups();

  const content = await renderMdx(body);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_210px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-8">
            <p className="mb-3 px-2.5 text-[10.5px] font-bold tracking-[0.14em] text-muted uppercase">
              Start Guide
            </p>
            <DocsSidebar groups={groups} />
          </div>
        </aside>

        <div className="min-w-0 py-10">
          <MobileDocsNav groups={groups} />

          <article className="max-w-[760px]">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--accent-blue)] uppercase">
              Start Guide
            </p>
            <h1 className="mt-2 text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.04em]">
              {meta.title}
            </h1>
            <p className="mt-3 text-[16.5px] leading-relaxed text-muted">{meta.description}</p>

            <div className="mt-6">
              <ReadingProgress
                slug={`docs-${meta.slug}`}
                minutes={meta.minutes}
                difficulty={meta.difficulty}
              />
            </div>

            <div className="prose-math mt-8">{content}</div>

            {toc.length > 0 ? (
              <nav className="mt-14 border-t border-line pt-8 xl:hidden">
                <TocList items={toc} />
              </nav>
            ) : null}

            <div className="mt-12 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={prev.href}
                  className="rounded-xl border border-line bg-surface px-4 py-3.5 transition-colors hover:border-line-strong"
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted uppercase">
                    <ArrowLeft className="size-3.5" /> Previous
                  </span>
                  <span className="mt-1 block truncate text-[14px] font-semibold">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={next.href}
                  className="rounded-xl border border-line bg-surface px-4 py-3.5 text-right transition-colors hover:border-line-strong sm:col-start-2"
                >
                  <span className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-muted uppercase">
                    Next <ArrowRight className="size-3.5" />
                  </span>
                  <span className="mt-1 block truncate text-[14px] font-semibold">{next.title}</span>
                </Link>
              ) : null}
            </div>
          </article>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto py-10">
            <TocList items={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
