with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

# Let's count all ( and ) in the file.
# Note: This is rough due to strings/regex, but let's see.
paren_level = 0
brace_level = 0
lines = text.split('\n')
for idx, line in enumerate(lines):
    for char in line:
        if char == '(': paren_level += 1
        elif char == ')': paren_level -= 1
        elif char == '{': brace_level += 1
        elif char == '}': brace_level -= 1
    if "activeTab ===" in line:
        print(f"Line {idx+1}: paren={paren_level}, brace={brace_level} | {line.strip()}")

print(f"Final paren: {paren_level}, brace: {brace_level}")
