// RSS 2.0 feed builder. Hand-rolled XML — no extra dep.
//
// We use encodeURIComponent on tags to keep slugs URL-safe in <link>.

import type { PostMeta } from "@/types/post";
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from "./site";

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function rfc822(date: string): string {
  // YYYY-MM-DD → RFC 822 (toUTCString format)
  return new Date(date + "T00:00:00Z").toUTCString();
}

export function buildRssXml(posts: PostMeta[]): string {
  const items = posts
    .map((p) => {
      const link = `${SITE_URL}/posts/${p.slug}`;
      return `    <item>
      <title>${cdata(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
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
