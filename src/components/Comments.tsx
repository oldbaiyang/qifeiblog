"use client";

// Comments — Giscus wrapper. Giscus is configured via public env vars
// in .env.local. We avoid hard-failing if the env vars are missing — we
// simply don't render the widget (useful during local development
// without Giscus set up).
import Giscus from "@giscus/react";

export function Comments({ slug }: { slug: string }) {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
  if (!repo || !repoId || !category || !categoryId) return null;
  return (
    <div className="mt-12 border-t border-border pt-8">
      <Giscus
        id={`comments-${slug}`}
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="specific"
        term={slug}
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
