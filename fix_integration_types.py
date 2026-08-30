import re

with open('src/services/integrationService.ts', 'r') as f:
    text = f.read()

types = """
export type IntegrationCategory =
  | 'all'
  | 'payments_fintech'
  | 'communication_otp'
  | 'card_hardware_govt'
  | 'cloud_accounting';

export type EssentialTier = 'critical_core' | 'highly_recommended';

export interface IntegrationItem {
  id: string;
  name: string;
  provider: string;
  tagline: string;
  category: 'payments_fintech' | 'communication_otp' | 'card_hardware_govt' | 'cloud_accounting';
  icon: string;
  badge?: string;
  isRecommended: boolean;
  essentialTier?: EssentialTier;
  whyNeeded?: string;
  status: 'available' | 'connected' | 'error';
  isEnabled: boolean;
  apiKey?: string;
  secretKey?: string;
  merchantId?: string;
  webhookUrl?: string;
  endpointUrl?: string;
  environment?: 'sandbox' | 'production';
  domainName?: string;
  ipRange?: string;
  printerMacAddress?: string;
  features?: string[];
  docSnippet?: string;
  lastPingLatencyMs?: number;
  lastPingStatus?: 'online' | 'offline';
  lastPingTimestamp?: string;
  packetTrace?: string[];
}
"""

text = text.replace("import { IntegrationItem } from '../types';", "")
text = text.replace("import { StorageService } from './storageService';", "import { StorageService } from './storage';\n" + types)

with open('src/services/integrationService.ts', 'w') as f:
    f.write(text)
