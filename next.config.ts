import type { NextConfig } from "next";
import { execSync } from "child_process";

let gitHash = "development";
try {
  gitHash = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
} catch {}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_HASH: gitHash,
  },
};

export default nextConfig;
