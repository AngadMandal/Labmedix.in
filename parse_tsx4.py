with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

b = 0
for i, line in enumerate(text.split('\n')):
    # very naive, but just to see if it drops below 0 early
    for c in line:
        if c == '{': b += 1
        elif c == '}': b -= 1
    if b < 0:
        print(f"Drops below zero at line {i+1}")
        b = 0 # reset to continue
