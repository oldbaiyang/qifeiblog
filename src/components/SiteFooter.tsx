// SiteFooter — bottom strip.
import { SITE_TITLE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-border mt-16 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-3xl flex-col items-center gap-1 px-6 py-8 text-sm sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} {SITE_TITLE}</span>
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
