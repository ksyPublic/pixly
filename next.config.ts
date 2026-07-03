import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static export — no server needed. `next build` emits ./out
  output: "export",
  // next/image optimization requires a server; disable for static hosting
  images: { unoptimized: true },
  // Emit /heic-to-jpg/index.html so it works on any static host without rewrites
  trailingSlash: true,
};

export default nextConfig;
