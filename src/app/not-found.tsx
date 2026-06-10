import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
        404
      </p>
      <h1 className="text-foreground mt-3 text-3xl font-bold tracking-tight">
        没找到这篇文章
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        可能链接已失效，或者文章尚未发布。
      </p>
      <Link
        href="/"
        className="text-accent mt-6 inline-block text-sm hover:underline"
      >
        ← 回到首页
      </Link>
    </div>
  );
}
