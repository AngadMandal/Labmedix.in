const fs = require('fs');
const content = fs.readFileSync('src/pages/settings/SettingsPage.tsx', 'utf8');

// Just to be absolutely sure, let's look at the tokens!
console.log("File loaded.");
