export type BookSource = {
  type: "book";
  title: string;
  url: string;
  snippet: string;
  authors?: string[];
  publishedDate?: string;
  thumbnail?: string;
};

/**
 * Searches Open Library (openlibrary.org) — the Internet Archive's open book
 * catalog. Fully unauthenticated, no API key or quota to manage. Open
 * Library asks callers to identify themselves with a descriptive User-Agent,
 * which we do below.
 */
export async function searchBooks(query: string, maxResults = 4): Promise<BookSource[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(maxResults),
      fields: "title,author_name,first_publish_year,key,cover_i,first_sentence,subtitle",
    });

    const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, {
      headers: {
        "User-Agent": "Delve-Research-App/1.0 (educational research assistant)",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.docs ?? []).slice(0, maxResults).map((d: any) => {
      const firstSentence = Array.isArray(d.first_sentence) ? d.first_sentence[0] : d.first_sentence;
      const snippet =
        firstSentence ||
        d.subtitle ||
        `${d.title}${d.author_name?.length ? ` by ${d.author_name.join(", ")}` : ""}.`;

      return {
        type: "book" as const,
        title: d.title ?? "Untitled",
        url: d.key ? `https://openlibrary.org${d.key}` : "https://openlibrary.org",
        snippet: String(snippet).slice(0, 320),
        authors: d.author_name,
        publishedDate: d.first_publish_year ? String(d.first_publish_year) : undefined,
        thumbnail: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : undefined,
      };
    });
  } catch {
    return [];
  }
}
