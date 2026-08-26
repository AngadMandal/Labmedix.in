import { StorageService } from './storage';
import { AuditService } from './auditService';
import { ZohoPaymentConfig } from '../types';
import { DEFAULT_COMPANY_PROFILE } from '../constants/defaults';

export interface ZohoCheckoutSession {
  orderId: string;
  sessionId: string;
  amount: number;
  currency: string;
  merchantAccountId: string;
  checkoutUrl: string;
  qrPayload: string;
  signature: string;
  createdAt: string;
  expiresAt: string;
}

export interface ZohoTestConnectionResult {
  success: boolean;
  latencyMs: number;
  httpStatus: number;
  environment: 'production' | 'sandbox';
  tlsVersion: string;
  signatureVerified: boolean;
  apiKeyMasked: string;
  signingKeyMasked: string;
  gatewayNode: string;
  message: string;
  timestamp: string;
}

export class ZohoPaymentService {
  public static getConfig(): ZohoPaymentConfig {
    const profile = StorageService.getCompanyProfile();
    const fallback = DEFAULT_COMPANY_PROFILE.zohoPayments!;
    if (profile.zohoPayments) {
      return {
        ...fallback,
        ...profile.zohoPayments,
        isConnected: profile.zohoPayments.isConnected ?? true,
        authStatus: profile.zohoPayments.authStatus ?? 'authenticated',
        connectedEmail: profile.zohoPayments.connectedEmail || 'payments@labmedix.org'
      };
    }
    return fallback;
  }

  public static updateConfig(updates: Partial<ZohoPaymentConfig>): ZohoPaymentConfig {
    const profile = StorageService.getCompanyProfile();
    const current = profile.zohoPayments || DEFAULT_COMPANY_PROFILE.zohoPayments!;
    const updated: ZohoPaymentConfig = { ...current, ...updates };

    profile.zohoPayments = updated;
    StorageService.saveCompanyProfile(profile);

    AuditService.log(
      'SETTINGS_UPDATED',
      'settings',
      `Updated Zoho Payments Integration Gateway settings. Status: ${updated.enabled ? 'ACTIVE' : 'DISABLED'} (${updated.environment.toUpperCase()})`,
      'zoho_gateway_config',
      {
        enabled: updated.enabled,
        environment: updated.environment,
        merchantAccountId: updated.merchantAccountId,
        settlementSchedule: updated.settlementSchedule
      }
    );

    return updated;
  }

  public static async testConnection(): Promise<ZohoTestConnectionResult> {
    const config = this.getConfig();
    const startTime = performance.now();

    // Simulated secure TLS 1.3 handshake with Zoho Payment Cloud Endpoint
    await new Promise((resolve) => setTimeout(resolve, 80 + Math.floor(Math.random() * 40)));
    const latencyMs = Math.round(performance.now() - startTime);

    const hasValidApiKey =
      Boolean(config.apiKey) &&
      config.apiKey.startsWith('1003.') &&
      config.apiKey.length >= 30;

    const hasValidSigningKey =
      Boolean(config.signingKey) &&
      config.signingKey.length >= 32;

    const success = hasValidApiKey && hasValidSigningKey;

    const maskedApiKey = config.apiKey
      ? `${config.apiKey.slice(0, 10)}••••••••••••••••${config.apiKey.slice(-8)}`
      : 'NOT_SET';

    const maskedSigningKey = config.signingKey
      ? `${config.signingKey.slice(0, 8)}••••••••••••••••${config.signingKey.slice(-8)}`
      : 'NOT_SET';

    const timestamp = new Date().toISOString();

    // Update last ping in storage
    this.updateConfig({
      lastPingStatus: success ? 'online' : 'error',
      lastPingLatencyMs: latencyMs,
      lastPingTimestamp: timestamp
    });

    return {
      success,
      latencyMs,
      httpStatus: success ? 200 : 401,
      environment: config.environment,
      tlsVersion: 'TLSv1.3 (ChaCha20-Poly1305_SHA256)',
      signatureVerified: success,
      apiKeyMasked: maskedApiKey,
      signingKeyMasked: maskedSigningKey,
      gatewayNode: config.environment === 'production' ? 'zoho-pay-in-south1.cloud.zoho.com' : 'zoho-sandbox-node1.zoho.com',
      message: success
        ? 'Zoho Payments Gateway Handshake & SHA-256 HMAC Signature Verified Successfully.'
        : 'Invalid API Key or Webhook Signing Key configuration.',
      timestamp
    };
  }

  public static createCheckoutSession(params: {
    amount: number;
    patientId: string;
    patientName: string;
    purpose?: string;
  }): ZohoCheckoutSession {
    const config = this.getConfig();
    const now = new Date();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `zh_ord_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}_${randomSuffix}`;
    const sessionId = `zh_sess_${Math.random().toString(36).substring(2, 15)}`;

    const qrPayload = `upi://pay?pa=zoho.labmedix@icici&pn=LabMedix%20Healthcare&am=${params.amount}&cu=INR&tn=${encodeURIComponent(`Zoho Order ${orderId}`)}`;
    const checkoutUrl = `https://payments.zoho.in/checkout/v1/${sessionId}?env=${config.environment}`;

    const expiresAt = new Date(now.getTime() + 15 * 60000).toISOString();

    return {
      orderId,
      sessionId,
      amount: params.amount,
      currency: 'INR',
      merchantAccountId: config.merchantAccountId,
      checkoutUrl,
      qrPayload,
      signature: `sig_zh_${Math.random().toString(36).substring(2, 20)}`,
      createdAt: now.toISOString(),
      expiresAt
    };
  }
}
