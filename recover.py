import re

log_path = r"C:\Users\LENOVO\.gemini\antigravity\brain\03db3362-8fad-4de1-8cac-89199ac6016f\.system_generated\logs\overview.txt"
with open(log_path, 'r', encoding='utf-8') as f:
    log_data = f.read()

# find blocks
pattern = r"File Path: `file:\/\/\/c:\/Users\/LENOVO\/Desktop\/LexSovereign\/components\/HRWorkbench\.tsx`\r?\nTotal Lines: (?:584|692)\r?\nTotal Bytes: \d+\r?\nShowing lines (\d+) to (\d+)\r?\n[\s\S]*?leading space\.\r?\n([\s\S]*?)(?:The above content)"
matches = re.finditer(pattern, log_data)

lines = {}
for match in matches:
    content = match.group(3)
    for line in content.split('\n'):
        m = re.match(r"^(\d+):\s(.*)$", line)
        if m:
            num = int(m.group(1))
            val = m.group(2)
            if num <= 584 and num not in lines:
                lines[num] = val
        else:
            m2 = re.match(r"^(\d+):(.*)$", line)
            if m2:
                num = int(m2.group(1))
                val = m2.group(2)
                if num <= 584 and num not in lines:
                    lines[num] = val

result = []
for i in range(1, 585):
    result.append(lines.get(i, ''))

with open(r"c:\Users\LENOVO\Desktop\LexSovereign\components\HRWorkbench.tsx", "w", encoding='utf-8') as fw:
    fw.write('\n'.join(result))

print(f"Recovered {len(lines)} lines out of 584.")
