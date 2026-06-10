import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllTags } from "@/lib/posts";

export const metadata = {
  title: "所有标签",
  description: "按标签浏览所有文章。",
};

export default function TagsIndexPage() {
  const tags = getAllTags();
  return (
    <div className="page-shell">
      <Sidebar />
      <main>
        <header className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            所有标签
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            共 {tags.length} 个标签 · 按文章数倒序
          </p>
        </header>
        {tags.length === 0 ? (
          <p className="text-muted-foreground">还没有任何标签。</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <li key={tag}>
                <Link
                  href={`/tags/${encodeURIComponent(tag)}`}
                  aria-label={`查看标签 ${tag} 的 ${count} 篇文章`}
                  className="hover:bg-accent-soft hover:border-accent hover:text-accent inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-[var(--foreground)] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all"
                >
                  <span>{tag}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
