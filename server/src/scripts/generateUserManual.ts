// ESM compatibility fix for ts-node in CJS environment
const _path = require('path');
const _fs = require('fs');
const { launch } = require('chrome-launcher');
const puppeteer = require('puppeteer-core');
const axios = require('axios');

async function generateManual() {
    console.log('📖 Starting User Manual PDF Generation...');

    const htmlPath = _path.join(__dirname, '../../../public/NomosDesk_User_Manual_v2.html');
    const outputPath = _path.join(__dirname, '../../../public/NomosDesk_User_Manual.pdf');

    if (!_fs.existsSync(htmlPath)) {
        console.error('❌ Error: HTML manual source not found at', htmlPath);
        process.exit(1);
    }

    const htmlContent = _fs.readFileSync(htmlPath, 'utf8');

    let chrome;
    try {
        console.log('🚀 Launching Chrome...');
        chrome = await launch({
            chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
        });

        console.log(`🔍 Fetching WebSocket URL from port ${chrome.port}...`);
        const resp = await axios.get(`http://127.0.0.1:${chrome.port}/json/version`);
        const { webSocketDebuggerUrl } = resp.data;

        console.log(`🔗 Connecting Puppeteer to ${webSocketDebuggerUrl}...`);
        const browser = await puppeteer.connect({
            browserWSEndpoint: webSocketDebuggerUrl
        });

        const page = await browser.newPage();

        console.log('📄 Setting content and rendering PDF...');
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #718096; padding-bottom: 20px;">NomosDesk Sovereign OS - Confidential - Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
            margin: {
                top: '2cm',
                bottom: '2cm',
                left: '2cm',
                right: '2cm'
            }
        });

        _fs.writeFileSync(outputPath, pdfBuffer);
        console.log(`✅ Success! PDF Manual generated at: ${outputPath}`);

        await browser.disconnect();
    } catch (error) {
        console.error('❌ PDF Generation Failed:', error);
    } finally {
        if (chrome) {
            await chrome.kill();
        }
    }
}

generateManual();
