---
title: notebooklm-py：为 Google NotebookLM 打造的全功能 Python API
date: 2026-03-18
description: 深入解析 notebooklm-py 项目：一个非官方的 Python 库，让你以程序化方式调用 NotebookLM 的全部功能
tags: [Python, NotebookLM, API, 工具]
---

## 简介

Google NotebookLM 是一款强大的 AI 研究助手，支持从多种来源（URL、PDF、YouTube、Google Drive）提取信息并生成播客、视频、测验等内容。但它的网页界面功能有限，而且无法批量操作。

今天要介绍的这个开源项目 —— **[notebooklm-py](https://github.com/teng-lin/notebooklm-py)**，让你可以通过 Python、CLI 甚至 AI 代理来程序化地调用 NotebookLM 的全部功能。目前已在 GitHub 获得 **6.2k 星标**。

## 核心功能

### 1. 全面的来源管理

支持添加多种来源：

- URL 网页
- YouTube 视频
- PDF、文本、Markdown、Word 文件
- Google Drive 文档
- 直接粘贴文本

### 2. 内容生成

除了网页界面已有的功能，还支持许多隐藏功能：

| 内容类型 | 说明 |
|---------|------|
| 音频概览 | 4 种格式（深度、简要、评论、辩论），支持 50+ 语言 |
| 视频概览 | 3 种格式，9 种视觉风格 |
| 幻灯片 | 详细或演讲者格式，支持 PPTX 下载 |
| 测验 / 闪卡 | 多种难度和格式（JSON、Markdown、HTML） |
| 思维导图 | 交互式分层可视化，可导出 JSON |
| 数据表 | 自然语言自定义结构，导出 CSV |
| 信息图表 | 3 种方向和详细程度 |

### 3. 研究代理

支持 Web 和 Google Drive 研究代理，可自动搜索并导入来源，构建可重复的研究流程。

### 4. 批量下载

这是网页界面不具备的能力 —— 可以批量下载所有生成的制品。

## 三种使用方式

### 1. Python API（推荐应用集成）

```python
import asyncio
from notebooklm import NotebookLMClient

async def main():
    async with await NotebookLMClient.from_storage() as client:
        # 创建笔记本并添加来源
        nb = await client.notebooks.create("Research")
        await client.sources.add_url(nb.id, "https://example.com", wait=True)

        # 与来源聊天
        result = await client.chat.ask(nb.id, "Summarize this")
        print(result.answer)

        # 生成播客并下载
        status = await client.artifacts.generate_audio(nb.id, instructions="make it fun")
        await client.artifacts.wait_for_completion(nb.id, status.task_id)
        await client.artifacts.download_audio(nb.id, "podcast.mp3")

asyncio.run(main())
```

### 2. CLI（快速任务和自动化）

```bash
# 认证
notebooklm login

# 创建笔记本并添加来源
notebooklm create "My Research"
notebooklm source add "https://en.wikipedia.org/wiki/Artificial_intelligence"

# 生成内容
notebooklm generate audio "make it engaging" --wait
notebooklm generate quiz --difficulty hard
notebooklm generate mind-map

# 下载制品
notebooklm download audio ./podcast.mp3
notebooklm download quiz --format markdown ./quiz.md
```

### 3. AI 代理集成

支持 Claude Code、Codex 等 LLM 代理的自然语言自动化：

```bash
# 安装技能
notebooklm skill install

# 或使用 npx
npx skills add teng-lin/notebooklm-py
```

## 应用场景

### 1. 学术研究

- 批量导入多篇论文 PDF
- 自动提取关键信息
- 生成研究摘要和测验

### 2. 内容创作

- 将博客文章转换为播客
- 生成视频讲解
- 创建教学幻灯片

### 3. 知识管理

- 将 YouTube 视频转为文字笔记
- 构建个人知识库
- 定期同步 Google Drive 文档

### 4. 教育辅助

- 批量生成课程测验
- 创建闪卡集
- 生成学习指南

## 安装

```bash
# 基本安装
pip install notebooklm-py

# 带浏览器登录支持
pip install "notebooklm-py[browser]"
playwright install chromium
```

## 注意事项

⚠️ 这是一个非官方库，使用未公开的 Google API，这些 API 可能在不通知的情况下发生变化。该项目与 Google 没有关联，仅供原型设计、研究和个人项目使用。

## 总结

notebooklm-py 为 NotebookLM 打开了新世界的大门 —— 无论是批量处理研究资料，还是将 AI 能力集成到自己的应用中，它都提供了灵活而强大的解决方案。如果你需要超越网页界面的限制，这款工具值得关注。
