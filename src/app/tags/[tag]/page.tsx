import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { getAllTags, getPostsByTag } from "@/lib/posts";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: PageProps) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  return {
    title: `标签: ${tag}`,
    description: `所有标签为 ${tag} 的文章。`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();
  return (
    <div className="page-shell">
      <Sidebar />
      <main>
        <header className="mb-6">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            标签
          </div>
          <h1 className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="text-accent">{tag}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">共 {posts.length} 篇</p>
        </header>
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
      </main>
    </div>
  );
}
