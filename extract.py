import zipfile
import sys
try:
    with zipfile.ZipFile('dist/labmedix_source.zip', 'r') as z:
        z.extract('src/pages/settings/SettingsPage.tsx')
    print("Extracted successfully")
except Exception as e:
    print(f"Error: {e}")
