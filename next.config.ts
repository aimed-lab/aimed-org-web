import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-side env vars (NOT exposed to the browser)
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY || "re_SdwvLog6_FJTMRwPmHr48G6eTupFQtoxC",
  },
  // Include database in all serverless function bundles for Vercel deployment
  outputFileTracingIncludes: {
    "/*": ["./aimed-lab.db"],
  },
  // Copy db to a location the serverless function can find
  webpack: (config, { isServer }) => {
    if (isServer) {
      const CopyPlugin = require("copy-webpack-plugin");
      config.plugins.push(
        new CopyPlugin({
          patterns: [{ from: "aimed-lab.db", to: "aimed-lab.db" }],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
