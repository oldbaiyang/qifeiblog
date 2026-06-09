import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAllTags } from "@/lib/posts";

export const metadata = {
  title: "所有标签",
  description: "按标签浏览所有文章。",
};

export default function TagsIndexPage() {
  const tags = getAllTags();
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-foreground text-3xl font-bold tracking-tight">所有标签</h1>
      <p className="text-muted-foreground mt-2">按文章数倒序排列。</p>
      {tags.length === 0 ? (
        <p className="text-muted-foreground mt-8">还没有任何标签。</p>
      ) : (
        <ul className="mt-8 flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                aria-label={`查看标签 ${tag} 的 ${count} 篇文章`}
              >
                <Badge variant="outline" className="hover:bg-accent cursor-pointer text-sm">
                  {tag} <span className="text-muted-foreground ml-1">{count}</span>
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
