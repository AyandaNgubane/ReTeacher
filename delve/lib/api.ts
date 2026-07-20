/**
 * Wraps fetch + JSON parsing for calls to our own API routes. Exists because
 * a plain `await res.json()` throws an opaque "Unexpected token..." error
 * whenever the response isn't actually JSON — which happens whenever a
 * serverless function crashes, times out, or hits a platform-level limit
 * before our own route code gets a chance to return a proper JSON error.
 * This surfaces something a person can actually act on instead.
 */
export async function postJSON<T = any>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  const raw = await res.text();
  let data: any;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    const looksLikeTimeout = res.status === 504 || /timed?\s*out|timeout/i.test(raw);
    const hint = looksLikeTimeout
      ? " This usually means the request ran longer than your hosting plan's function time limit — try researching fewer angles at once, or check your Vercel plan's max duration."
      : " This is usually a temporary server issue rather than something wrong with your input.";
    throw new Error(`The server sent back an unexpected response (status ${res.status}).${hint}`);
  }

  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (status ${res.status}).`);
  }

  return data as T;
}
