export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateString;
  }
}

export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber) return '';
  // e.g. LHC-2026-000001 -> LHC-2026-****01
  const parts = cardNumber.split('-');
  if (parts.length === 3) {
    const num = parts[2];
    const masked = '****' + num.slice(-2);
    return `${parts[0]}-${parts[1]}-${masked}`;
  }
  return cardNumber;
}

export function maskPatientId(patientId: string): string {
  if (!patientId) return '';
  const parts = patientId.split('-');
  if (parts.length === 3) {
    const num = parts[2];
    const masked = '****' + num.slice(-2);
    return `${parts[0]}-${parts[1]}-${masked}`;
  }
  return patientId;
}

export function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}