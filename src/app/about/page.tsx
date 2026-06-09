import type { Metadata } from "next";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于",
  description: SITE_DESCRIPTION,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-foreground text-3xl font-bold tracking-tight">关于</h1>
      <div className="prose dark:prose-invert mt-6 max-w-none">
        <p>这是个人技术博客，主要记录：</p>
        <ul>
          <li>AI 工具与本地 LLM 部署</li>
          <li>效率工具与自动化</li>
          <li>Cloudflare / 自托管实践</li>
          <li>开源生态观察</li>
        </ul>
        <p>写作工具：Obsidian → 本仓库 → Cloudflare Pages。</p>
      </div>
    </div>
  );
}
