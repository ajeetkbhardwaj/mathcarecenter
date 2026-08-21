import { source } from "@/lib/source";
import { BASE_URL, SITE_NAME } from "@/lib/rss-shared";

export const dynamic = "force-static";

export async function GET() {
  const items = source
    .pages("blog")
    .filter((p) => p.slug !== "index")
    .map((p) => {
      const meta = source.page(p.collection, p.slug);
      return { meta: p, body: meta?.body ?? "" };
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Mathematics essays and deep dives from ${SITE_NAME}.</description>
    ${items
      .map(
        (i) => `<item>
      <title>${i.meta.title}</title>
      <link>${BASE_URL}${i.meta.href}</link>
      <description>${i.meta.description}</description>
    </item>`,
      )
      .join("\n    ")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
