// PostMeta — date + tag list, used at the top of a post body.
import { format, parseISO } from "date-fns";
import { TagPill } from "./TagPill";

interface PostMetaProps {
  date: string;
  tags: string[];
  readingTime?: number;
}

export function PostMeta({ date, tags, readingTime }: PostMetaProps) {
  let formatted = date;
  try {
    formatted = format(parseISO(date), "yyyy 年 M 月 d 日");
  } catch {
    /* keep raw date if parse fails */
  }
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <time dateTime={date}>{formatted}</time>
      {readingTime ? <span>· {readingTime} 分钟阅读</span> : null}
      {tags.length > 0 ? (
        <>
          <span aria-hidden>·</span>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <TagPill key={t} tag={t} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
