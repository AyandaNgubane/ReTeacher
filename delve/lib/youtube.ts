import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import path from "node:path";

const execFileAsync = promisify(execFile);

export type VideoSource = {
  type: "video";
  title: string;
  url: string;
  snippet: string;
  channel?: string;
  thumbnail?: string;
  publishedAt?: string;
};

function resolveBinary(): string {
  const bundled = path.join(process.cwd(), "bin", "yt-dlp");
  if (process.platform === "linux" && existsSync(bundled)) return bundled;
  // Local dev on macOS/Windows: expect yt-dlp installed on PATH
  // (pip install yt-dlp / brew install yt-dlp / etc).
  return "yt-dlp";
}

/**
 * Searches YouTube by shelling out to yt-dlp — no API key, no quota.
 * Returns an empty array (never throws) if yt-dlp isn't available or the
 * search fails, so the rest of the research pipeline degrades gracefully.
 */
export async function searchYouTube(query: string, maxResults = 4): Promise<VideoSource[]> {
  const bin = resolveBinary();

  try {
    const { stdout } = await execFileAsync(
      bin,
      [
        `ytsearch${maxResults}:${query}`,
        "--dump-json",
        "--skip-download",
        "--no-warnings",
        "--ignore-errors",
        "--no-playlist",
      ],
      { timeout: 25_000, maxBuffer: 1024 * 1024 * 20 }
    );

    return stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((v): v is Record<string, any> => v !== null)
      .slice(0, maxResults)
      .map((v) => ({
        type: "video" as const,
        title: v.title ?? "Untitled",
        url: v.webpage_url ?? (v.id ? `https://www.youtube.com/watch?v=${v.id}` : ""),
        snippet: (v.description ?? "").slice(0, 320),
        channel: v.uploader ?? v.channel,
        thumbnail: pickThumbnail(v),
        publishedAt: formatUploadDate(v.upload_date),
      }))
      .filter((v) => v.url);
  } catch (err) {
    console.error("[yt-dlp] search failed:", (err as Error).message);
    return [];
  }
}

function pickThumbnail(v: Record<string, any>): string | undefined {
  if (typeof v.thumbnail === "string") return v.thumbnail;
  if (Array.isArray(v.thumbnails) && v.thumbnails.length) {
    return v.thumbnails[Math.floor(v.thumbnails.length / 2)]?.url;
  }
  return undefined;
}

function formatUploadDate(d?: string): string | undefined {
  if (!d || d.length !== 8) return undefined;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}
