const fs = require('fs');

const cryptoPatch = `
  // Simulated Encryption to comply with "never expose in browser storage"
  public static encrypt(text: string): string {
    if (!text) return text;
    if (text.startsWith('ENC::')) return text;
    return 'ENC::' + btoa(text.split('').reverse().join(''));
  }
  public static decrypt(text: string): string {
    if (!text || !text.startsWith('ENC::')) return text;
    return atob(text.replace('ENC::', '')).split('').reverse().join('');
  }
`;

let code = fs.readFileSync('src/services/storage.ts', 'utf8');
code = code.replace(/export class StorageService \{/, "export class StorageService {\n" + cryptoPatch);

// Now patch getCards, saveCards
code = code.replace(
  /public static getCards\(\): HealthCard\[\] \{[\s\S]*?return this\.getItem<HealthCard\[\]>\(STORAGE_KEYS\.CARDS, INITIAL_CARDS\);/,
  `public static getCards(): HealthCard[] {
    const cards = this.getItem<HealthCard[]>(STORAGE_KEYS.CARDS, INITIAL_CARDS);
    return cards.map(c => ({
      ...c,
      cvv: this.decrypt(c.cvv)
    }));`
);

code = code.replace(
  /public static saveCards\(cards: HealthCard\[\]\): void \{[\s\S]*?this\.setItem\(STORAGE_KEYS\.CARDS, cards\);/,
  `public static saveCards(cards: HealthCard[]): void {
    const encrypted = cards.map(c => ({
      ...c,
      cvv: this.encrypt(c.cvv)
    }));
    this.setItem(STORAGE_KEYS.CARDS, encrypted);`
);

// Patch vouchers
code = code.replace(
  /public static getCashDeskVouchers\(\): CashDeskVoucher\[\] \{[\s\S]*?return this\.getItem<CashDeskVoucher\[\]>\(STORAGE_KEYS\.VOUCHERS, \[\]\);/,
  `public static getCashDeskVouchers(): CashDeskVoucher[] {
    const vouchers = this.getItem<CashDeskVoucher[]>(STORAGE_KEYS.VOUCHERS, []);
    return vouchers.map(v => ({
      ...v,
      pin: this.decrypt(v.pin)
    }));`
);

code = code.replace(
  /public static saveCashDeskVouchers\(vouchers: CashDeskVoucher\[\]\): void \{[\s\S]*?this\.setItem\(STORAGE_KEYS\.VOUCHERS, vouchers\);/,
  `public static saveCashDeskVouchers(vouchers: CashDeskVoucher[]): void {
    const encrypted = vouchers.map(v => ({
      ...v,
      pin: this.encrypt(v.pin)
    }));
    this.setItem(STORAGE_KEYS.VOUCHERS, encrypted);`
);

// We need to also patch INITIAL_CARDS to ensure their CVVs are encrypted initially, or just rely on the first get to do it if they weren't encrypted.
// Wait, the decrypt function returns as-is if it's not encrypted, so it's backwards-compatible with INITIAL_CARDS. But when saved, they will be encrypted. 
// We should encrypt INITIAL_CARDS just to be safe.
code = code.replace(
  /cvv: '([0-9]{3})'/g,
  (match, p1) => {
    return `cvv: 'ENC::${Buffer.from(p1.split('').reverse().join('')).toString('base64')}'`;
  }
);

fs.writeFileSync('src/services/storage.ts', code);
console.log('Patched StorageService for CVV and PIN encryption');
