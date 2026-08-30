import re

with open('src/components/portal/PatientCardApplicationModal.tsx', 'r') as f:
    lines = f.readlines()

def insert_after(start_str, offset_lines, insert_str):
    for i, line in enumerate(lines):
        if start_str in line:
            lines.insert(i + offset_lines, insert_str + '\n')
            return i
    return -1

# Let's fix them manually based on the structure.
