/**
 * Downloads the standalone yt-dlp Linux binary into ./bin at install time,
 * so video search works out of the box on Vercel (Amazon Linux, x86_64)
 * without requiring Python or a system-wide install.
 *
 * On non-Linux dev machines (macOS/Windows) this is skipped — lib/youtube.ts
 * falls back to a `yt-dlp` on your PATH instead, which you should install
 * yourself for local development (pip install yt-dlp, brew install yt-dlp, etc).
 *
 * Never fails the install/build if the download doesn't succeed — video
 * search just degrades to returning no results, same as a missing API key
 * would have before.
 */
const fs = require("fs");
const https = require("https");
const path = require("path");

const BIN_DIR = path.join(__dirname, "..", "bin");
const BIN_PATH = path.join(BIN_DIR, "yt-dlp");
const DOWNLOAD_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

function download(url, dest, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "delve-app-build" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectsLeft <= 0) return reject(new Error("Too many redirects"));
          res.resume();
          return resolve(download(res.headers.location, dest, redirectsLeft - 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} fetching yt-dlp binary`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
        file.on("error", reject);
      })
      .on("error", reject);
  });
}

(async () => {
  if (process.platform !== "linux") {
    console.log(
      "[fetch-yt-dlp] Skipping binary download (not Linux). Install yt-dlp yourself for local dev: https://github.com/yt-dlp/yt-dlp#installation"
    );
    return;
  }
  try {
    fs.mkdirSync(BIN_DIR, { recursive: true });
    console.log("[fetch-yt-dlp] Downloading yt-dlp binary…");
    await download(DOWNLOAD_URL, BIN_PATH);
    fs.chmodSync(BIN_PATH, 0o755);
    console.log("[fetch-yt-dlp] Ready at", BIN_PATH);
  } catch (err) {
    console.warn(
      "[fetch-yt-dlp] Couldn't download yt-dlp binary — video search will return no results until this is resolved:",
      err.message
    );
  }
})();
