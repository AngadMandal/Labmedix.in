const fs = require('fs');

let login = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');
if (!login.includes("import { StorageService }")) {
  login = login.replace("import { AuthService } from '../../services/authService';", "import { AuthService } from '../../services/authService';\nimport { StorageService } from '../../services/storage';");
  fs.writeFileSync('src/pages/auth/LoginPage.tsx', login);
}

let cardList = fs.readFileSync('src/pages/cards/CardListPage.tsx', 'utf8');
if (!cardList.includes("Check,")) {
  cardList = cardList.replace("Clock,", "Clock,\n  Check,");
  fs.writeFileSync('src/pages/cards/CardListPage.tsx', cardList);
}
console.log('Fixed imports');
