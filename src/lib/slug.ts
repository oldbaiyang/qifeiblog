// Slug = filename without .md extension. We keep the original characters
// (including Chinese, spaces, punctuation) and URL-encode at the call site
// when building Link hrefs. This avoids the double-encoding footgun and
// keeps the file-system ↔ slug mapping trivially reversible.

export function fileToSlug(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

export function slugToFile(slug: string): string {
  return `${slug}.md`;
}
