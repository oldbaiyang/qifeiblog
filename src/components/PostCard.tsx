// PostCard — article preview card used on home and tag pages.
// Layout: date ribbon + title + excerpt + tag chips.

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { TagPill } from "./TagPill";
import type { PostMeta } from "@/types/post";

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  let dateLabel = post.date;
  let yearLabel = "";
  try {
    dateLabel = format(parseISO(post.date), "MMM d");
    yearLabel = format(parseISO(post.date), "yyyy");
  } catch {
    /* keep raw */
  }
  return (
    <article className="fade-up group border-border bg-surface relative rounded-xl border p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_oklch,var(--accent)_30%,var(--border))] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] sm:p-6">
      {/* Date ribbon */}
      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
        <time
          dateTime={post.date}
          className="font-mono text-[11px] tabular-nums tracking-tight"
        >
          {dateLabel}
        </time>
        <span aria-hidden className="opacity-30">·</span>
        <span className="text-[11px] tabular-nums">{yearLabel}</span>
      </div>

      {/* Title */}
      <h2 className="text-foreground text-lg font-semibold leading-snug tracking-tight sm:text-xl">
        <Link
          href={`/posts/${post.slug}`}
          className="after:absolute after:inset-0 hover:text-[var(--accent)]"
        >
          {post.title}
        </Link>
      </h2>

      {/* Excerpt */}
      {post.description ? (
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
          {post.description}
        </p>
      ) : null}

      {/* Tags */}
      {post.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <TagPill key={t} tag={t} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
