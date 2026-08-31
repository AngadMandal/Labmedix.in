with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

b = 0
for i, line in enumerate(text.split('\n')):
    for c in line:
        if c == '{': b += 1
        elif c == '}': b -= 1
    if b == 0 and i > 100:
        print(f"Brace level reaches 0 at line {i+1}: {line.strip()}")
