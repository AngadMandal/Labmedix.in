import sys
def parse_html(text):
    divs = 0
    lines = text.split('\n')
    for idx, line in enumerate(lines):
        divs += line.count('<div')
        divs += line.count('<form')
        divs -= line.count('</form')
        divs -= line.count('</div')
        print(f"{idx+1423}: {divs} | {line.strip()}")

with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    lines = f.readlines()
    parse_html(''.join(lines[1422:1590]))
