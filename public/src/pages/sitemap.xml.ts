import { api } from '../lib/api';

export const GET = async () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://beritaonlinenews.com';
  
  try {
    // Ambil artikel terbaru untuk sitemap (max 1000)
    // Di aplikasi nyata, Anda mungkin perlu memecah sitemap jika artikel sangat banyak (>50000)
    const response = await api.getArticles(1, 1000);
    const articles = response.articles || [];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Halaman Statis -->
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/arsip</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Artikel Dinamis -->
  ${articles
    .map((article: any) => {
      // Pastikan URL gambar adalah absolute URL
      let imageUrl = article.featured_image || '';
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${siteUrl}${imageUrl}`;
      }

      // Format tanggal ISO 8601 (2026-03-15T00:00:00Z)
      const pubDate = new Date(article.published_at).toISOString();

      return `
  <url>
    <loc>${siteUrl}${article.url}</loc>
    <lastmod>${pubDate}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.7</priority>
    ${
      imageUrl
        ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(article.title)}</image:title>
    </image:image>`
        : ''
    }
    <news:news>
      <news:publication>
        <news:name>NewsReact</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join('')}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache 1 jam
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};

// Helper function to escape special XML characters
function escapeXml(unsafe: string) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
