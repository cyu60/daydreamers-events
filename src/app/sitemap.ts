import type { MetadataRoute } from "next";
import { getEvents } from "@/lib/notion";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();

  const eventUrls = events.map((e) => ({
    url: `https://events.daydreamers-academy.com/events/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://events.daydreamers-academy.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...eventUrls,
  ];
}
