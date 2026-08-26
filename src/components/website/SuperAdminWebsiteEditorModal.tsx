import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { WebsiteService, WebsiteCMSConfig, WebsiteCardTierConfig } from '../../services/websiteService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  Crown,
  Shield,
  Sparkles,
  Save,
  RotateCcw,
  Layers,
  HeartPulse,
  Phone,
  MessageSquare,
  HelpCircle,
  CreditCard,
  Building,
  Check,
  AlertTriangle
} from 'lucide-react';

interface SuperAdminWebsiteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: WebsiteCMSConfig;
  onConfigUpdated: (newConfig: WebsiteCMSConfig) => void;
}

export const SuperAdminWebsiteEditorModal: React.FC<SuperAdminWebsiteEditorModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onConfigUpdated
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'cards' | 'specialties' | 'contacts' | 'faqs'>('hero');
  const [formData, setFormData] = useState<WebsiteCMSConfig>({ ...currentConfig });

  if (!isSuperAdmin) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Security Gate - Super Administrator Access Required" maxWidth="md">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">Access Restricted to Super Administrator</h3>
            <p className="text-xs text-slate-400">
              Only the <strong>Super Administrator</strong> (`super_admin`) holds cryptographic authority to customize, modify, and publish the public 3D website home page.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            Current Active Role: <span className="text-teal-400 font-mono font-bold">{currentUser?.role || 'Guest / Non-Admin'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="w-full">
            Dismiss Security Alert
          </Button>
        </div>
      </Modal>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const result = WebsiteService.updateWebsiteConfig(formData, currentUser?.role);
    if (result.success) {
      triggerCelebrationFireworks();
      showToast('success', 'Website Updated & Published', result.message);
      onConfigUpdated(formData);
      onClose();
    } else {
      showToast('error', 'Update Failed', result.message);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all website content to factory default templates?')) {
      const result = WebsiteService.resetToDefaults(currentUser?.role);
      if (result.success) {
        const fresh = WebsiteService.getWebsiteConfig();
        setFormData(fresh);
        onConfigUpdated(fresh);
        showToast('warning', 'Reset Successful', 'Website content reset to factory defaults.');
      }
    }
  };

  const updateCardTier = (index: number, key: keyof WebsiteCardTierConfig, value: any) => {
    const updated = [...formData.cardTiers];
    updated[index] = { ...updated[index], [key]: value };
    setFormData({ ...formData, cardTiers: updated });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="👑 Super Admin Live 3D Website Customizer & CMS Studio"
      maxWidth="4xl"
    >
      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Top Warning & Tab Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 to-slate-900 border border-purple-500/40">
          <div className="flex items-center gap-2 text-purple-200">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-bold">Super Admin Exclusive Mode:</span>
            <span className="text-[11px] text-slate-300">Live edits immediately reflect across public domain.</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-[11px] border-slate-700 text-slate-400 hover:text-rose-300"
              leftIcon={<RotateCcw className="w-3 h-3" />}
              onClick={handleReset}
            >
              Factory Reset
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {[
            { key: 'hero', label: '🚀 Hero & Banner', icon: Layers },
            { key: 'stats', label: '📊 Statistics Counters', icon: Building },
            { key: 'cards', label: '💳 3D Health Cards', icon: CreditCard },
            { key: 'specialties', label: '🩺 Medical Specialties', icon: HeartPulse },
            { key: 'contacts', label: '📞 Emergency & Hotlines', icon: Phone },
            { key: 'faqs', label: '❓ FAQs & About', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: HERO & BRANDING */}
        {activeTab === 'hero' && (
          <div className="space-y-4 p-4 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">📢 Top Announcement Marquee Ticker:</label>
              <Input
                value={formData.announcementTicker}
                onChange={(e) => setFormData({ ...formData, announcementTicker: e.target.value })}
                placeholder="Announcement banner text..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Hero Badge Tagline:</label>
                <Input
                  value={formData.heroBadge}
                  onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                  placeholder="e.g. NABL ACCREDITED"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Primary CTA Button Label:</label>
                <Input
                  value={formData.heroCtaPrimaryText}
                  onChange={(e) => setFormData({ ...formData, heroCtaPrimaryText: e.target.value })}
                  placeholder="e.g. Apply for Health Card"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Hero Main Headline:</label>
              <Input
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                placeholder="Main headline on website..."
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Hero Descriptive Subtitle:</label>
              <textarea
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                rows={3}
                placeholder="Comprehensive subtitle..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Secondary CTA Button Label:</label>
              <Input
                value={formData.heroCtaSecondaryText}
                onChange={(e) => setFormData({ ...formData, heroCtaSecondaryText: e.target.value })}
                placeholder="e.g. Explore Diagnostic Packages"
                required
              />
            </div>
          </div>
        )}

        {/* TAB 2: STATS COUNTERS */}
        {activeTab === 'stats' && (
          <div className="space-y-4 p-4 rounded-3xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white uppercase font-mono text-[11px]">
              📊 Live Dynamic Metric Counters (Displayed on Home Page):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Happy Cardholders:</label>
                <Input
                  value={formData.stats.happyCardholders}
                  onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, happyCardholders: e.target.value } })}
                  placeholder="e.g. 520,000+"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Lab Tests Processed:</label>
                <Input
                  value={formData.stats.labTestsProcessed}
                  onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, labTestsProcessed: e.target.value } })}
                  placeholder="e.g. 3,450,000+"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Doctor Consultations:</label>
                <Input
                  value={formData.stats.doctorConsultations}
                  onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, doctorConsultations: e.target.value } })}
                  placeholder="e.g. 185,000+"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Partner Hospital Network:</label>
                <Input
                  value={formData.stats.partnerHospitals}
                  onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, partnerHospitals: e.target.value } })}
                  placeholder="e.g. 450+"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Diagnostic Accuracy Rate:</label>
                <Input
                  value={formData.stats.diagnosticAccuracy}
                  onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, diagnosticAccuracy: e.target.value } })}
                  placeholder="e.g. 99.98%"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 3D HEALTH CARDS TIERS */}
        {activeTab === 'cards' && (
          <div className="space-y-4 p-4 rounded-3xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white uppercase font-mono text-[11px]">
              💳 3D Health Cards Configuration & Discount Rates:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.cardTiers.map((tier, idx) => (
                <div key={tier.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-black text-white">{tier.name}</strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300">
                      {tier.tier} Tier
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">Annual Fee (₹):</label>
                      <Input
                        type="number"
                        value={tier.annualFee}
                        onChange={(e) => updateCardTier(idx, 'annualFee', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">Discount % on Tests:</label>
                      <Input
                        type="number"
                        value={tier.discountPercentage}
                        onChange={(e) => updateCardTier(idx, 'discountPercentage', parseInt(e.target.value, 10) || 0)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">Cashback %:</label>
                      <Input
                        type="number"
                        value={tier.cashbackPercentage}
                        onChange={(e) => updateCardTier(idx, 'cashbackPercentage', parseInt(e.target.value, 10) || 0)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">Family Members:</label>
                      <Input
                        type="number"
                        value={tier.familyMembersCovered}
                        onChange={(e) => updateCardTier(idx, 'familyMembersCovered', parseInt(e.target.value, 10) || 1)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MEDICAL SPECIALTIES */}
        {activeTab === 'specialties' && (
          <div className="space-y-4 p-4 rounded-3xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white uppercase font-mono text-[11px]">
              🩺 Doctor Specialties & Consultation Pricing:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.specialties.map((spec, sIdx) => (
                <div key={spec.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-black text-white">{spec.name}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{spec.department}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">Consult Fee (₹):</label>
                      <Input
                        type="number"
                        value={spec.consultationFee}
                        onChange={(e) => {
                          const updated = [...formData.specialties];
                          updated[sIdx].consultationFee = parseFloat(e.target.value) || 500;
                          setFormData({ ...formData, specialties: updated });
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">Available Specialists:</label>
                      <Input
                        type="number"
                        value={spec.availableDoctorsCount}
                        onChange={(e) => {
                          const updated = [...formData.specialties];
                          updated[sIdx].availableDoctorsCount = parseInt(e.target.value, 10) || 5;
                          setFormData({ ...formData, specialties: updated });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EMERGENCY CONTACTS */}
        {activeTab === 'contacts' && (
          <div className="space-y-4 p-4 rounded-3xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white uppercase font-mono text-[11px]">
              📞 24/7 Emergency Numbers & Support Desk:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Emergency Helpline:</label>
                <Input
                  value={formData.emergencyHotline}
                  onChange={(e) => setFormData({ ...formData, emergencyHotline: e.target.value })}
                  placeholder="+880 1700-000000"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Ambulance Rapid Dispatch:</label>
                <Input
                  value={formData.ambulanceHelpline}
                  onChange={(e) => setFormData({ ...formData, ambulanceHelpline: e.target.value })}
                  placeholder="10666 / 999"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Official Support Email:</label>
                <Input
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  placeholder="care@labmedix.health"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FAQS & ABOUT */}
        {activeTab === 'faqs' && (
          <div className="space-y-4 p-4 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Footer About Summary:</label>
              <textarea
                value={formData.footerAboutText}
                onChange={(e) => setFormData({ ...formData, footerAboutText: e.target.value })}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 font-black shadow-xl"
            leftIcon={<Save className="w-4 h-4" />}
          >
            💾 Publish Website Live (Super Admin)
          </Button>
        </div>
      </form>
    </Modal>
  );
};
