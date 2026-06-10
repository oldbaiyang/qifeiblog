// TagPill — a small subtle tag chip used inside PostCard / PostMeta.
import Link from "next/link";

interface TagPillProps {
  tag: string;
  size?: "sm" | "md";
}

export function TagPill({ tag, size = "sm" }: TagPillProps) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      aria-label={`查看标签 ${tag} 的文章`}
      className={
        size === "md"
          ? "hover:bg-accent-soft hover:text-accent inline-flex items-center rounded-md border border-border bg-transparent px-2 py-0.5 text-xs text-[var(--muted-foreground)] transition-colors"
          : "hover:bg-accent-soft hover:text-accent inline-flex items-center rounded border border-border bg-transparent px-1.5 py-0 text-[10px] text-[var(--muted-foreground)] transition-colors"
      }
    >
      {tag}
    </Link>
  );
}
