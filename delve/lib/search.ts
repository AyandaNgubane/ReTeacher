export type WebSource = {
  type: "article";
  title: string;
  url: string;
  snippet: string;
  source?: string;
};

/**
 * Searches the web via Tavily (https://tavily.com). Requires TAVILY_API_KEY.
 * Returns an empty array (rather than throwing) if the key is absent, so the
 * rest of the research pipeline can continue with whatever sources it does have.
 */
export async function searchWeb(query: string, maxResults = 6): Promise<WebSource[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: maxResults,
        include_answer: false,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((r: any) => ({
      type: "article" as const,
      title: r.title ?? "Untitled",
      url: r.url,
      snippet: (r.content ?? "").slice(0, 320),
      source: safeHostname(r.url),
    }));
  } catch {
    return [];
  }
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
