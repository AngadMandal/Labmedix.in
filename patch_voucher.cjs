const fs = require('fs');
let code = fs.readFileSync('src/services/cashDeskVoucherService.ts', 'utf8');

const approveMethod = `
  public static approveVoucher(voucherId: string, currentUser = StorageService.getCurrentUser()): { success: boolean; error?: string } {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Only Super Admin can approve vouchers.' };
    }
    const vouchers = this.getAllVouchers();
    const idx = vouchers.findIndex(v => v.id === voucherId);
    if (idx === -1) return { success: false, error: 'Voucher not found' };
    
    if (vouchers[idx].status !== 'pending') {
      return { success: false, error: 'Voucher is not pending approval.' };
    }
    
    vouchers[idx].status = 'active';
    vouchers[idx].timeline.push({
      id: generateUuid(),
      timestamp: new Date().toISOString(),
      action: 'Voucher Approved',
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      details: 'Super Admin approved the pending voucher request.'
    });
    
    StorageService.saveCashDeskVouchers(vouchers);
    return { success: true };
  }
`;

if (!code.includes("approveVoucher")) {
  code = code.replace(/public static voidVoucher/, approveMethod + "\n  public static voidVoucher");
  fs.writeFileSync('src/services/cashDeskVoucherService.ts', code);
  console.log("Patched CashDeskVoucherService");
}
