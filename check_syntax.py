import re
with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "onChange=" in line and "=>" in line:
        if not line.strip().endswith('}') and not line.strip().endswith('/>') and not line.strip().endswith(')'):
            print(f"Suspicious onChange at {i+1}: {line.strip()}")
