# qifeiblog

个人技术博客 — Next.js 16 + React 19 + 静态导出（SSG），部署在 Cloudflare Pages。

## 内容工作流

文章用 Obsidian 写，源文件位置：

- 主写作目录：`/Users/zcy/dev/github/obsidian_vault/qifeiblog/`
- 草稿区：`/Users/zcy/dev/github/obsidian_vault/004-发布/qifeiblog/`
- 模板：`/Users/zcy/dev/github/obsidian_vault/005-模板/blog-post.md`

文章 frontmatter 约定（4 字段）：

```yaml
---
title: "标题"
date: "2026-01-29"
description: "一句话摘要"
tags: [AI, 教程]
---
```

`description` 留为 `这里写摘要` 或 date 含 `{{...}}` 占位符的草稿会被 `publish.sh` 自动移到 `content/.incomplete/`，**不会**被构建。

## 常用命令

```bash
# 开发
npm run dev                 # localhost:3000，HMR

# 内容同步
./publish.sh                # 同步 vault -> content/posts/ + build
./publish.sh --push         # 同步 + build + git commit + git push
./publish.sh --no-build     # 只同步，不 build（调试用）

# 质量
npm run lint                # eslint
npm run typecheck           # tsc --noEmit

# 部署
./scripts/deploy.sh            # sync vault + build + wrangler pages deploy
./scripts/deploy.sh --push     # deploy 完成后 git push origin main
```

## 目录结构

```
src/
├── app/                    # App Router 路由
│   ├── posts/[slug]/       # 文章详情（SSG）
│   ├── tags/               # 标签索引 + 标签详情
│   ├── rss.xml/route.ts    # RSS 2.0 feed
│   ├── sitemap.ts          # sitemap.xml
│   └── robots.ts           # robots.txt
├── components/             # 客户端组件、UI 原子
├── lib/                    # 数据访问、Markdown 渲染、slug、feed
└── types/                  # 类型定义

content/
├── posts/                  # 同步进来的 .md 文章（git 跟踪）
└── .incomplete/            # frontmatter 不全的草稿（git 忽略）

scripts/
├── deploy.sh               # 一键部署到 CF Pages（读 .env.local 的 CF secrets）
└── prebuild.mjs            # 生成 rss.xml / sitemap.xml / robots.txt 到 public/
```

## 部署

构建产物在 `out/`，推送到 Cloudflare Pages：

```bash
./scripts/deploy.sh            # 一键：sync vault + build + wrangler pages deploy
./scripts/deploy.sh --push     # deploy 完成后 git push origin main
```

Secrets（`CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`）放在 `.env.local`（git ignored），脚本会自动 export 给 wrangler。其它环境变量（`NEXT_PUBLIC_*`）不传给 wrangler，避免泄漏。

或手工：在 Cloudflare Dashboard 创建 Pages 项目，绑 GitHub repo，**build command 留空**、**output 选 `out`**、`output 目录` 用项目根的 `out`。

## 环境变量

复制 `.env.example` 到 `.env.local`：

- `NEXT_PUBLIC_SITE_URL` — 站点 URL（用于 canonical / og:url / RSS）
- `NEXT_PUBLIC_GISCUS_*` — Giscus 评论（[giscus.app](https://giscus.app) 配置后填入）

不配置 Giscus 也能跑，文章页底部评论区会被跳过。

## 写作约定

博客文章应：

- 标题简洁、信息密度高
- `description` 1-2 句话，说清楚读完能获得什么
- tags 数组，混合中英文均可
- 代码块标注语言（` ```ts `、` ```bash `）
- 正文用 H2 `##` 起步，H1 由模板渲染

## 相关项目

- 姐妹项目 [`qifeibook`](../qifeibook) — 棋飞书库，Cloudflare Workers + D1，**架构完全不同**
- 写作环境 [Obsidian vault](../obsidian_vault)
