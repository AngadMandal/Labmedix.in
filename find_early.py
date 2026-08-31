with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

divs = 0
for idx, line in enumerate(text.split('\n')):
    divs += line.count('<div')
    divs += line.count('<form')
    divs -= line.count('</form')
    divs -= line.count('</div')
    if "activeTab === " in line:
        print(f"Line {idx+1}: {divs} divs open | {line.strip()}")
