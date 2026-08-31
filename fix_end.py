import re
with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

# Replace any sequence of closing divs at the very end with a single </div>
# But wait, how many divs are ACTUALLY open?
# The root div <div className="space-y-6 max-w-7xl mx-auto"> is 1.
# Are there any others?
# Let's count all <div and </div in the file.
divs = 0
for idx, line in enumerate(text.split('\n')):
    divs += line.count('<div')
    divs += line.count('<form')
    divs -= line.count('</form')
    divs -= line.count('</div')

print(f"Total divs open before the end: {divs}")
