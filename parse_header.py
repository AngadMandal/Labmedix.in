import re
with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

lines = text.split('\n')
for i in range(560, 600):
    print(f"{i+1}: {lines[i].strip()}")
