import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于",
  description: SITE_DESCRIPTION,
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Sidebar />
      <main>
        <header className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            关于
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            这个博客写什么、怎么写。
          </p>
        </header>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            这里是 <strong>qifeiblog</strong>，
            记录我在折腾技术过程中留下的笔记和心得。
          </p>
          <h2>写些什么</h2>
          <ul>
            <li>AI 工具：本地 LLM 部署、Agent 编排、提示词工程</li>
            <li>效率工具：CLI 脚本、自动化工作流</li>
            <li>Cloudflare / 自托管：Pages、Workers、R2、D1 实战</li>
            <li>开源生态观察：值得关注的 GitHub 项目</li>
          </ul>
          <h2>怎么写</h2>
          <p>
            用 Obsidian 在本地写稿，跑 <code>./publish.sh --push</code>{" "}
            同步到 <code>content/posts/</code>，触发静态构建，最后 push 到
            远端、Cloudflare Pages 自动部署。
          </p>
          <p>
            如果你也有兴趣折腾这些，欢迎{" "}
            <a href="mailto:hi@qifeiblog.com">邮件交流</a>，或在{" "}
            <a href="https://github.com/oldbaiyang">GitHub</a> 上找我。
          </p>
        </div>
      </main>
    </div>
  );
}
