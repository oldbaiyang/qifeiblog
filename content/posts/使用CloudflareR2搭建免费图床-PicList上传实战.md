---
title: "使用 Cloudflare R2 对象存储搭建免费图床（PicList 上传实战）"
date: "2026-03-19"
description: "详细介绍如何利用 Cloudflare R2 免费的对象存储服务搭建个人图床，并使用 PicList 客户端通过 S3 兼容 API 上传图片，支持自定义域名访问。"
tags:
  - Cloudflare
  - R2
  - 图床
  - PicList
  - 对象存储
---

# 使用 Cloudflare R2 对象存储搭建免费图床（PicList 上传实战）

很多博主在写文章时都会遇到图床的选择问题：要么依赖第三方图床（稳定性难以保证），要么购买对象存储服务（费用不容小觑）。

今天给大家介绍一个**免费且稳定**的解决方案——**Cloudflare R2 对象存储**，配合 **PicList** 客户端使用，体验完全不输付费服务。

## 为什么选择 Cloudflare R2？

Cloudflare R2 是一个 S3 兼容的对象存储服务，有以下优势：

- **免费额度大**：每月 100 万次 Class A 操作、1000 万次 Class B 操作、1GB 存储（对于个人博主来说绑绑够用）
- **无需绑定信用卡**：免费版即可使用自定义域名
- **速度快**：依托 Cloudflare 全球 CDN 网络，访问速度有保障
- **S3 兼容**：可以对接任何 S3 兼容的客户端工具

## 一、创建 R2 Bucket

首先登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，在左侧菜单找到 **R2**。

点击「Create Bucket」，输入一个 Bucket 名称（如 `images`），选择就近的数据中心位置，然后点击创建。

## 二、开启公开访问

默认情况下，R2 Bucket 是私有的，需要配置访问策略让图片可以通过 URL 公开访问。

进入刚创建的 Bucket，点击右侧的 **Settings**，找到 **Public access** 配置项。

点击 Configure，并设置一个访问域名。Cloudflare 提供了两种方式：

1. **使用 R2.dev 域名**：自动生成 `https://<account-id>.r2.dev/<bucket>/<file>` 格式的公开 URL
2. **绑定自定义域名**：如果你有自己的域名，可以绑定子域名（如 `img.yourdomain.com`）

这里推荐直接使用 R2.dev 域名，简单快捷。

## 三、创建 R2 API Token

PicList 需要通过 API 访问 R2，所以我们需要生成一对凭证。

回到 Cloudflare Dashboard，点击右上角头像，选择 **My Profile** → **API Tokens**。

点击 **Create Token**，使用 **Edit R2 Tokens** 模板，点击「Create」。

创建完成后，你会看到：

- **Account ID**：在 R2 概览页面可以看到
- **Access Key ID**
- **Secret Access Key**

**重要**：Secret Access Key 只显示一次，请立即保存！

## 四、安装并配置 PicList

[PicList](https://piclist.cn/) 是一个跨平台的图片管理 + 上传工具，支持对接多种图床，包括 S3 兼容存储。

### 4.1 下载安装

前往 [PicList 官网](https://piclist.cn/) 下载对应系统的版本并安装。

### 4.2 添加 R2 图床

打开 PicList，点击左侧「图床」图标，再点击右上角的 **+** 添加新图床。

选择 **S3 兼容存储**，在配置页面填写以下信息：

| 配置项 | 值 |
|--------|-----|
| 端点 (Endpoint) | `https://<account-id>.r2.dev` |
| Bucket | 你创建的 Bucket 名称（如 `images`） |
| Access Key | 刚才生成的 Access Key ID |
| Secret Key | 刚才生成的 Secret Access Key |
| 加速域名 | `https://<account-id>.r2.dev`（与端点相同） |
| URL 路径 | `/` |
| 存储路径 | 可以填 `images/`（上传后的文件路径前缀） |

点击「确认」保存配置。

### 4.3 设置默认图床

在图床列表中，选中刚创建的 R2 图床，点击右键设为「默认图床」。

## 五、上传图片测试

配置完成后，我们来测试一下上传功能。

点击左侧「上传」图标，拖入一张本地图片（或点击「选择文件」），确认上传到 R2 图床。

上传成功后，PicList 会自动复制 **Markdown 格式**的图片链接到剪贴板：

直接粘贴到你的文章里即可！

## 六、进阶：绑定自定义域名（可选）

如果你有自己的域名，可以将 R2 绑定到子域名，这样图片链接会更美观。

### 6.1 添加自定义域名

在 R2 Bucket 的 Settings 中，找到 **Custom Domains**，点击「Add custom domain」。

输入你的子域名（如 `img.yourdomain.com`），Cloudflare 会自动配置必要的 DNS 记录。

### 6.2 更新 PicList 配置

在 PicList 的 R2 图床配置中，将加速域名改为你的自定义域名：

这样上传后的图片链接就会变成：

## 七、PicList 使用技巧

### 7.1 快捷键上传

PicList 支持全局快捷键，截图后直接 `Ctrl/Cmd + V` 粘贴上传，非常方便。

### 7.2 剪贴板监听

开启「监听剪贴板」功能后，复制图片会自动触发上传，并自动粘贴 Markdown 链接。

### 7.3 相册管理

PicList 自带相册功能，可以查看已上传的图片，并支持复制链接、删除等操作。

## 总结

通过以上步骤，我们成功搭建了一个**免费、稳定、快速**的图床服务：

- **Cloudflare R2**：提供 S3 兼容的对象存储，免费额度个人使用完全足够
- **PicList**：简洁易用的上传客户端，支持全局快捷键和剪贴板监听
- **可选自定义域名**：让图片链接更专业

整个过程无需支付任何费用，也不需要绑定信用卡，推荐有图床需求的博主们试试！

如果你在配置过程中遇到问题，欢迎留言交流。
