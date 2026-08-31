with open('src/components/portal/PatientRealMoneyTopUpModal.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "})}}" in line or "})}" in line or "}}" in line:
        pass # I might have messed up replacing strings
