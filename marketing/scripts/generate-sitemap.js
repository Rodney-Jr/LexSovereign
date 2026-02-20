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

  // Core Pillars
  { url: '/legal-practice-management-software', priority: '0.9', changefreq: 'monthly' },
  { url: '/ai-for-law-firms', priority: '0.9', changefreq: 'monthly' },
  { url: '/law-firm-crm-software', priority: '0.9', changefreq: 'monthly' },
  { url: '/automated-legal-intake', priority: '0.9', changefreq: 'monthly' },
  { url: '/ai-legal-chatbot', priority: '1.0', changefreq: 'weekly' },

  // Comparison Pages
  { url: '/vs/nomosdesk-vs-clio', priority: '0.8', changefreq: 'monthly' },
  { url: '/vs/nomosdesk-vs-mycase', priority: '0.8', changefreq: 'monthly' },
  { url: '/vs/nomosdesk-vs-practicepanther', priority: '0.8', changefreq: 'monthly' },
  { url: '/vs/ai-chatbot-vs-traditional-intake-forms', priority: '0.8', changefreq: 'monthly' },
  { url: '/vs/nomosdesk-ai-vs-generic-website-chatbots', priority: '0.8', changefreq: 'monthly' },

  // Practice Area Chatbots
  { url: '/ai-chatbot-for-personal-injury-lawyers', priority: '0.8', changefreq: 'monthly' },
  { url: '/ai-chatbot-for-immigration-lawyers', priority: '0.8', changefreq: 'monthly' },
  { url: '/ai-chatbot-for-family-lawyers', priority: '0.8', changefreq: 'monthly' },
  { url: '/ai-chatbot-for-criminal-defense-lawyers', priority: '0.8', changefreq: 'monthly' },
  { url: '/ai-chatbot-for-corporate-law-firms', priority: '0.8', changefreq: 'monthly' },
  { url: '/ai-chatbot-for-government-legal-departments', priority: '0.8', changefreq: 'monthly' },

  // Insights & Knowledge Base
  { url: '/insights/legal-software-africa-guide', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/government-legal-case-management', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/conflict-checking-software-law-firms', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/sovereign-legal-data-infrastructure', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/nomosdesk-vs-clio', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/how-ai-chatbots-increase-law-firm-revenue', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/best-ai-chatbots-for-lawyers-2026', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/ai-vs-live-chat-for-legal-intake', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/how-to-automate-client-screening-law-firms', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/legal-intake-automation-for-small-law-firms', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/enterprise-ai-intake-for-corporate-legal', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/data-privacy-in-ai-legal-chatbots', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/how-government-agencies-use-ai-chatbots', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/reducing-legal-intake-costs-with-ai', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/ai-chatbot-roi-for-law-firms', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/24-7-legal-intake-automation', priority: '0.7', changefreq: 'monthly' },
  { url: '/insights/conversational-ai-for-legal-websites', priority: '0.7', changefreq: 'monthly' },
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
