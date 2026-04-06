const fs = require('fs');
const path = require('path');

function fixReturnsInDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixReturnsInDir(fullPath);
        } else if (file.endsWith('.ts')) {
            fixReturns(fullPath);
        }
    }
}

function fixReturns(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace res.json(...) with return res.json(...)
    code = code.replace(/([\s\n]+)(res\.(status\([^)]+\)\.)?json\([^;]*\);)/g, (match, prefix, stmt) => {
        if (prefix.endsWith('return ')) return match;
        changed = true;
        return prefix + 'return ' + stmt;
    });

    // Replace res.status(...).send|json|end(...) without json
    code = code.replace(/([\s\n]+)(res\.status\([^)]+\)\.(send|end)\([^;]*\);)/g, (match, prefix, stmt) => {
        if (prefix.endsWith('return ')) return match;
        changed = true;
        return prefix + 'return ' + stmt;
    });

    // Replace res.send(...) 
    code = code.replace(/([\s\n]+)(res\.send\([^;]*\);)/g, (match, prefix, stmt) => {
        if (prefix.endsWith('return ')) return match;
        changed = true;
        return prefix + 'return ' + stmt;
    });
    
    if (changed) {
        fs.writeFileSync(filePath, code);
        console.log('Fixed ' + filePath);
    }
}

fixReturnsInDir(path.join(process.cwd(), 'server', 'src', 'routes'));
