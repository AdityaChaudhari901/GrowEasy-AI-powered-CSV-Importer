import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(frontendDir, "..")
  }
};

export default nextConfig;
