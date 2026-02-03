import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageBreak } from 'docx';
import { DocumentElement } from './DocumentAssemblyService';
import { BrandingProfile } from '@prisma/client';

export class DocumentExportService {
    /**
     * Generates a DOCX buffer from structured document elements with optional branding.
     */
    public static async generateDOCX(elements: DocumentElement[], branding?: BrandingProfile): Promise<Buffer> {
        const bodyFont = branding?.primaryFont || "Times New Roman";

        const children: any[] = [];

        // 1. Cover Page (Optional)
        if (branding?.coverPageEnabled) {
            children.push(new Paragraph({
                text: branding.name.toUpperCase(),
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { before: 2000, after: 400 },
            }));
            children.push(new Paragraph({
                text: elements.find(e => e.type === 'HEADING' && e.level === 1)?.text || 'LEGAL DOCUMENT',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 2000 },
            }));
            children.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // 2. Document Body
        elements.forEach(el => {
            if (el.type === 'HEADING') {
                children.push(new Paragraph({
                    text: el.text,
                    heading: el.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
                    spacing: { after: 200, before: el.level === 1 ? 0 : 200 },
                    alignment: el.level === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
                }));
            } else if (el.type === 'PARAGRAPH') {
                children.push(new Paragraph({
                    children: [new TextRun({ text: el.text, font: bodyFont })],
                    spacing: { after: 120 },
                    alignment: AlignmentType.JUSTIFIED,
                }));
            }
        });

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch
                            bottom: 1440,
                            left: 1800, // 1.25 inch gutter
                            right: 1440,
                        },
                    },
                },
                headers: {
                    default: branding?.headerText ? new Header({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    new TextRun({
                                        text: branding.headerText,
                                        size: 16, // 8pt
                                        color: "888888"
                                    }),
                                ],
                            }),
                        ],
                    }) : undefined,
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: (branding?.footerText ? `${branding.footerText} | ` : "") + (elements.find(e => e.type === 'FOOTER')?.text || ''),
                                        size: 16, // 8pt
                                        color: "888888"
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                children: children,
            }],
        });

        return await Packer.toBuffer(doc);
    }

    /**
     * Generates a PDF buffer using puppeteer-core with optional branding.
     */
    public static async generatePDF(elements: DocumentElement[], branding?: BrandingProfile): Promise<Buffer> {
        // Dynamic imports for ESM modules in CommonJS environment
        const { launch } = await import('chrome-launcher');
        const puppeteer = await import('puppeteer-core');

        const bodyFont = branding?.primaryFont || "Times New Roman";

        const html = `
            <html>
            <head>
                <style>
                    @page {
                        size: A4;
                        margin: 1in 1in 1in 1.25in;
                    }
                    body {
                        font-family: '${bodyFont}', serif;
                        line-height: 1.5;
                        color: #000;
                        margin: 0;
                        padding: 0;
                    }
                    .cover-page {
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        page-break-after: always;
                    }
                    .header {
                        position: fixed;
                        top: 0;
                        width: 100%;
                        text-align: right;
                        font-size: 8pt;
                        color: #888;
                    }
                    h1 {
                        text-align: center;
                        font-size: 16pt;
                        text-transform: uppercase;
                        margin-bottom: 20pt;
                    }
                    h2 {
                        font-size: 12pt;
                        font-weight: bold;
                        margin-top: 15pt;
                        margin-bottom: 5pt;
                    }
                    p {
                        font-size: 11pt;
                        text-align: justify;
                        margin-bottom: 10pt;
                    }
                    .footer {
                        position: fixed;
                        bottom: 0;
                        width: 100%;
                        text-align: center;
                        font-size: 8pt;
                        color: #888;
                        border-top: 0.5pt solid #eee;
                        padding-top: 5pt;
                    }
                </style>
            </head>
            <body>
                ${branding?.headerText ? `<div class="header">${branding.headerText}</div>` : ''}
                
                ${branding?.coverPageEnabled ? `
                    <div class="cover-page">
                        <h1 style="font-size: 24pt;">${branding.name}</h1>
                        <h2 style="font-size: 18pt;">${elements.find(e => e.type === 'HEADING' && e.level === 1)?.text || 'Legal Document'}</h2>
                    </div>
                ` : ''}

                ${elements.map(el => {
            if (el.type === 'HEADING') return el.level === 1 ? `<h1>${el.text}</h1>` : `<h2>${el.text}</h2>`;
            if (el.type === 'PARAGRAPH') return `<p>${el.text}</p>`;
            return '';
        }).join('')}
                
                <div class="footer">
                    ${branding?.footerText ? `${branding.footerText} | ` : ''}
                    ${elements.find(e => e.type === 'FOOTER')?.text || ''}
                </div>
            </body>
            </html>
        `;

        const chrome = await launch({
            chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
        });

        const browser = await puppeteer.default.connect({
            browserWSEndpoint: `ws://127.0.0.1:${chrome.port}`
        });

        // Fallback for finding the WS endpoint if connect fails
        // For standard server implementation, we'll use a'headless' browser helper.

        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
            });
            return Buffer.from(pdf);
        } finally {
            await browser.disconnect();
            await chrome.kill();
        }
    }
}
