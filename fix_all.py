import re

with open('src/components/portal/PatientCardApplicationModal.tsx', 'r') as f:
    text = f.read()

# Most missing )} are at the end of conditional rendering: `&& (` -> `)}`
# We can find all `&& (` and try to match the closing parenthesis.
# But it's easier to look at lines where syntax errors are.

# Just kidding, there's a better way. I have an earlier version of the app from CHECKPOINT.
# Wait, CHECKPOINT only has diffs.

