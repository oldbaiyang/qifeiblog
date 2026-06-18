// Sidebar — left rail: profile, social, stats, tag cloud, latest.
// Reads counts from the post store; SSG renders all of this at build time.

import Link from "next/link";
import { getAllPostMetas, getAllTags } from "@/lib/posts";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";

export function Sidebar() {
  const posts = getAllPostMetas();
  const tags = getAllTags().slice(0, 20);
  const postCount = posts.length;
  const tagCount = tags.length;
  const sinceYear = posts.length
    ? new Date(posts[posts.length - 1]!.date).getFullYear()
    : new Date().getFullYear();

  return (
    <aside className="sidebar">
      {/* Profile */}
      <div className="flex flex-col items-center text-center">
        <Avatar />
        <p className="mt-4 text-lg font-semibold tracking-tight">
          {SITE_TITLE}
        </p>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {SITE_DESCRIPTION}
        </p>
      </div>

      {/* Social row */}
      <div className="flex items-center justify-center gap-1">
        <SocialLink href="https://github.com/oldbaiyang" label="GitHub">
          <GithubIcon />
        </SocialLink>
        <SocialLink href="/rss.xml" label="RSS">
          <RssIcon />
        </SocialLink>
        <SocialLink href="mailto:hi@qifeiblog.com" label="Email">
          <MailIcon />
        </SocialLink>
      </div>

      {/* Stats */}
      <div className="border-border bg-surface rounded-xl border px-2 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <dl className="grid grid-cols-3 gap-1 text-center">
          <Stat label="文章" value={postCount} href="/" />
          <Stat label="标签" value={tagCount} href="/tags" />
          <Stat label="自" value={sinceYear} />
        </dl>
      </div>

      {/* Tag cloud */}
      <div>
        <SectionHeader
          icon={<TagIcon />}
          title="标签"
          href="/tags"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <span className="text-muted-foreground text-xs">还没有标签</span>
          ) : (
            tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="hover:bg-accent-soft hover:text-accent hover:border-accent rounded-md border border-transparent bg-transparent px-2 py-0.5 text-xs text-[var(--muted-foreground)] transition-colors"
              >
                {tag}
                <span className="ml-1 opacity-60">{count}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Latest */}
      <div>
        <SectionHeader icon={<BookIcon />} title="最近" />
        <ul className="mt-3 space-y-2">
          {posts.slice(0, 5).map((p) => (
            <li key={p.slug}>
              <Link
                href={`/posts/${p.slug}`}
                className="hover:text-accent block text-xs leading-snug text-[var(--muted-foreground)] transition-colors"
              >
                <span className="line-clamp-2">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function Avatar() {
  return (
    <div
      className="grid h-20 w-20 place-items-center rounded-full text-2xl font-semibold text-white shadow-sm ring-4 ring-[var(--background)]"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.62 0.18 255), oklch(0.55 0.2 295))",
      }}
      aria-label="qifei 头像"
    >
      Q
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");
  return (
    <Link
      href={href}
      aria-label={label}
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
      className="hover:bg-accent-soft hover:text-accent grid h-9 w-9 place-items-center rounded-md text-[var(--muted-foreground)] transition-colors"
    >
      {children}
    </Link>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <div className="flex flex-col">
      <span className="text-foreground text-base font-semibold tabular-nums">
        {value}
      </span>
      <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="hover:bg-accent-soft rounded-md py-1 transition-colors">
        {inner}
      </Link>
    );
  }
  return <div className="py-1">{inner}</div>;
}

function SectionHeader({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-foreground text-xs font-medium uppercase tracking-wider">
        {title}
      </span>
      {href ? (
        <span className="text-muted-foreground ml-auto text-[10px]">
          查看全部 →
        </span>
      ) : null}
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="hover:text-accent flex items-center gap-1.5 transition-colors"
      >
        {content}
      </Link>
    );
  }
  return <div className="flex items-center gap-1.5">{content}</div>;
}

/* ------------------------------------------------------------------ */
/* Inline SVG icons (avoid lucide-react 1.17.0 naming incompatibility)  */
/* ------------------------------------------------------------------ */

function GithubIcon() {
  return (
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
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function RssIcon() {
  return (
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
  );
}

function MailIcon() {
  return (
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
