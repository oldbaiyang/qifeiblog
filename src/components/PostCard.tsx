// PostCard — the timeline-card used on home and tag pages.
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { TagPill } from "./TagPill";
import type { PostMeta } from "@/types/post";

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  let dateLabel = post.date;
  try {
    dateLabel = format(parseISO(post.date), "yyyy.MM.dd");
  } catch {
    /* keep raw */
  }
  return (
    <article className="group border-border hover:border-foreground/30 relative rounded-lg border p-6 transition-colors">
      <div className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
        <time dateTime={post.date}>{dateLabel}</time>
      </div>
      <h2 className="text-foreground text-xl font-semibold tracking-tight">
        <Link
          href={`/posts/${post.slug}`}
          className="hover:underline underline-offset-4"
        >
          {post.title}
        </Link>
      </h2>
      {post.description ? (
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
          {post.description}
        </p>
      ) : null}
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
