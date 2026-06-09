// Post type definitions.
// PostMeta is the lightweight list/card view; Post adds the rendered HTML body.

export interface PostMeta {
  /** URL-safe slug derived from filename. */
  slug: string;
  title: string;
  /** ISO YYYY-MM-DD. */
  date: string;
  description: string;
  tags: string[];
}

export interface Post extends PostMeta {
  /** Markdown body rendered to HTML (unified pipeline). */
  content: string;
  /** Reading time in minutes, rounded up. */
  readingTime: number;
}
