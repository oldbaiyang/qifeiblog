# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目

qifeiblog — 个人技术博客，**Next.js 16 + React 19 + 静态导出（SSG）**，部署在 **Cloudflare Pages**。

与同名姐妹项目 [`qifeibook`](../qifeibook)（Cloudflare Workers + D1，棋飞书库）**架构完全不同，不可混用**。

## 内容来源

不在本仓库编辑。文章用 Obsidian 写，仓库只同步 + 构建：

- 主写作目录：`/Users/zcy/dev/github/obsidian_vault/qifeiblog/`
- 草稿区：`/Users/zcy/dev/github/obsidian_vault/004-发布/qifeiblog/`
- 模板：`/Users/zcy/dev/github/obsidian_vault/005-模板/blog-post.md`（4 字段 frontmatter：`title` / `date` / `description` / `tags`）

发布流程：`./publish.sh` 把 vault 同步到 `content/posts/`、`npm run build` 产出 `out/`、可选 `--push` 自动 git push。

## 关键约定

- **Next.js 16**：Turbopack 是默认；`params` 是 Promise 必须 `await`；`next lint` 已删除，**`npm run lint` 用的是 `eslint` CLI**。
- **`output: 'export'`** 已开：产物在 `out/`，**不支持** middleware、ISR、Server Actions、`next/image` 优化（已配 `images.unoptimized: true`）。
- **slug 保留中文**：`encodeURIComponent(文件名)`，URL 形如 `/posts/用AI写了个博客网站/`。
- **shiki 双主题**：`rehype-pretty-code` 用 `{ light: 'github-light', dark: 'github-dark-dimmed' }`，`globals.css` 里 CSS 变量在 `.dark` 切换。
- **未完成草稿过滤**：`description === "这里写摘要"` 或 `date` 含 `{{...}}` 的文章，`publish.sh` 自动移到 `content/.incomplete/`（git 忽略）且**不会构建**。

## 常用命令

```bash
npm run dev                 # localhost:3000
npm run build               # 静态导出到 out/
npm run lint                # eslint
npm run typecheck           # tsc --noEmit

./publish.sh                # vault 同步 + build
./publish.sh --push         # 同步 + build + git commit + git push
./publish.sh --no-build     # 只同步（调试用）
```

## 目录地图

```
src/
├── app/
│   ├── posts/[slug]/page.tsx    # 文章详情（SSG，params 是 Promise）
│   ├── tags/                    # /tags 与 /tags/[tag]
│   ├── rss.xml/route.ts         # RSS 2.0 feed
│   ├── sitemap.ts               # sitemap.xml
│   ├── robots.ts                # robots.txt
│   └── layout.tsx               # 根布局，包裹 <ThemeProvider> + Header/Footer
├── components/                  # 服务端/客户端组件
│   ├── SiteHeader.tsx / SiteFooter.tsx
│   ├── PostCard.tsx / PostMeta.tsx / TagPill.tsx
│   ├── ThemeProvider.tsx / ThemeToggle.tsx   # 客户端
│   ├── CodeCopyButton.tsx       # 客户端，mount 时给 <pre> 注入复制按钮
│   ├── Comments.tsx             # 客户端，Giscus 包装
│   └── ui/                      # Button / Badge（手写 Tailwind，未引 shadcn 运行时）
├── lib/
│   ├── posts.ts                 # 核心数据层（getAllPostMetas / getAllPosts / getPostBySlug / getAllTags / getPostsByTag）
│   ├── markdown.ts              # unified 管线：remark-parse → gfm → rehype → slug/pretty-code/external-links → stringify
│   ├── feed.ts                  # buildRssXml（手写 RSS 2.0）
│   ├── slug.ts                  # fileToSlug / slugToFile
│   ├── site.ts                  # SITE_URL / SITE_TITLE / SITE_DESCRIPTION
│   └── utils.ts                 # cn()
├── types/post.ts                # PostMeta / Post

content/
├── posts/                       # publish.sh 同步目标（git 跟踪）
└── .incomplete/                 # frontmatter 不全的草稿（git 忽略）

publish.sh                       # vault → content/posts + npm run build + 可选 git push
next.config.ts                   # output: 'export' / trailingSlash / images.unoptimized
```

## 修改文章/路由时的检查清单

1. 改 `src/lib/posts.ts` 字段 → 检查 `src/types/post.ts`、`src/components/PostCard.tsx`、`PostMeta.tsx`、`src/app/posts/[slug]/page.tsx` 是否仍类型对齐。
2. 新增路由 → 若涉及动态段 `params`，**必须 `await params`**（Next 16）。
3. 新增 Markdown 处理插件 → `src/lib/markdown.ts` 的 `unified()` 链。
4. 改 frontmatter schema → 同步 `src/lib/posts.ts` 的 `RawFrontmatter`、obsidian 模板 `005-模板/blog-post.md`、README 写作约定。
5. 改颜色/暗色 → 改 `src/app/globals.css` 的 `:root` 与 `.dark` OKLCH 变量。

## 回复语言

**始终用中文**回答用户（用户明确要求，memory `respond-in-chinese.md`）。
