import { Source } from "@/lib/types";

const TYPE_LABEL: Record<Source["type"], string> = {
  article: "Article",
  video: "Video",
  book: "Book",
};

export default function SourceItem({ source, index }: { source: Source; index: number }) {
  const meta =
    source.type === "video"
      ? (source as any).channel
      : source.type === "book"
      ? (source as any).authors?.join(", ")
      : (source as any).source;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 py-3 border-b border-parchment/5 last:border-0 group"
    >
      <span className="stamp text-[10px] text-brass/60 mt-0.5 shrink-0 w-5">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] stamp text-parchment/35 border border-parchment/15 px-1.5 py-0.5">
            {TYPE_LABEL[source.type]}
          </span>
          {meta && <span className="text-xs text-parchment/40">{meta}</span>}
        </span>
        <span className="block text-sm text-parchment/85 group-hover:text-brass transition-colors mt-1 truncate">
          {source.title}
        </span>
      </span>
    </a>
  );
}
