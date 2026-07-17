export type VideoSource = {
  type: "video";
  title: string;
  url: string;
  snippet: string;
  channel?: string;
  thumbnail?: string;
  publishedAt?: string;
};

/**
 * Searches YouTube via the Data API v3. Requires YOUTUBE_API_KEY.
 * Returns an empty array if the key is absent so the pipeline degrades gracefully.
 */
export async function searchYouTube(query: string, maxResults = 4): Promise<VideoSource[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: String(maxResults),
      relevanceLanguage: "en",
      safeSearch: "strict",
      key: apiKey,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? [])
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => ({
        type: "video" as const,
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        snippet: item.snippet.description ?? "",
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url,
        publishedAt: item.snippet.publishedAt,
      }));
  } catch {
    return [];
  }
}
