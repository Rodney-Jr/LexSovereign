import { execSync } from 'child_process';
import path from 'path';

async function generatePdf() {
    const htmlPath = 'C:\\tmp\\NomosDesk_Demo_Scripts.html';
    const outputPath = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\bb405b7b-1753-4c47-a4e5-64c3f09c2e8c\\NomosDesk_Demo_Scripts.pdf';

    console.log(`Starting PDF generation via CLI...`);

    // Common Chrome paths on Windows
    const chromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];

    let chromePath = '';
    for (const p of chromePaths) {
        if (require('fs').existsSync(p)) {
            chromePath = p;
            break;
        }
    }

    if (!chromePath) {
        console.error('Chrome executable not found. Cannot generate PDF.');
        process.exit(1);
    }

    console.log(`Found Chrome at: ${chromePath}`);

    try {
        const command = `"${chromePath}" --headless --disable-gpu --print-to-pdf="${outputPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;
        console.log(`Running: ${command}`);
        execSync(command, { stdio: 'inherit' });
        console.log(`Successfully generated PDF at: ${outputPath}`);
    } catch (error: any) {
        console.error('Error generating PDF:', error.message);
        process.exit(1);
    }
}

generatePdf();
