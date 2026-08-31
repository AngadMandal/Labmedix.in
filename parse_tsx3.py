with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

# Let's count { and } from line 560 onwards.
lines = text.split('\n')
b = 0
for i in range(560, len(lines)):
    line = lines[i]
    if "/*" in line or "//" in line: continue
    for char in line:
        if char == '{': b += 1
        elif char == '}': b -= 1
    if b < 0:
        print(f"Negative brace level at line {i+1}: {line.strip()}")
        break
