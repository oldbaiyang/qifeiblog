#!/usr/bin/env node
// prebuild.mjs — generate static sitemap.xml, robots.txt, rss.xml into public/.
// Runs before `next build`. Plain Node.js (no TS) so we don't need a build step.
//
// We use the same publishability rules as src/lib/posts.ts:
//   - skip if frontmatter description is the placeholder "这里写摘要"
//   - skip if date still contains the {{...}} template token

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "content", "posts");
const PUBLIC_DIR = path.join(ROOT, "public");

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://qifeiblog.com").replace(/\/$/, "");
const SITE_TITLE = "qifeiblog";
const SITE_DESCRIPTION =
  "个人技术博客：AI 工具、效率提升、Cloudflare 与开源实践。";

// ----- post loading (mirrors src/lib/posts.ts) -----

function isPublishable(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return false;
  }
  if (raw.includes("这里写摘要")) return false;
  if (/date:.*\{\{/.test(raw)) return false;
  return true;
}

function readMeta(filePath) {
  if (!isPublishable(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  if (!data.title || !data.date) return null;
  // gray-matter auto-parses YAML date into a JS Date; normalize to YYYY-MM-DD.
  const dateStr =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date);
  return {
    // Slug = raw filename (no encoding). encode at the URL call site.
    slug: path.basename(filePath).replace(/\.md$/i, ""),
    title: data.title,
    date: dateStr,
    description: data.description ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
}

function getAllMetas() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readMeta(path.join(POSTS_DIR, f)))
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getAllTags(metas) {
  const counts = new Map();
  for (const p of metas) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

// ----- RSS 2.0 -----

function cdata(s) {
  return `<![CDATA[${String(s).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function buildRss(posts) {
  const items = posts
    .map((p) => {
      const link = `${SITE_URL}/posts/${p.slug}`;
      return `    <item>
      <title>${cdata(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.date + "T00:00:00Z").toUTCString()}</pubDate>
      <description>${cdata(p.description)}</description>
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${cdata(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${cdata(SITE_DESCRIPTION)}</description>
    <language>zh-cn</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

// ----- sitemap -----

function buildSitemap(metas, tags) {
  const now = new Date().toISOString();
  const urls = [
    { loc: SITE_URL, lastmod: now, priority: "1.0" },
    { loc: `${SITE_URL}/about`, lastmod: now, priority: "0.4" },
    { loc: `${SITE_URL}/tags`, lastmod: now, priority: "0.4" },
    ...metas.map((p) => ({
      loc: `${SITE_URL}/posts/${p.slug}`,
      lastmod: new Date(p.date).toISOString(),
      priority: "0.8",
    })),
    ...tags.map(({ tag }) => ({
      loc: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
      lastmod: now,
      priority: "0.5",
    })),
  ];
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

// ----- robots -----

function buildRobots() {
  return `User-Agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// ----- main -----

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const metas = getAllMetas();
  const tags = getAllTags(metas);

  fs.writeFileSync(path.join(PUBLIC_DIR, "rss.xml"), buildRss(metas), "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), buildSitemap(metas, tags), "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), buildRobots(), "utf8");

  console.log(
    `[prebuild] wrote rss.xml (${metas.length} posts), sitemap.xml (${metas.length + 2 + tags.length} urls), robots.txt`,
  );
}

main();
