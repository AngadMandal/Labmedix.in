const fs = require('fs');
let code = fs.readFileSync('src/services/cardService.ts', 'utf8');

const securityStripper = `
  private static sanitizeCards(cards: HealthCard[]): HealthCard[] {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser?.role === 'super_admin') return cards;
    
    // Test 3 & 8: Staff calls CVV API -> 403 / Redacted CVV
    return cards.map(c => ({
      ...c,
      cvv: '***',
      verificationCode: '***' // Hide verification code as well
    }));
  }

  private static sanitizeCard(card: HealthCard | undefined): HealthCard | undefined {
    if (!card) return undefined;
    return this.sanitizeCards([card])[0];
  }
`;

code = code.replace(/export class CardService \{/, "export class CardService {\n" + securityStripper);

code = code.replace(/return cards\.filter\(c => !c\.isDeleted && c\.status !== 'deleted'\);/, "return this.sanitizeCards(cards.filter(c => !c.isDeleted && c.status !== 'deleted'));");
code = code.replace(/if \(includeDeleted\) return cards;/, "if (includeDeleted) return this.sanitizeCards(cards);");
code = code.replace(/return StorageService\.getCards\(\)\.find\(c => c\.id === id\);/, "return this.sanitizeCard(StorageService.getCards().find(c => c.id === id));");
code = code.replace(/return StorageService\.getCards\(\)\.find\(c => c\.cardNumber === cardNumber\);/, "return this.sanitizeCard(StorageService.getCards().find(c => c.cardNumber === cardNumber));");
code = code.replace(/return StorageService\.getCards\(\)\.find\(c => c\.patientId === patientId\);/, "return this.sanitizeCard(StorageService.getCards().find(c => c.patientId === patientId));");

fs.writeFileSync('src/services/cardService.ts', code);
console.log('Patched cardService API for CVV masking');
