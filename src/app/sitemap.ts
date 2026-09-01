import type { MetadataRoute } from "next";
import { listPublished, postHref } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const posts = (await listPublished()).map((p) => ({
    url: `${base}${postHref(p)}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticPages = [
    "/about",
    "/contact",
    "/guides",
    "/blog",
    "/search",
    "/privacy",
    "/terms",
    "/disclaimer",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.3,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...staticPages,
    ...posts,
  ];
}
