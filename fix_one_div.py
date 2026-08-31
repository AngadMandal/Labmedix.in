with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

import re
text = re.sub(r'(<\/div>)+', '</div>', text)

with open('src/pages/settings/SettingsPage.tsx', 'w') as f:
    f.write(text)
