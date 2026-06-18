import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { PostMeta } from "@/components/PostMeta";
import { CodeCopyButton } from "@/components/CodeCopyButton";
import { Comments } from "@/components/Comments";
import { SITE_URL } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Return raw slug. Filesystem dir name and route param both use the
  // raw form; CF Pages decodes URL paths before file lookup, so raw
  // Chinese dir names match decoded requests. getPostBySlug() still
  // accepts encoded form as a fallback for inbound percent-encoded URLs.
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const url = `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="text-foreground text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-5">
          <PostMeta
            date={post.date}
            tags={post.tags}
            readingTime={post.readingTime}
          />
        </div>
      </header>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <CodeCopyButton />
      <Comments slug={post.slug} />
    </article>
  );
}
