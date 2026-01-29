import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Use only your domain; never the Vercel deployment URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.olelonoeau.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/account`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
