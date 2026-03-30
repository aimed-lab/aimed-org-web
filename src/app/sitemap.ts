import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aimed-lab.org";
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/research`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/training`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/publications`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/software`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/talks`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/honors`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/service`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
