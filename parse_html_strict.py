import re
with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

# Remove comments
text = re.sub(r'\{/\*.*?\*/\}', '', text, flags=re.DOTALL)
text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)

# Remove self closing tags
# A self closing div: <div ... />
# Regex to match self closing tags
text = re.sub(r'<[A-Za-z0-9_]+\s*[^>]*/>', '', text)
text = re.sub(r'<[A-Za-z0-9_]+\s*[^>]*\s*/>', '', text)

# Now count open and close divs
divs = 0
for idx, line in enumerate(text.split('\n')):
    divs += line.count('<div')
    divs -= line.count('</div')
    if "activeTab ===" in line:
        print(f"Line {idx+1}: {divs} open divs | {line.strip()}")

print(f"Total open divs: {divs}")
