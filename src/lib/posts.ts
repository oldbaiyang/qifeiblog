// Post data access. Reads Markdown files from content/posts/, parses
// YAML frontmatter with gray-matter, and renders the body to HTML.
//
// All functions except getPostBySlug are synchronous; rendering Markdown
// goes through unified and is async. Since this runs at build time, the
// event-loop blocking from sync FS reads is fine.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileToSlug, slugToFile } from "./slug";
import { renderMarkdownToHtml, estimateReadingTime } from "./markdown";
import type { Post, PostMeta } from "@/types/post";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// ----- internal helpers -----

interface RawFrontmatter {
  title?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

function isPublishable(filePath: string): boolean {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return false;
  }
  // Skip drafts that still have placeholder text or unfilled date templates.
  if (raw.includes("这里写摘要")) return false;
  if (/date:.*\{\{/.test(raw)) return false;
  return true;
}

function readMeta(filePath: string): PostMeta | null {
  if (!isPublishable(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  const fm = data as RawFrontmatter;
  if (!fm.title || !fm.date) return null;
  return {
    slug: fileToSlug(path.basename(filePath)),
    title: fm.title,
    date: fm.date,
    description: fm.description ?? "",
    tags: Array.isArray(fm.tags) ? fm.tags : [],
  };
}

function readAllMetas(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .map((f) => (f.endsWith(".md") ? readMeta(path.join(POSTS_DIR, f)) : null))
    .filter((m): m is PostMeta => m !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ----- public API -----

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(fileToSlug);
}

/** Returns PostMeta[] sorted by date desc. Sync; cheap. */
export function getAllPostMetas(): PostMeta[] {
  return readAllMetas();
}

/** Returns Post[] with rendered HTML. Async because of unified. */
export async function getAllPosts(): Promise<Post[]> {
  const metas = readAllMetas();
  const posts = await Promise.all(
    metas.map(async (meta) => {
      const filePath = path.join(POSTS_DIR, slugToFile(meta.slug));
      const raw = fs.readFileSync(filePath, "utf8");
      const { content } = matter(raw);
      const html = await renderMarkdownToHtml(content);
      return { ...meta, content: html, readingTime: estimateReadingTime(content) };
    }),
  );
  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, slugToFile(slug));
  if (!fs.existsSync(filePath)) return null;
  const meta = readMeta(filePath);
  if (!meta) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { content } = matter(raw);
  const html = await renderMarkdownToHtml(content);
  return { ...meta, content: html, readingTime: estimateReadingTime(content) };
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of getAllPostMetas()) {
    for (const t of p.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostMetas().filter((p) => p.tags.includes(tag));
}
