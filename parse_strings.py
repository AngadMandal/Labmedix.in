with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

lines = text.split('\n')
for i, line in enumerate(lines[560:1800]):
    real_i = i + 560 + 1
    # Check if there is an odd number of backticks on the line (super naive but might catch it)
    if line.count('`') % 2 != 0:
        print(f"Odd backticks at {real_i}: {line.strip()}")
