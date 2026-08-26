const fs = require('fs');
let code = fs.readFileSync('src/pages/vouchers/CashDeskBillVouchersPage.tsx', 'utf8');

const approveFn = `
  const handleApproveVoucher = (voucherId: string) => {
    if (!isSuperAdmin) {
      showToast('error', 'Unauthorized', 'Only Super Admin can approve vouchers.');
      return;
    }
    const res = CashDeskVoucherService.approveVoucher(voucherId);
    if (res.success) {
      showToast('success', 'Voucher Approved', 'The voucher is now active.');
      setVouchers(CashDeskVoucherService.getAllVouchers());
    } else {
      showToast('error', 'Approval Failed', res.error || 'Failed to approve voucher.');
    }
  };
`;

if (!code.includes("handleApproveVoucher")) {
  code = code.replace(/const handleVoidVoucher =/, approveFn + "\n  const handleVoidVoucher =");
  code = code.replace(
    /<button\s+onClick=\{\(\) => handleVoidVoucher\(v\)\}/,
    `{v.status === 'pending' && isSuperAdmin && (
      <button onClick={() => handleApproveVoucher(v.id)} className="px-3 py-1 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 rounded font-bold transition-colors">
        Approve
      </button>
    )}
    <button onClick={() => handleVoidVoucher(v)}`
  );
  fs.writeFileSync('src/pages/vouchers/CashDeskBillVouchersPage.tsx', code);
  console.log("Patched Voucher UI");
}
