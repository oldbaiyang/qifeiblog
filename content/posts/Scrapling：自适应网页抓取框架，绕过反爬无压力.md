---
title: "Scrapling：自适应网页抓取框架，绕过反爬无压力"
date: "2026-03-09"
description: "一个强大的 Python 网页抓取框架，能自动适应网站结构变化，内置反爬绕过能力，支持从单页请求到大规模爬虫的完整解决方案。"
tags: ["Python", "爬虫", "开源", "工具"]
---

## 前言

做网页爬虫最头疼的是什么？一是网站结构变了，选择器全废；二是遇到 Cloudflare 这类反爬，直接被拦。**Scrapling** 这两个问题都能解决。

它是一个自适应的网页抓取框架，能自动追踪网站变化重新定位元素，内置反爬绕过能力，还能从单页请求扩展到大规模爬虫。一个库，全部搞定。

## 核心功能

### 1. 自适应抓取

网站改版了？选择器还能用。Scrapling 会学习元素特征，在网站结构变化后自动重新定位：

```python
from scrapling.fetchers import StealthyFetcher

StealthyFetcher.adaptive = True
page = StealthyFetcher.fetch('https://example.com', headless=True)

# 首次抓取时保存元素特征
products = page.css('.product', auto_save=True)

# 网站改版后，adaptive=True 自动找到对应元素
products = page.css('.product', adaptive=True)
```

### 2. 反爬绕过

`StealthyFetcher` 能直接绑过 Cloudflare Turnstile、人机验证等反爬机制：

```python
from scrapling.fetchers import StealthyFetcher, StealthySession

# 一次性请求
page = StealthyFetcher.fetch('https://nopecha.com/demo/cloudflare')
data = page.css('#padded_content a').getall()

# 会话模式（保持浏览器打开）
with StealthySession(headless=True, solve_cloudflare=True) as session:
    page = session.fetch('https://nopecha.com/demo/cloudflare')
    data = page.css('#content').getall()
```

### 3. 完整爬虫框架

类似 Scrapy 的 API，支持并发、暂停/恢复、多会话类型：

```python
from scrapling.spiders import Spider, Response

class QuotesSpider(Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/"]
    concurrent_requests = 10

    async def parse(self, response: Response):
        for quote in response.css('.quote'):
            yield {
                "text": quote.css('.text::text').get(),
                "author": quote.css('.author::text').get(),
            }

        # 翻页
        next_page = response.css('.next a')
        if next_page:
            yield response.follow(next_page[0].attrib['href'])

result = QuotesSpider().start()
result.items.to_json("quotes.json")
```

**暂停和恢复**：长时间爬虫可以随时暂停，下次继续：

```python
# 启用检查点
QuotesSpider(crawldir="./crawl_data").start()
# 按 Ctrl+C 暂停，下次运行自动恢复
```

### 4. 多种 Fetcher 类型

| Fetcher | 用途 |
|---------|------|
| `Fetcher` | 快速 HTTP 请求，可伪装浏览器 TLS 指纹 |
| `StealthyFetcher` | 隐身模式，绕过反爬 |
| `DynamicFetcher` | 完整浏览器自动化，处理 JS 渲染页面 |

```python
from scrapling.fetchers import Fetcher, DynamicFetcher

# 快速 HTTP 请求
page = Fetcher.get('https://example.com')

# 完整浏览器（处理 JS）
page = DynamicFetcher.fetch('https://example.com', headless=True, network_idle=True)
```

### 5. 丰富的选择器

支持多种选择方式：

```python
page = Fetcher.get('https://example.com')

# CSS 选择器
quotes = page.css('.quote')

# XPath
quotes = page.xpath('//div[@class="quote"]')

# BeautifulSoup 风格
quotes = page.find_all('div', class_='quote')

# 文本搜索
quotes = page.find_by_text('quote', tag='div')
```

### 6. AI 集成（MCP Server）

内置 MCP Server，可以给 Claude、Cursor 等 AI 工具使用，让 AI 帮你抓网页：

```bash
pip install "scrapling[ai]"
```

## 安装

```bash
# 基础安装（仅解析器）
pip install scrapling

# 完整安装（包含 fetchers 和浏览器）
pip install "scrapling[fetchers]"
scrapling install

# 安装全部功能
pip install "scrapling[all]"
scrapling install
```

**Docker 方式**：

```bash
docker pull pyd4vinci/scrapling
```

## CLI 命令行

不用写代码也能抓网页：

```bash
# 启动交互式 shell
scrapling shell

# 直接提取网页内容到文件
scrapling extract get 'https://example.com' content.md
scrapling extract get 'https://example.com' content.txt --css-selector '#main'

# 绕过反爬提取
scrapling extract stealthy-fetch 'https://example.com' output.html --solve-cloudflare
```

## 性能对比

Scrapling 的解析器性能非常出色：

**文本提取速度测试（5000个嵌套元素）**：

| 排名 | 库 | 时间 (ms) | 对比 |
|------|------|-----------|------|
| 1 | Scrapling | 2.02 | 1.0x |
| 2 | Parsel/Scrapy | 2.04 | 1.01x |
| 3 | Raw Lxml | 2.54 | 1.26x |
| 4 | PyQuery | 24.17 | ~12x |
| 5 | BS4 with Lxml | 1584.31 | ~784x |

## 高级功能

### 多会话类型混合使用

在一个爬虫里混用快速请求和隐身浏览器：

```python
from scrapling.spiders import Spider
from scrapling.fetchers import FetcherSession, AsyncStealthySession

class MultiSessionSpider(Spider):
    def configure_sessions(self, manager):
        manager.add("fast", FetcherSession(impersonate="chrome"))
        manager.add("stealth", AsyncStealthySession(headless=True), lazy=True)

    async def parse(self, response):
        for link in response.css('a::attr(href)').getall():
            if "protected" in link:
                yield Request(link, sid="stealth")  # 反爬页面用隐身模式
            else:
                yield Request(link, sid="fast")      # 普通页面快速请求
```

### 代理轮换

```python
from scrapling.fetchers import ProxyRotator

rotator = ProxyRotator([
    "http://proxy1:8080",
    "http://proxy2:8080",
])

# 自动轮换代理
```

## 相关链接

- GitHub: [https://github.com/D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling)
- 文档: [https://scrapling.readthedocs.io](https://scrapling.readthedocs.io)

## 总结

Scrapling 解决了网页抓取的三大痛点：

1. **网站结构变化**：自适应选择器自动重新定位元素
2. **反爬机制**：内置 Cloudflare 等主流反爬绕过能力
3. **规模扩展**：从单页请求到大规模爬虫，一套 API 全搞定

如果你经常需要抓取网页数据，这个库值得收藏。
