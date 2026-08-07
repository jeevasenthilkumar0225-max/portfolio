import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.join(process.cwd()),
  },
};

export default nextConfig;
