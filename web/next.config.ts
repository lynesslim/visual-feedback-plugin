import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid picking a parent folder lockfile (e.g. home directory) as Turbopack root
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
