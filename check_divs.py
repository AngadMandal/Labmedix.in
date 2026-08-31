import re
with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

text = re.sub(r'\{/\*.*?\*/\}', '', text, flags=re.DOTALL)
text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
text = re.sub(r'<[A-Za-z0-9_]+\s*[^>]*/>', '', text)
text = re.sub(r'<[A-Za-z0-9_]+\s*[^>]*\s*/>', '', text)

divs = 0
for idx, line in enumerate(text.split('\n')):
    divs += line.count('<div')
    divs -= line.count('</div')
    if idx > 1680 and idx < 1700:
        print(f"L{idx+1} [divs={divs}]: {line.strip()}")
