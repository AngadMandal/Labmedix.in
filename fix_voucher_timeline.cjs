const fs = require('fs');
let code = fs.readFileSync('src/services/cashDeskVoucherService.ts', 'utf8');

code = code.replace(
  /vouchers\[idx\]\.timeline\.push\(\{[\s\S]*?\}\);/,
  "AuditService.log('VOUCHER_APPROVED', 'voucher', 'Super Admin approved the pending voucher request.', voucherId);"
);

fs.writeFileSync('src/services/cashDeskVoucherService.ts', code);
console.log('Fixed voucher timeline');
