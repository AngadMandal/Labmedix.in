/**
 * Safe Sequence & ID Generators for LABMEDIX
 */

export function generatePatientId(existingIds: string[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `LMDX-${currentYear}-`;
  
  let maxSeq = 0;
  existingIds.forEach(id => {
    if (id && id.startsWith(prefix)) {
      const parts = id.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
}

export function generateCardNumber(existingCardNumbers: string[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `LHC-${currentYear}-`;
  
  let maxSeq = 0;
  existingCardNumbers.forEach(numStr => {
    if (numStr && numStr.startsWith(prefix)) {
      const parts = numStr.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
}

export function generateFamilyId(existingFamilyIds: string[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `FAM-${currentYear}-`;
  
  let maxSeq = 0;
  existingFamilyIds.forEach(id => {
    if (id && id.startsWith(prefix)) {
      const parts = id.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
}

export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VER-${p1}-${p2}`;
}

export function generateCardCvv(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

export function generateTransactionReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TXN-${timestamp}-${random}`;
}

export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateNfcUid(): string {
  const bytes = ['04'];
  for (let i = 0; i < 6; i++) {
    bytes.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase());
  }
  return bytes.join(':');
}