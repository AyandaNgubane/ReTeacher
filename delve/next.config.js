/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Make sure the downloaded yt-dlp binary in ./bin gets bundled into the
  // research API route's serverless function output — otherwise Next's file
  // tracer won't know to include it, since it's invoked via child_process
  // rather than imported.
  experimental: {
    outputFileTracingIncludes: {
      "/api/research": ["./bin/**"],
    },
  },
};
module.exports = nextConfig;
