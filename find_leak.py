with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

divs = 4
for idx, line in enumerate(text.split('\n')):
    if idx < 1202: continue
    if idx > 1423: break
    d_open = line.count('<div')
    d_close = line.count('</div')
    divs += d_open - d_close
    if d_open or d_close:
        print(f"L{idx+1} [+{d_open}/-{d_close} => {divs}]: {line.strip()}")
