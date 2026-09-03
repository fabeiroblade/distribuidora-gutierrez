import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/contacto';

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  return [
    { url: siteUrl, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/#catalogo`, lastModified: ahora, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/#categorias`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/#nosotros`, lastModified: ahora, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/#contacto`, lastModified: ahora, changeFrequency: 'yearly', priority: 0.8 },
  ];
}
