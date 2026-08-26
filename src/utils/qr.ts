import QRCode from 'qrcode';

/**
 * Generate 300 DPI high-resolution Level 'H' QR Code Data URL.
 * Uses high-contrast dark indigo modules on clean white background with quiet zone margin
 * for 100% camera scan reliability across mobile devices and optical scanners.
 */
export async function generateQrDataUrl(text: string, size = 360): Promise<string> {
  try {
    if (!text || !text.trim()) {
      return '';
    }
    return await QRCode.toDataURL(text.trim(), {
      width: size,
      margin: 1.5,
      color: {
        dark: '#051937',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // 30% Reed-Solomon error correction
    });
  } catch (err) {
    console.error('Failed to generate QR Code Data URL', err);
    return '';
  }
}

export function buildVerificationUrl(verificationCode: string): string {
  const origin = window.location.origin;
  const isGhPages = window.location.pathname.startsWith('/LABMEDIX-AUTO-HEALTH-CARD-SYSTEM');
  const base = isGhPages ? '/LABMEDIX-AUTO-HEALTH-CARD-SYSTEM' : '';
  return `${origin}${base}/#/verify/${encodeURIComponent(verificationCode.trim())}`;
}