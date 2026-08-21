import type { CollectionKey } from "@/lib/content";

/** Canonical URL for a content page. */
export function pageHref(collection: CollectionKey, slug: string): string {
  if (collection === "docs") return slug === "index" ? "/docs" : `/docs/${slug}`;
  if (collection === "courses") return slug === "index" ? "/courses" : `/courses/${slug}`;
  if (collection === "blog") return slug === "index" ? "/blog" : `/blog/${slug}`;
  return `/${collection}/${slug}`;
}
