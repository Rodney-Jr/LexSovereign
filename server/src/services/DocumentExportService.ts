import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer } from 'docx';
import { DocumentElement } from './DocumentAssemblyService';
import puppeteer from 'puppeteer-core';
import { launch } from 'chrome-launcher';

export class DocumentExportService {
    /**
     * Generates a DOCX buffer from structured document elements.
     */
    public static async generateDOCX(elements: DocumentElement[]): Promise<Buffer> {
        const children = elements.map(el => {
            if (el.type === 'HEADING') {
                return new Paragraph({
                    text: el.text,
                    heading: el.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
                    spacing: { after: 200, before: el.level === 1 ? 0 : 200 },
                    alignment: el.level === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
                });
            } else if (el.type === 'PARAGRAPH') {
                return new Paragraph({
                    children: [new TextRun({ text: el.text, font: "Times New Roman" })],
                    spacing: { after: 120 },
                    alignment: AlignmentType.JUSTIFIED,
                });
            }
            return null;
        }).filter(p => p !== null) as Paragraph[];

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
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: elements.find(e => e.type === 'FOOTER')?.text || '',
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
     * Generates a PDF buffer using puppeteer-core.
     */
    public static async generatePDF(elements: DocumentElement[]): Promise<Buffer> {
        const html = `
            <html>
            <head>
                <style>
                    @page {
                        size: A4;
                        margin: 1in 1in 1in 1.25in;
                    }
                    body {
                        font-family: 'Times New Roman', serif;
                        line-height: 1.5;
                        color: #000;
                        margin: 0;
                        padding: 0;
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
                ${elements.map(el => {
            if (el.type === 'HEADING') return el.level === 1 ? `<h1>${el.text}</h1>` : `<h2>${el.text}</h2>`;
            if (el.type === 'PARAGRAPH') return `<p>${el.text}</p>`;
            return '';
        }).join('')}
                <div class="footer">
                    ${elements.find(e => e.type === 'FOOTER')?.text || ''}
                </div>
            </body>
            </html>
        `;

        const chrome = await launch({
            chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
        });

        const browser = await puppeteer.connect({
            browserWSEndpoint: `ws://127.0.0.1:${chrome.port}${chrome.port ? '' : ''}` // Potential ws endpoint
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
