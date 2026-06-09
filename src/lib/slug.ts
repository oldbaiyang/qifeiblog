// Convert a markdown filename to a URL slug.
// We strip the .md extension and encode the rest, which keeps Chinese /
// unicode characters readable in URLs (browsers display them properly).

export function fileToSlug(filename: string): string {
  return encodeURIComponent(filename.replace(/\.md$/i, ""));
}

export function slugToFile(slug: string): string {
  // Inverse: decode, then append .md
  try {
    return `${decodeURIComponent(slug)}.md`;
  } catch {
    return `${slug}.md`;
  }
}
