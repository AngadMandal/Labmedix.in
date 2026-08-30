import re

with open('src/components/portal/PatientCardApplicationModal.tsx', 'r') as f:
    lines = f.readlines()

# Instead of complex parsing, I will just prompt myself or write simple heuristics.
# Wait, let's just show all lines with `&& (`.
for i, line in enumerate(lines):
    if "&& (" in line or "? (" in line:
        print(f"Line {i+1}: {line.strip()}")
