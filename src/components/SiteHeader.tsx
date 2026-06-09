// SiteHeader — top navigation.
import Link from "next/link";
import { Rss, Tag } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SITE_TITLE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-foreground font-semibold tracking-tight"
          aria-label={`${SITE_TITLE} 首页`}
        >
          {SITE_TITLE}
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/tags"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-3 py-1.5 text-sm transition-colors"
            aria-label="所有标签"
          >
            <Tag className="h-3.5 w-3.5" />
            标签
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground px-3 py-1.5 text-sm transition-colors"
          >
            关于
          </Link>
          <a
            href="/rss.xml"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-3 py-1.5 text-sm transition-colors"
            aria-label="RSS 订阅"
          >
            <Rss className="h-3.5 w-3.5" />
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
