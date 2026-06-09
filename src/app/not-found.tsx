import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-foreground text-4xl font-bold tracking-tight">
        404
      </h1>
      <p className="text-muted-foreground mt-2">没有找到这篇文章。</p>
      <Link
        href="/"
        className="text-primary mt-6 inline-block underline-offset-4 hover:underline"
      >
        ← 回到首页
      </Link>
    </div>
  );
}
