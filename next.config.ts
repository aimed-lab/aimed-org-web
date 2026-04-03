import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-side env vars (NOT exposed to the browser)
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY || "re_SdwvLog6_FJTMRwPmHr48G6eTupFQtoxC",
  },
};

export default nextConfig;
