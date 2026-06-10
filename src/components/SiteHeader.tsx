// SiteHeader — minimal sticky top bar. Logo on the left, links + theme
// toggle on the right. With the new sidebar layout, the header is just a
// thin frame; the sidebar handles the "where am I" navigation.
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { SITE_TITLE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-20 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[80rem] items-center justify-between px-6">
        <Link
          href="/"
          className="text-foreground font-mono text-sm font-semibold tracking-tight"
          aria-label={`${SITE_TITLE} 首页`}
        >
          {SITE_TITLE}
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground hidden px-3 py-1.5 text-sm transition-colors sm:inline-block"
          >
            关于
          </Link>
          <a
            href="/rss.xml"
            className="text-muted-foreground hover:text-foreground grid h-8 w-8 place-items-center transition-colors"
            aria-label="RSS 订阅"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </svg>
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
