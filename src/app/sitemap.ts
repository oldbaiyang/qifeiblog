import type { MetadataRoute } from "next";
import { getAllPostMetas, getAllTags } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllPostMetas().map((p) => ({
    url: `${SITE_URL}/posts/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const tags = getAllTags().map(({ tag }) => ({
    url: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    { url: `${SITE_URL}/about`, lastModified: now, priority: 0.4 },
    { url: `${SITE_URL}/tags`, lastModified: now, priority: 0.4 },
    ...posts,
    ...tags,
  ];
}
