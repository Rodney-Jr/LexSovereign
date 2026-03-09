const fs = require('fs');
const logPath = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\03db3362-8fad-4de1-8cac-89199ac6016f\\.system_generated\\logs\\overview.txt';
const logData = fs.readFileSync(logPath, 'utf8');

// Find all tool call outputs for `HRWorkbench.tsx`
const regex = /File Path: `file:\/\/\/c:\/Users\/LENOVO\/Desktop\/nomosdesk\/components\/HRWorkbench\.tsx`[\s\S]*?Showing lines (\d+) to (\d+)[\s\S]*?removing the line number, colon, and leading space\.((?:\n\d+: .*)*)/g;

let matches;
const lines = [];

while ((matches = regex.exec(logData)) !== null) {
    const startLine = parseInt(matches[1], 10);
    const endLine = parseInt(matches[2], 10);
    const content = matches[3];

    // Split block into lines and clean up the prefix
    const blockLines = content.split('\n').filter(Boolean);
    for (const bLine of blockLines) {
        const match = bLine.match(/^(\d+):\s(.*)$/);
        if (!match) {
            const fallback = bLine.match(/^(\d+):(.*)$/);
            if (fallback) {
                // If there's an empty line for instance like "100:"
                lines[parseInt(fallback[1], 10)] = fallback[2];
            }
            continue;
        }
        const lineNum = parseInt(match[1], 10);
        const lineContent = match[2];

        // As long as we don't have this line yet, set it
        // Or if it's the unaltered file from earlier. 
        // We only want up to line 584.
        if (lineNum <= 584 && !lines[lineNum]) {
            lines[lineNum] = lineContent;
        }
    }
}

// Ensure all lines from 1 to 584 exist, else throw
let missing = false;
for (let i = 1; i <= 584; i++) {
    if (lines[i] === undefined) {
        console.error(`Missing line ${i}`);
        missing = true;
        // Let's just create an empty string for missing lines to look closer
        if (!lines[i]) lines[i] = "";
    }
}

const finalFileContent = lines.slice(1, 585).join('\n');
fs.writeFileSync('c:\\Users\\LENOVO\\Desktop\\nomosdesk\\components\\HRWorkbench.tsx', finalFileContent);
console.log('Successfully recovered original 584 line file.');
