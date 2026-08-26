const fs = require('fs');
let code = fs.readFileSync('src/pages/portal/PatientPortalPage.tsx', 'utf8');

const lines = code.split('\n');

// Find the line with 'View Family Hub →'
const startIndex = lines.findIndex(l => l.includes('View Family Hub →'));
if (startIndex !== -1) {
  // 1555: View Family Hub
  // 1556: </button>
  // 1557: </div>
  // 1558: </div>
  // 1559: </div>
  // 1560: )}
  
  lines[startIndex + 3] = ''; // remove </div>
  lines[startIndex + 4] = ''; // remove )}
  
  fs.writeFileSync('src/pages/portal/PatientPortalPage.tsx', lines.join('\n'));
  console.log('Fixed syntax using lines');
}
