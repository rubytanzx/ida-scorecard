import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
