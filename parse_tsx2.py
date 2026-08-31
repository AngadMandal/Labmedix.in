import re

with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

# Remove comments
text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
text = re.sub(r'//.*', '', text)

# Remove string literals
text = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', text)
text = re.sub(r"'[^'\\]*(?:\\.[^'\\]*)*'", "''", text)
text = re.sub(r'`[^`\\]*(?:\\.[^`\\]*)*`', '``', text)

stack = []
lines = text.split('\n')
for line_no, line in enumerate(lines):
    for col, char in enumerate(line):
        if char in '({[':
            stack.append((char, line_no + 1, col + 1))
        elif char in ')}]':
            if not stack:
                print(f"Extra {char} at line {line_no + 1}:{col + 1}")
                break
            top_char, top_line, top_col = stack.pop()
            if (top_char == '(' and char != ')') or \
               (top_char == '{' and char != '}') or \
               (top_char == '[' and char != ']'):
                print(f"Mismatch at line {line_no + 1}:{col + 1} ({char}) - expected match for {top_char} from {top_line}:{top_col}")
                break

if stack:
    top_char, top_line, top_col = stack.pop()
    print(f"Unclosed {top_char} from line {top_line}:{top_col}")
