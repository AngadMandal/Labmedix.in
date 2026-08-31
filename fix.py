with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

import re
text = re.sub(r'(<\/div>\s*)+<\/div>\s*\);\s*\};', '</div>\n  );\n};', text)

with open('src/pages/settings/SettingsPage.tsx', 'w') as f:
    f.write(text)
