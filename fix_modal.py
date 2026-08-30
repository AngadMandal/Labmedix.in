import re

with open('src/components/portal/PatientCardApplicationModal.tsx', 'r') as f:
    text = f.read()

# I deleted `)}` using sed earlier! But actually I deleted it with `sed -i 's/)}//g'`. 
# Wait, I stopped that command or it failed?
# In my command history, I ran:
# `sed -i 's/)}//g' src/components/portal/PatientCardApplicationModal.tsx`
# This means every `)}` is gone.

