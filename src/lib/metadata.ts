import type { Metadata } from "next";
import { SITE } from "@/lib/constants/category";

export function createMetadata(override: Metadata = {}): Metadata {
  return {
    metadataBase: new URL(SITE.url),
    title: override.title ?? { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
    description: override.description ?? SITE.description,
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: SITE.url }],
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title: SITE.name,
      description: SITE.description,
      url: SITE.url,
      ...override.openGraph,
    },
    twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description, ...override.twitter },
    robots: { index: true, follow: true },
    ...override,
  };
}

export function pageMetadata(title: string, description: string): Metadata {
  return createMetadata({ title, description, openGraph: { title, description } });
}
