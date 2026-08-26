const fs = require('fs');
let code = fs.readFileSync('src/services/cashDeskVoucherService.ts', 'utf8');

// Put it back
code = code.replace(/return this\.sanitizeVouchers\(vouchers\);/, "return vouchers;");
code = code.replace(/return this\.sanitizeVoucher\(this\.getAllVouchers\(\)\.find\(v => v\.id === id\)\);/, "return this.getAllVouchers().find(v => v.id === id);");
code = code.replace(/return this\.sanitizeVoucher\(this\.getAllVouchers\(\)\.find\(v => v\.voucherCode\.toUpperCase\(\) === cleanCode\)\);/, "return this.getAllVouchers().find(v => v.voucherCode.toUpperCase() === cleanCode);");

// Let's create public access methods instead.
code = code.replace(
  /public static getAllVouchers\(\): CashDeskVoucher\[\] \{/,
  `public static getPublicVouchers(): CashDeskVoucher[] {
    return this.sanitizeVouchers(this.getAllVouchers());
  }

  public static getAllVouchers(): CashDeskVoucher[] {`
);

fs.writeFileSync('src/services/cashDeskVoucherService.ts', code);
console.log('Fixed voucher DB read/write');
