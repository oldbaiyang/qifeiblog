import { PostCard } from "@/components/PostCard";
import { getAllPostMetas } from "@/lib/posts";

// Home page — newest articles first.
export default function HomePage() {
  const posts = getAllPostMetas();
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="sr-only">最近文章</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">还没有发布的文章。</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
