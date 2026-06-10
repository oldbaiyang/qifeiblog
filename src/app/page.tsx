import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { getAllPostMetas } from "@/lib/posts";
import { SITE_DESCRIPTION } from "@/lib/site";

// Home — left sidebar + main article list.
export default function HomePage() {
  const posts = getAllPostMetas();
  return (
    <div className="page-shell">
      <Sidebar />
      <main>
        <header className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            最近文章
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {posts.length} 篇 · {SITE_DESCRIPTION}
          </p>
        </header>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">还没有发布的文章。</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((p, i) => (
              <li
                key={p.slug}
                style={{ animationDelay: `${i * 40}ms` }}
                className="fade-up"
              >
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
