import sys

with open('src/pages/settings/SettingsPage.tsx', 'r') as f:
    text = f.read()

def check_brackets(text):
    stack = []
    lines = text.split('\n')
    for line_no, line in enumerate(lines):
        for col, char in enumerate(line):
            if char in '({[':
                stack.append((char, line_no + 1, col + 1))
            elif char in ')}]':
                if not stack:
                    return f"Extra {char} at line {line_no + 1}:{col + 1}"
                top_char, top_line, top_col = stack.pop()
                if (top_char == '(' and char != ')') or \
                   (top_char == '{' and char != '}') or \
                   (top_char == '[' and char != ']'):
                    return f"Mismatch at line {line_no + 1}:{col + 1} ({char}) - expected match for {top_char} from {top_line}:{top_col}"
    if stack:
        top_char, top_line, top_col = stack.pop()
        return f"Unclosed {top_char} from line {top_line}:{top_col}"
    return "Balanced"

print(check_brackets(text))
