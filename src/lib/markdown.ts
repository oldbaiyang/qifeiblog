// Markdown → HTML pipeline. Runs at build time, produces a string that
// is injected into the post page via dangerouslySetInnerHTML.

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";

export async function renderMarkdownToHtml(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["heading-anchor"] },
    })
    .use(rehypeExternalLinks, {
      target: "_blank",
      rel: ["noopener", "noreferrer"],
    })
    .use(rehypePrettyCode, {
      // Dual themes: CSS variables are emitted; globals.css swaps them in dark mode.
      theme: {
        light: "github-light",
        dark: "github-dark-dimmed",
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(md);
  return String(file);
}

/**
 * Rough reading-time estimate (Chinese + English mix).
 * Uses 300 chars/min for Chinese and 200 wpm for English-ish content.
 */
export function estimateReadingTime(md: string): number {
  const text = md.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]*`/g, " ");
  const cjk = (text.match(/[一-鿿]/g) ?? []).length;
  // Approximate non-CJK as words (split on whitespace)
  const nonCjk = text
    .replace(/[一-鿿]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = cjk / 300 + nonCjk / 200;
  return Math.max(1, Math.ceil(minutes));
}
