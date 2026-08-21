import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock } from "lucide-react";
import { getPage, getPages } from "@/lib/content";
import { extractToc, renderMdx } from "@/mdx-components";
import { ReadingProgress } from "@/components/mdx/reading-progress";
import { TocList } from "@/components/toc-list";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getPages("blog")
    .filter((p) => p.slug !== "index")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPage("blog", slug);
  if (!post) return { title: "Post not found" };
  return pageMetadata(post.meta.title, post.meta.description);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPage("blog", slug);
  if (!post) notFound();

  const { meta, body } = post;
  const toc = extractToc(body);
  const content = await renderMdx(body);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to Blog
      </Link>

      <div className="mt-6 grid gap-10 xl:grid-cols-[1fr_240px]">
        <article className="max-w-[780px]">
          <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--accent-amber)] uppercase">
            Blog & Essay
          </p>
          <h1 className="mt-2 text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] font-bold tracking-[-0.04em]">
            {meta.title}
          </h1>
          <p className="mt-3 text-[16.5px] leading-relaxed text-muted">{meta.description}</p>

          <div className="mt-6">
            <ReadingProgress
              slug={`blog-${meta.slug}`}
              minutes={meta.minutes}
              difficulty={meta.difficulty}
            />
          </div>

          <div className="prose-math mt-8">{content}</div>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto py-2">
            <TocList items={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
