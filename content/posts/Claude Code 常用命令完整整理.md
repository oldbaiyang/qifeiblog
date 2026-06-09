---
title: "Claude Code 常用命令完整整理"
date: "2026-03-23"
description: "本文整理了 Claude Code 命令行工具的完整命令参考，包括终端启动命令、斜杠命令、快捷键和实用技巧，帮助你更高效地使用 AI 编程助手。"
tags: ["AI工具", "Claude", "效率工具"]
---

如果你正在使用 Claude Code（claude.ai/code）这款 AI 编程助手，本文将为你整理一份完整的命令参考。从终端启动到会话内操作，从斜杠命令到实用技巧，涵盖你日常使用所需的一切。

## 一、终端启动命令

这些命令在进入 Claude Code 会话**之前**使用，直接在终端中执行：

| 命令 | 说明 |
|------|------|
| `claude` | 启动交互式会话 |
| `claude "你的问题"` | 带初始提示启动，直接开始对话 |
| `claude -c` | 恢复上次会话，保留上下文，无需重新解释 |
| `claude -p "提示"` | Print 模式：执行一次后退出，适合脚本集成 |
| `claude --dangerously-skip-permissions` | 跳过所有权限确认（仅在可信容器环境中使用）|

**安装方式：**

```bash
npm install -g @anthropic-ai/claude-code
```

## 二、会话内斜杠命令

在 Claude Code 会话中，以 `/` 开头的命令用于控制工具行为，例如清除历史、压缩上下文等。

### 上下文管理

| 命令 | 说明 |
|------|------|
| `/clear` | 清空对话历史，重新开始（切换任务时强烈推荐） |
| `/compact` | 压缩旧的上下文但不丢弃，可指定保留内容，如 `/compact retain the error handling patterns`。一般在上下文使用超过 80% 时使用，切换任务时用 `/clear` |
| `/context` | 查看当前上下文用量 |

### 项目与记忆

| 命令 | 说明 |
|------|------|
| `/init` | 在项目根目录生成 `CLAUDE.md`，用于存储架构说明、编码规范等项目记忆 |
| `/memory` | 打开 `CLAUDE.md` 进行编辑，存放跨会话持续生效的项目约定 |

### 模式与设置

| 命令 | 说明 |
|------|------|
| `/model` | 切换模型（Sonnet、Haiku、Opus），无需打开完整设置 |
| `/config` | 打开设置界面 |
| `/permissions` | 查看和修改工具权限 |
| `/plan` | 进入计划模式，先分析再执行（避免直接修改代码） |
| `/help` | 显示所有可用斜杠命令，包括自定义命令和 MCP 服务器命令 |

### GitHub 集成

| 命令 | 说明 |
|------|------|
| `/install-github-app` | 安装后 Claude 会自动 review 你的 PR，适合 AI 工具增加 PR 数量后的质量保障 |

## 三、会话内特殊语法

在提示中可以使用特殊语法来增强交互：

- **`@` 引用文件或目录**：与其说"找 auth 文件"，不如直接写 `@./src/auth.ts`，让 Claude 精准定位
- **`!` 前缀执行 shell 命令**：例如 `!npm test`，直接执行终端命令

## 四、快捷键

按 `Shift+Tab` 可循环切换三种模式：

- **普通模式** — 默认模式
- **自动接受模式** — 自动接受建议的更改
- **计划模式** — 先分析再执行

当前模式显示在提示符下方，方便你随时了解当前状态。

## 五、实用技巧

### `#` 快速添加记忆

在提示开头输入 `#`，例如：

```
# Use 2-space indentation for JS files
```

这条内容会直接追加到 `CLAUDE.md`，无需手动编辑，方便跨会话记住你的编码偏好。

### 自定义斜杠命令

在项目中创建 `.claude/commands/` 目录，以 `.md` 文件名作为命令名，用自然语言编写内容，用 `$ARGUMENTS` 接收参数，即可用 `/命令名` 调用。

例如，创建 `.claude/commands/deploy.md`：

```markdown
部署当前项目到生产环境。

$ARGUMENTS
```

创建后即可用 `/deploy` 调用。

### 上下文引用

使用 `@` 引用文件或目录是最精准的交互方式。例如不要只说"找 auth 文件"，而是直接写 `@src/auth.ts`，Claude 会立即定位到该文件。

## 结语

Claude Code 是一款功能强大的 AI 编程助手，掌握这些命令能让你事半功倍。建议收藏本文作为参考，也欢迎分享给有需要的同学。

完整 CLI 参考可查看官方文档：[code.claude.com/docs/en/cli-reference](https://code.claude.com/docs/en/cli-reference)
