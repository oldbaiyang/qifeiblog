# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目

qifeiblog — 个人技术博客，**Next.js 16 + React 19 + 静态导出（SSG）**，部署在 **Cloudflare Pages**。

生产域名 `https://blog.aqifei.top`（Pages 项目 `qifeiblog`）。

- Pages 原生 URL：`https://qifeiblog.pages.dev`
- 自定义域：`aqifei.top` zone（CF 账户下）→ CNAME `blog → qifeiblog.pages.dev`（`proxied: true`），CF 自动颁发 Google CA SSL
- DNS 操作走 CF API（账户 ID `5bc463c69...`，不是 venv env）；首次绑定子域名需要 Pages 项目 + CNAME 都在同一账户下

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
- **slug 全链路 raw**：slug = 文件名原样（中文/空格/冒号都保留，无编码）。文件系统目录（`out/posts/用AI写了个博客网站/`）、`<Link href>`、`generateStaticParams` 都用 raw slug；URL 在浏览器地址栏显示为 `/posts/用AI写了个博客网站/`（浏览器自动 percent-encode 显示，但 wire-level 路径是 raw UTF-8）。
  - **`getPostBySlug` 双形式 fallback**（`src/lib/posts.ts`）：外部 percent-encoded 链接（来自 RSS、Twitter、其他爬虫）到达时，先试字面再试 decode → 都能找到 `.md` 文件。安全网，不动。
  - **`generateMetadata` 用 encoded**（`src/app/posts/[slug]/page.tsx:23`）：`og:url` 和 `<link rel="canonical">` 保留 `encodeURIComponent(post.slug)`，让社交/SEO 爬虫拿到稳定的 percent-encoded URL。
  - **为什么不能 encoded 在文件系统**：CF Pages 静态服务**自动解码 URL path** 后做文件查找。如果 `generateStaticParams` 返回 encoded slug → `out/posts/%E5%85%8D.../` 目录是字面 `%` 字符 → CF Pages 解码请求 `/posts/%E5%85%8D.../` 为 `/posts/免费.../` → 找不到中文目录 → **404**。曾踩此坑（commit `1997ab2` 误诊为 "missing param in generateStaticParams" dev 报错，实则 Next.js 16 源码里没这错误字符串）。
- **`scripts/prebuild.mjs` 必须用 `node --env-file=.env.local`**：plain Node 不自动加载 `.env.local`，所以 `NEXT_PUBLIC_SITE_URL` 会 fallback 到 `https://qifeiblog.com`。`package.json` prebuild script 已用 `node --env-file=.env.local scripts/prebuild.mjs`（Node 20.6+ / Node 24 验证）。
- **shiki 双主题**：`rehype-pretty-code` 用 `{ light: 'github-light', dark: 'github-dark-dimmed' }`，`globals.css` 里 CSS 变量在 `.dark` 切换。
- **未完成草稿过滤**：`description === "这里写摘要"` 或 `date` 含 `{{...}}` 的文章，`publish.sh` 自动移到 `content/.incomplete/`（git 忽略）且**不会构建**。
- **gray-matter YAML `date`** 自动解析成 JS `Date` 对象，`src/lib/posts.ts` 和 `scripts/prebuild.mjs` 都做了 `instanceof Date` 归一化。
- **RSS / sitemap / robots 用 prebuild 脚本**：`output: 'export'` 与 Next 16 metadata 路由（`sitemap.ts` / `robots.ts` / `rss.xml/route.ts`）不兼容，构建报 `force-static not configured`。改用 `scripts/prebuild.mjs` 生成静态文件到 `public/`，由 `npm run prebuild` 在 build 之前触发。

## 常用命令

```bash
npm run dev                 # localhost:3000
npm run build               # 静态导出到 out/
npm run lint                # eslint
npm run typecheck           # tsc --noEmit

./publish.sh                # vault 同步 + build
./publish.sh --push         # 同步 + build + git commit + git push
./publish.sh --no-build     # 只同步（调试用）

./scripts/deploy.sh            # 一键：sync + build + wrangler pages deploy
./scripts/deploy.sh --no-build # 跳过 build，直接 deploy out/
./scripts/deploy.sh --push     # deploy 完后 git push origin main
```

## 部署

CF Pages 项目名 `qifeiblog`（已创建）。`./scripts/deploy.sh` 是首选入口，内部流程：

1. 从 `.env.local`（git ignored）读取 `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN`
2. `./publish.sh` 同步 vault + build 出 `out/`
3. `npx wrangler pages deploy out --project-name=qifeiblog --branch=main`

CF token 用 User API Token（不是 Account API Token），从 CF Dashboard → My Profile → API Tokens 生成，需要 Pages Edit 权限。脚本只 export `CLOUDFLARE_*` 给 wrangler，不泄漏 `NEXT_PUBLIC_*`（Giscus 等）。

**首次部署新 CF 账户**：
```bash
npx wrangler pages project create qifeiblog --production-branch=main
./scripts/deploy.sh
```

**绑定自定义子域名**（已用于 `blog.aqifei.top`）：
```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/qifeiblog/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"blog.aqifei.top"}'
# 然后在父 zone 加 CNAME blog -> qifeiblog.pages.dev (proxied=true)
```

CF 自动验证所有权（同账户 zone）+ 颁发 Google CA SSL 证书，状态从 `pending` → `active` 通常 1-5 分钟。

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
scripts/deploy.sh                # 一键部署到 CF Pages（读 .env.local secrets）
scripts/prebuild.mjs             # RSS/sitemap/robots 生成（plain Node + --env-file）
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
