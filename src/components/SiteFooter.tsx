// SiteFooter — minimal bottom strip.
import { SITE_TITLE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-border mt-auto border-t">
      <div className="text-muted-foreground mx-auto flex max-w-[80rem] flex-col items-center gap-1 px-6 py-6 text-xs sm:flex-row sm:justify-between">
        <span>
          © {new Date().getFullYear()} {SITE_TITLE} · 用 Next.js + Obsidian 搭建
        </span>
        <a
          href="/rss.xml"
          className="hover:text-foreground transition-colors"
        >
          RSS
        </a>
      </div>
    </footer>
  );
}
