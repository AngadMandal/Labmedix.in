const fs = require('fs');
let code = fs.readFileSync('src/services/cashDeskVoucherService.ts', 'utf8');

const securityStripper = `
  private static sanitizeVouchers(vouchers: CashDeskVoucher[]): CashDeskVoucher[] {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser?.role === 'super_admin') return vouchers;
    
    return vouchers.map(v => ({
      ...v,
      pin: '***',
      securityHash: '***'
    }));
  }

  private static sanitizeVoucher(voucher: CashDeskVoucher | undefined): CashDeskVoucher | undefined {
    if (!voucher) return undefined;
    return this.sanitizeVouchers([voucher])[0];
  }
`;

code = code.replace(/export class CashDeskVoucherService \{/, "export class CashDeskVoucherService {\n" + securityStripper);

code = code.replace(/return vouchers;/, "return this.sanitizeVouchers(vouchers);");
code = code.replace(/return this\.getAllVouchers\(\)\.find\(v => v\.id === id\);/, "return this.sanitizeVoucher(this.getAllVouchers().find(v => v.id === id));");
code = code.replace(/return this\.getAllVouchers\(\)\.find\(v => v\.voucherCode\.toUpperCase\(\) === cleanCode\);/, "return this.sanitizeVoucher(this.getAllVouchers().find(v => v.voucherCode.toUpperCase() === cleanCode));");

fs.writeFileSync('src/services/cashDeskVoucherService.ts', code);
console.log('Patched cashDeskVoucherService API for PIN masking');
