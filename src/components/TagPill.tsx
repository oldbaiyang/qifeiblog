// TagPill — a clickable tag chip linking to /tags/[tag].
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TagPillProps {
  tag: string;
}

export function TagPill({ tag }: TagPillProps) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      aria-label={`查看标签 ${tag} 的文章`}
    >
      <Badge variant="outline" className="hover:bg-accent cursor-pointer">
        {tag}
      </Badge>
    </Link>
  );
}
