def parse_html(text):
    divs = 0
    lines = text.split('\n')
    for idx, line in enumerate(lines):
        divs += line.count('<div')
        divs += line.count('<form')
        divs -= line.count('</form')
        divs -= line.count('</div')
        if idx > 1202 and idx < 1210:
            print(f"{idx+1}: {divs} | {line.strip()}")
        if idx > 1415 and idx < 1425:
            print(f"{idx+1}: {divs} | {line.strip()}")
        if idx == len(lines)-1:
            print(f"Total: {divs}")

with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    lines = f.readlines()
    parse_html(''.join(lines))
