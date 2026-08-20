export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chatiobyanza.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup', '/widget.js', '/sitemap.xml'],
        disallow: ['/api/admin/', '/admin/', '/_next/', '/private/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
