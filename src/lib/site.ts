// Site-wide constants. SITE_URL must be set in .env.local for canonical /
// og:url / RSS. We strip a trailing slash to keep URL composition tidy.

const RAW = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qifeiblog.com";

export const SITE_URL = RAW.replace(/\/$/, "");
export const SITE_TITLE = "qifeiblog";
export const SITE_DESCRIPTION =
  "个人技术博客：AI 工具、效率提升、Cloudflare 与开源实践。";
export const SITE_AUTHOR = "qifei";
