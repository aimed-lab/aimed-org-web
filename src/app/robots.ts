import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/auth", "/api/inquiry"],
      },
    ],
    sitemap: "https://aimed-lab.org/sitemap.xml",
  };
}
