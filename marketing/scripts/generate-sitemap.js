import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, '../', p);

const BASE_URL = 'https://nomosdesk.com';
const TODAY = new Date().toISOString().split('T')[0];

const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/for-law-firms', priority: '0.9', changefreq: 'monthly' },
    { url: '/for-enterprise-legal', priority: '0.9', changefreq: 'monthly' },
    { url: '/for-government', priority: '0.9', changefreq: 'monthly' },
    { url: '/pricing', priority: '0.8', changefreq: 'weekly' },
    { url: '/security-and-compliance', priority: '0.8', changefreq: 'monthly' },
    { url: '/client-intake-assistant', priority: '0.8', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/insights', priority: '0.7', changefreq: 'weekly' },
    { url: '/insights/legal-software-africa-guide', priority: '0.8', changefreq: 'monthly' },
    { url: '/insights/government-legal-case-management', priority: '0.8', changefreq: 'monthly' },
    { url: '/insights/conflict-checking-software-law-firms', priority: '0.8', changefreq: 'monthly' },
    { url: '/insights/sovereign-legal-data-infrastructure', priority: '0.8', changefreq: 'monthly' },
    { url: '/insights/nomosdesk-vs-clio', priority: '0.8', changefreq: 'monthly' },
];

const urlEntries = staticRoutes.map(({ url, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

const outPath = toAbsolute('public/sitemap.xml');
fs.writeFileSync(outPath, sitemap, 'utf-8');
console.log(`✅ Sitemap generated → public/sitemap.xml (${staticRoutes.length} URLs)`);
