export function isValidMobile(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
}

export function isValidEmail(email: string): boolean {
  if (!email) return true; // optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPinCode(pin: string): boolean {
  if (!pin) return false;
  const cleaned = pin.replace(/\D/g, '');
  return cleaned.length === 6;
}

export function isNonEmptyString(val: any): boolean {
  return typeof val === 'string' && val.trim().length > 0;
}