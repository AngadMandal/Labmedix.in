import re
with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

# find all closing divs that are right before the end
# and replace them with exactly what is needed to balance
def count_balance(txt):
    d = 0
    for line in txt.split('\n'):
        d += line.count('<div')
        d += line.count('<form')
        d -= line.count('</form')
        d -= line.count('</div')
    return d

text = re.sub(r'(<\/div>\s*)+\s*\);\s*\};', '  );\n};', text)
needed = count_balance(text)
print(f"Needed: {needed}")

text = text.replace('  );\n};', ('</div>\n' * needed) + '  );\n};')

with open('src/pages/settings/SettingsPage.tsx', 'w') as f:
    f.write(text)

