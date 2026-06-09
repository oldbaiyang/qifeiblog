---
title: "OpenClaw养虾指南：从入门到精通"
date: "2026-03-10"
description: "一份 OpenClaw 入门指南，从安装配置、Slack渠道对接、Skill技能系统到全自动模式配置，手把手教你养好这只开源龙虾。"
tags: ["AI", "OpenClaw", "Agent", "开源", "教程"]
---

## 前言

OpenClaw 是一款开源的 AI 个人助手，运行在你自己的机器上，通过聊天应用（Slack、Telegram、WhatsApp、Discord 等）或 Web 控制面板与之交互。它能帮你处理邮件、管理日历、写代码、控制智能家居、抓取网页数据等——就像一个 24 小时在线的私人助理。

> 注：OpenClaw 的 logo 是一只龙虾，所以玩 OpenClaw 被社区称为「养虾」。

**相关链接**：
- 官网：https://openclaw.ai/
- GitHub：https://github.com/openclaw/openclaw
- 官方文档：https://docs.openclaw.ai/zh-CN/start/wizard

---

## 一、安装与配置

整个过程分 3 步：**安装 OpenClaw → 运行 onboard 向导 → 开始使用**。

### 1.1 安装 OpenClaw

**方式一：npm 安装（推荐）**

```bash
npm install -g openclaw
```

验证安装：

```bash
openclaw --version
```

看到版本号即安装成功。

**方式二：官方一键脚本**

macOS / Linux：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Windows PowerShell：

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

**方式三：从源码安装**

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm build
```

### 1.2 运行初始化向导

终端输入：

```bash
openclaw onboard
```

向导会交互式引导你完成所有配置，包括：AI 模型、聊天渠道、技能、Hooks、Gateway 服务安装等。

#### 步骤 1：安全提示

首先会显示安全警告，阅读后选择 **Yes** 继续。

#### 步骤 2：选择 Onboarding 模式

```
◇  Onboarding mode
│  QuickStart
```

选择 **QuickStart**（推荐），会自动配置网关端口（18789）、绑定地址（127.0.0.1）等默认设置。

#### 步骤 3：配置 AI 模型

选择 AI 模型提供商并输入 API Key：

| 提供商 | 获取 API Key | 备注 |
|--------|--------------|------|
| Anthropic Claude（推荐） | https://console.anthropic.com | 需国际信用卡 |
| OpenAI GPT | https://platform.openai.com | 需国际信用卡 |
| OpenRouter（中国大陆推荐） | https://openrouter.ai | 聚合多家模型，支持多种支付 |
| DeepSeek（中国大陆推荐） | https://platform.deepseek.com | 支持支付宝充值 |
| Moonshot / Kimi | https://platform.moonshot.cn | 支持国内支付 |
| 本地模型 | 支持 Ollama 等 | 免费，需本地算力 |

**中国大陆用户推荐方案**：

```bash
# 方案一：使用 DeepSeek（最简单）
◇  Model/auth provider
│  DeepSeek
│
◇  DeepSeek API key
│  （粘贴你的 DeepSeek API Key）
│
◇  Default model
│  deepseek/deepseek-chat
```

```bash
# 方案二：使用 OpenRouter（一个 Key 访问多家模型）
◇  Model/auth provider
│  OpenRouter
│
◇  OpenRouter API key
│  （粘贴你的 OpenRouter API Key）
│
◇  Default model
│  openrouter/anthropic/claude-opus-4-6
```

> [截图位置：AI模型配置界面]

#### 步骤 4：选择聊天渠道

```
◇  Select channel (QuickStart)
│  Slack (Socket Mode)
```

选择你要配置的渠道。如果暂时不需要，可以跳过（后续通过 `openclaw configure` 补充）。

---

## 二、配置 Slack 聊天渠道

以下以 **Slack** 为例，详细说明配置步骤。

### 2.1 创建 Slack App

1. 打开 [Slack API 控制台](https://api.slack.com/apps)
2. 点击 **Create New App** → 选择 **From scratch**
3. 输入 App 名称（如 `OpenClaw`），选择你的工作区
4. 点击 **Create App**

> [截图位置：Slack API 控制台创建App界面]

### 2.2 配置 Bot 权限

1. 在左侧菜单点击 **OAuth & Permissions**
2. 滚动到 **Bot Token Scopes**，添加以下权限：

| 权限 | 说明 |
|------|------|
| chat:write | 允许 Bot 发送消息 |
| channels:history | 读取公共频道消息历史 |
| channels:read | 访问公共频道信息 |
| groups:history | 读取私有频道消息历史 |
| im:history | 读取私聊消息历史 |
| mpim:history | 读取群组私聊消息历史 |
| users:read | 读取用户信息 |
| app_mentions:read | 读取 @提及消息 |
| reactions:read | 读取表情回应 |
| reactions:write | 添加表情回应 |
| files:read | 读取文件 |
| files:write | 上传文件 |

> [截图位置：OAuth & Permissions 权限配置界面]

### 2.3 配置 Socket Mode 和 Event Subscriptions

**Socket Mode**：
- 左侧菜单 → Socket Mode → 开启

**Event Subscriptions**：
- 左侧菜单 → Event Subscriptions → 开启
- 添加以下 Bot Events：
  - `app_mention`
  - `message.channels`
  - `message.groups`
  - `message.im`
  - `message.mpim`
  - `reaction_added`
  - `reaction_removed`

**App Home**：
- 左侧菜单 → App Home → 开启 **Messages Tab**
- 勾选 "Allow users to send Slash commands and messages from the messages tab"

**Slash Commands**：
- 添加 `/openclaw` 命令

### 2.4 安装到工作区并获取 Token

1. 滚动到页面顶部，点击 **Install to**
2. 在弹出的授权页面点击 **Allow**
3. 安装完成后，复制 **Bot User OAuth Token**（以 `xoxb-` 开头）

> [截图位置：安装成功后显示Token的界面]

### 2.5 获取 App 级别 Token

1. 左侧菜单点击 **Basic Information**
2. 滚动到 **App-Level Tokens** 区域
3. 点击 **Generate Token and Scopes**
4. 输入 Token 名称，添加 `connections:write` scope
5. 复制生成的 Token（以 `xapp-` 开头）

### 2.6 在向导中输入 Token

回到 `openclaw onboard` 向导：

```
◇  Enter Slack bot token (xoxb-...)
│  （粘贴 Bot Token）
│
◇  Enter Slack app token (xapp-...)
│  （粘贴 App Token）
```

### 2.7 配置频道访问权限

```
◇  Configure Slack channels access?
│  Yes
│
◇  Slack channels access
│  Allowlist (recommended)
│
◆  Slack channels allowlist (comma-separated)
│  #general, #projects（或留空）
```

| 提示 | 怎么填 |
|------|--------|
| Configure Slack channels access? | 选 Yes |
| Slack channels access | 选 Allowlist (recommended) |
| Slack channels allowlist | 填入允许 Bot 响应的频道，逗号分隔 |

> allowlist 支持三种格式：`#频道名`、`频道名`、`频道ID`（如 `C123456`）

### 2.8 配置技能（Skills）

```
◇  Skills status ────────────╮
│                            │
│  Eligible: 7               │
│  Missing requirements: 42  │
│  Blocked by allowlist: 0   │
│                            │
├────────────────────────────┯
│
◇  Configure skills now? (recommended)
│  Yes
```

向导会逐一询问是否配置各技能的 API Key：

```
◇  Set GOOGLE_PLACES_API_KEY for goplaces?     → No（没有就跳过）
◇  Set GEMINI_API_KEY for nano-banana-pro?      → No
◇  Set NOTION_API_KEY for notion?               → No
◇  Set OPENAI_API_KEY for openai-image-gen?     → No
```

> 这些 API Key 都是可选的，没有的话全部选 **No** 跳过即可。

### 2.9 配置 Hooks（自动化钩子）

```
◇  Hooks ──────────────────────────────────────────────────────────╮
│                                                                  │
│  Hooks let you automate actions when agent commands are issued.  │
│  Example: Save session context to memory when you issue /new.    │
│                                                                  │
├──────────────────────────────────────────────────────────────────┯
│
◇  Enable hooks?
│  🚀 boot-md, 📝 command-logger, 💾 session-memory
```

建议**全部启用**：

| Hook | 作用 |
|------|------|
| boot-md | 启动时加载引导信息 |
| command-logger | 记录命令日志 |
| session-memory | 保存会话上下文到记忆 |

### 2.10 安装 Gateway 服务

向导会自动完成：

1. **Systemd 配置**（仅 Linux）：启用 systemd lingering
2. **Gateway 服务安装**：自动安装 systemd 服务

```
◇  Gateway service installed.
```

安装完成后，向导会自动验证 Slack 连接：

```
Slack: ok (2180ms)
Agents: main (default)
```

看到 `Slack: ok` 表示连接成功 ✅

### 2.11 访问 Web 控制面板

```
◇  Control UI ─────────────────────────────────────────────────────╮
│                                                                  │
│  Web UI: http://127.0.0.1:18789/                                 │
│  Web UI (with token): http://127.0.0.1:18789/#token=xxxxx        │
│  Gateway WS: ws://127.0.0.1:18789                                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┯
```

记住这个地址，后续可以通过浏览器访问 Web 控制面板。

### 2.12 孵化 Bot（Hatch）

最后一步，选择如何首次启动 Bot：

```
◇  How do you want to hatch your bot?
│  ● Hatch in TUI (recommended)
│  ○ Open the Web UI
│  ○ Do this later
```

| 选项 | 说明 |
|------|------|
| Hatch in TUI (recommended) | 直接在终端进入交互式 TUI 界面 |
| Open the Web UI | 打开浏览器 Web 控制面板 |
| Do this later | 跳过，以后再做 |

选择 **Hatch in TUI** 后，会自动进入终端聊天界面：

```
openclaw tui - ws://127.0.0.1:18789 - agent main - session main

Wake up, my friend!
```

Bot 会发送 "Wake up, my friend!" 作为第一条消息。你可以开始和它对话，告诉它你的需求和偏好——**描述越详细，后续体验越好**。

---

## 三、权限配置：开启全自动模式

默认安装后，OpenClaw 很多操作需要手动确认。只需一步配置即可解锁全自动模式。

### 3.1 编辑配置文件

编辑 `~/.openclaw/config.json`，粘贴以下配置：

```json
{
  "agents": {
    "defaults": {
      "sandbox": { "mode": "off" }
    }
  },
  "tools": {
    "exec": {
      "security": "full",
      "ask": "off"
    },
    "elevated": {
      "enabled": true,
      "allowFrom": {
        "slack": ["你的 Slack 用户 ID"]
      }
    }
  }
}
```

**如何获取 Slack 用户 ID**：

1. 打开 Slack → 点击左上角你的头像 → **Profile**
2. 点击右侧 **⋮** 更多按钮 → **Copy member ID**
3. 得到的 `U0XXXXXXX` 格式字符串就是你的 ID

> [截图位置：Slack 获取用户ID界面]

配置后重启 Gateway：

```bash
openclaw gateway restart
```

**效果**：OpenClaw 可以在你的机器上自主执行任何操作，不再弹审批提示。

> ⚠️ 此配置仅适合**个人设备**。如果是共享服务器，参考官方安全文档做更细粒度的配置。

---

## 四、使用场景示例

### 场景 1：日常对话和问答

```
你：今天北京天气怎么样？
OpenClaw：北京今天晴，气温 -2°C ~ 8°C，北风 3-4 级...

你：帮我用中文总结一下这篇文章 https://example.com/article
OpenClaw：这篇文章主要讲了三个要点：1)... 2)... 3)...
```

### 场景 2：执行 Shell 命令和写代码

```
你：帮我看一下当前目录有哪些文件，按大小排序
OpenClaw：（自动执行 ls -lhS 命令，返回结果）

你：写一个 Python 脚本，把当前目录下所有 .jpg 文件批量重命名
OpenClaw：（自动创建脚本文件）
要我直接运行它吗？

你：运行吧
OpenClaw：已完成，共重命名了 23 个文件。
```

### 场景 3：邮件管理

```
你：帮我检查一下 Gmail 里有没有未读的重要邮件
OpenClaw：你有 3 封未读邮件：
1. 来自 boss@company.com - "Q1 预算审批"（2小时前）
2. 来自 hr@company.com - "年假余额提醒"（5小时前）
3. 来自 client@example.com - "合同确认"（昨天）

你：帮我回复第一封，说"收到，我会在今天下午 5 点前提交修改版本"
OpenClaw：邮件已发送 ✅
```

### 场景 4：通过 Slack 远程控制

```
你（在 Slack 中）：帮我看一下服务器的 CPU 和内存使用率
OpenClaw：当前服务器状态：
- CPU: 23%
- 内存: 4.2 GB / 16 GB (26%)
- 磁盘: 120 GB / 500 GB (24%)
一切正常 ✅

你（在 Slack 中）：帮我重启一下 nginx
OpenClaw：已执行 sudo systemctl restart nginx ✅
nginx 已重启，状态正常。
```

---

## 五、常用命令速查

| 命令 | 说明 |
|------|------|
| `openclaw onboard` | 初始化配置向导 |
| `openclaw tui` | 打开终端聊天界面（TUI） |
| `openclaw dashboard` | 打开 Web 控制面板 |
| `openclaw doctor` | 诊断系统环境 |
| `openclaw status` | 查看运行状态 |
| `openclaw configure` | 修改配置（API Key、渠道等） |
| `openclaw update` | 更新到最新版本 |
| `openclaw logs` | 查看运行日志 |
| `openclaw hooks list` | 查看所有 Hooks |
| `openclaw hooks enable <name>` | 启用指定 Hook |
| `openclaw hooks disable <name>` | 禁用指定 Hook |
| `openclaw security audit --deep` | 深度安全审计 |
| `openclaw daemon install` | 安装后台守护进程 |
| `openclaw daemon uninstall` | 卸载后台守护进程 |

---

## 六、部署方案对比

| 方案 | 优点 | 缺点 | 适合人群 |
|------|------|------|----------|
| **本地部署** | 免费、隐私好 | 需要硬件资源 | 有开发能力的人 |
| **Mac mini** | 性价比高、稳定 | 需要购买设备 | 长期使用者 |
| **云服务器** | 随时访问、弹性 | 持续费用 | 团队协作 |
| **阿里云一键部署** | 零命令、5分钟搞定 | 数据在云端 | 零基础用户 |

---

## 七、安全问题与避坑指南

### 主要风险

1. **数据泄露**：配置不当可能暴露敏感信息
2. **权限过大**：Agent 可能执行危险操作
3. **成本失控**：API 调用费用可能超预期

### 避坑建议

1. **最小权限原则**：只给 Agent 必要的权限
2. **设置费用上限**：API 账号设置月度限额
3. **敏感信息隔离**：重要密钥不要写入配置文件
4. **定期审计**：检查 Agent 的操作日志

---

## 总结

OpenClaw 代表了 AI Agent 的未来方向：**从被动回答到主动执行**。

如果你还没用过，建议从本地部署开始尝试。装好之后，先从简单的对话玩起，慢慢体会 Agent 的能力边界。

记住：**养虾是个技术活，多动手才能养好**。

---

## 相关链接

- 官网：https://openclaw.ai/
- GitHub：https://github.com/openclaw/openclaw
- 官方文档：https://docs.openclaw.ai/zh-CN/start/wizard
- 中文社区：https://clawcn.net/install/
- 视频教程：[OpenClaw养虾指南](https://www.youtube.com/watch?v=MAJ5BApYQT0)
