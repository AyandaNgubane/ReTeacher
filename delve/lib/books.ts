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
 * Searches Google Books. GOOGLE_BOOKS_API_KEY is optional (the endpoint
 * works unauthenticated at low volume) but recommended for production traffic.
 */
export async function searchBooks(query: string, maxResults = 4): Promise<BookSource[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      maxResults: String(maxResults),
      printType: "books",
      langRestrict: "en",
    });
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (apiKey) params.set("key", apiKey);

    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((item: any) => {
      const info = item.volumeInfo ?? {};
      return {
        type: "book" as const,
        title: info.title ?? "Untitled",
        url: info.infoLink ?? info.previewLink ?? `https://books.google.com/books?id=${item.id}`,
        snippet: (info.description ?? "").slice(0, 320),
        authors: info.authors,
        publishedDate: info.publishedDate,
        thumbnail: info.imageLinks?.thumbnail,
      };
    });
  } catch {
    return [];
  }
}
