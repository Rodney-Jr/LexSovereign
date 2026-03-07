const fs = require('fs');

async function recover() {
    const logPath = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\03db3362-8fad-4de1-8cac-89199ac6016f\\.system_generated\\logs\\overview.txt';
    const logData = fs.readFileSync(logPath, 'utf8');

    // Make the regex very forgiving
    const regex = /c:\\\/Users\\\/LENOVO\\\/Desktop\\\/LexSovereign\\\/components\\\/HRWorkbench\.tsx`\r?\nTotal Lines: 584\r?\nTotal Bytes: \d+\r?\nShowing lines (\d+) to (\d+)\r?\n[\s\S]*?leading space\.\r?\n([\s\S]*?)(?:The above content )/g;

    let matches;
    const lines = [];

    while ((matches = regex.exec(logData)) !== null) {
        const startLine = parseInt(matches[1], 10);
        const endLine = parseInt(matches[2], 10);
        const content = matches[3];
        console.log(`Found block ${startLine} to ${endLine}`);

        const blockLines = content.split('\n');
        for (const bLine of blockLines) {
            const match = bLine.match(/^(\d+):\s(.*)$/);
            if (!match) {
                const fallback = bLine.match(/^(\d+):(.*)$/);
                if (fallback) {
                    const lineNum = parseInt(fallback[1], 10);
                    if (lineNum <= 584 && lines[lineNum] === undefined) {
                        lines[lineNum] = fallback[2];
                    }
                }
                continue;
            }
            const lineNum = parseInt(match[1], 10);
            const lineContent = match[2];

            if (lineNum <= 584 && lines[lineNum] === undefined) {
                lines[lineNum] = lineContent;
            }
        }
    }

    let missing = 0;
    for (let i = 1; i <= 584; i++) {
        if (lines[i] === undefined) {
            lines[i] = "";
            missing++;
        }
    }

    if (missing === 584) {
        console.error("Failed to find any lines!");
        process.exit(1);
    }

    const finalFileContent = lines.slice(1, 585).join('\n');
    fs.writeFileSync('c:\\Users\\LENOVO\\Desktop\\LexSovereign\\components\\HRWorkbench.tsx', finalFileContent);
    console.log(`Successfully recovered file with ${584 - missing} lines found from logs.`);
}

recover();
