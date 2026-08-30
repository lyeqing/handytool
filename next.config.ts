import type { NextConfig } from "next";

/**
 * In production a reverse proxy serves the website at https://handytool.org/ and the ASP.NET Core API
 * at https://handytool.org/api/*, so the browser sees one origin and Next needs to do nothing.
 *
 * In development there is no such proxy: Next runs on :3000 and the API on :5292. This rewrite stands
 * in for it, so `fetch("/api/track")` is same-origin in both environments. That is what lets the
 * visitor and session cookies stay plain first-party SameSite=Lax cookies, and why there is no CORS
 * configuration anywhere in this project.
 */
const API_ORIGIN = process.env.HANDYTOOL_API_URL ?? "http://localhost:5292";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [];
    }

    return [{ source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` }];
  },
};

export default nextConfig;
