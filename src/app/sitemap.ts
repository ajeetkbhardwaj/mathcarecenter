import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { BASE_URL } from "@/lib/layout.shared";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/docs", "/courses", "/blog", "/pricing", "/login", "/register"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const contentRoutes = source
    .allPages()
    .map((p) => ({
      url: `${BASE_URL}${p.href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...contentRoutes];
}
