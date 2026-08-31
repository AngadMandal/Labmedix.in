import sys
def parse_html(text):
    divs = 0
    lines = text.split('\n')
    for idx, line in enumerate(lines):
        divs += line.count('<div')
        divs += line.count('<form')
        divs -= line.count('</form')
        divs -= line.count('</div')
        if "activeTab === 'system'" in line:
            print(f"At system {idx+1423}: {divs}")
        if idx > 150 and idx < 170:
            print(f"{idx+1423}: {divs} | {line.strip()}")

with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    lines = f.readlines()
    parse_html(''.join(lines[1422:]))
