import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { WebsiteService, WebsiteCMSConfig, WebsiteCardTierConfig, WebsiteDoctorSpecialty } from '../../services/websiteService';
import { CatalogService } from '../../services/catalogService';
import { StorageService } from '../../services/storage';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { Button } from '../../components/common/Button';
import {
  Crown, Sparkles, Globe, Eye, Save, RotateCcw, Activity,
  Stethoscope, TestTube, Package, MessageSquare, Award, CheckCircle2,
  ExternalLink, Edit, BarChart3, Users, Star, RefreshCw,
  Zap, FileText, HelpCircle, Radio, CreditCard, Hash,
  AlignLeft, Mail, Phone, Bell
} from 'lucide-react';

type TabId = 'hero' | 'cards' | 'specialties' | 'testimonials' | 'stats' | 'faqs';

interface LiveStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  source: string;
}

/* Helper sub-components */
const SH: React.FC<{ title: string; icon: React.ElementType; ic: string; sub: string }> = ({ title, icon: Icon, ic, sub }) => (
  <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: ic + '22' }}>
    <h3 className="text-base font-black text-white flex items-center gap-2">
      <Icon className="w-5 h-5" style={{ color: ic }} />
      {title}
    </h3>
    <span className="text-[10px] font-mono text-slate-500">{sub}</span>
  </div>
);

const CI: React.FC<{ value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => (
  <input
    className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-white focus:outline-none"
    style={{ background: 'rgba(30,58,138,0.15)', border: '1px solid rgba(30,58,138,0.40)' }}
    value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
  />
);

const F: React.FC<{ label: string; icon: React.ElementType; children: React.ReactNode }> = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-slate-500" />{label}
    </label>
    {children}
  </div>
);

const F2: React.FC<{ label: string; icon: React.ElementType; children: React.ReactNode }> = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5 md:col-span-2">
    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-slate-500" />{label}
    </label>
    {children}
  </div>
);

const TA_STYLE = { background: 'rgba(30,58,138,0.15)', border: '1px solid rgba(30,58,138,0.40)' };

export const WebsiteCmsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  StorageService.getCompanyProfile();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [config, setConfig] = useState<WebsiteCMSConfig>(() => WebsiteService.getWebsiteConfig());
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const [liveStats, setLiveStats] = useState<LiveStat[]>([]);
  const [autoFetchDone, setAutoFetchDone] = useState(false);

  useEffect(() => {
    const patients = StorageService.getPatients() || [];
    const tests = CatalogService.getLabTests() || [];
    const packages = CatalogService.getHealthPackages() || [];
    setLiveStats([
      { label: 'Registered Patients',  value: patients.length > 0 ? patients.length.toLocaleString() + '+' : '—', icon: Users,      color: '#4ade80', source: 'Admin → Patients' },
      { label: 'Lab Tests Available',  value: tests.length > 0    ? String(tests.length)    : '—',              icon: TestTube,   color: '#c084fc', source: 'Admin → Test Master' },
      { label: 'Health Packages',      value: packages.length > 0 ? String(packages.length) : '—',              icon: Package,    color: '#f59e0b', source: 'Admin → Test Master' },
      { label: 'Card Tiers Active',    value: String(config.cardTiers.length),                                   icon: CreditCard, color: '#60a5fa', source: 'CMS Studio' },
    ]);
    setAutoFetchDone(true);
  }, []);

  const updateField = (field: keyof WebsiteCMSConfig, value: any) =>
    setConfig(prev => ({ ...prev, [field]: value }));

  const updateCardTier = (index: number, key: keyof WebsiteCardTierConfig, val: any) => {
    const u = [...config.cardTiers];
    u[index] = { ...u[index], [key]: val };
    setConfig(prev => ({ ...prev, cardTiers: u }));
  };

  const updateSpecialty = (index: number, key: keyof WebsiteDoctorSpecialty, val: any) => {
    const u = [...config.specialties];
    u[index] = { ...u[index], [key]: val };
    setConfig(prev => ({ ...prev, specialties: u }));
  };

  const handlePublish = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isSuperAdmin) { showToast('error', 'Access Denied', 'Only Super Admin can publish.'); return; }
    setIsSaving(true);
    WebsiteService.saveWebsiteConfig(config);
    setLastSaved(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    setIsSaving(false);
    triggerCelebrationFireworks();
    showToast('success', '✅ 3D Website Published!', 'Changes are now live on the public homepage.');
  };

  const handleReset = () => {
    if (!isSuperAdmin) return;
    if (window.confirm('Reset all 3D Website CMS content to factory defaults?')) {
      setConfig(WebsiteService.resetWebsiteConfig());
      triggerCelebrationFireworks();
      showToast('info', 'Website Reset', 'Restored original configuration.');
    }
  };

  const TABS = [
    { id: 'hero'         as TabId, label: 'Hero & Announcements', icon: Sparkles,      color: '#818cf8' },
    { id: 'stats'        as TabId, label: 'Live Stats & Numbers',  icon: BarChart3,     color: '#4ade80', badge: 'AUTO' },
    { id: 'cards'        as TabId, label: '3D Health Card Tiers',  icon: Award,         color: '#f59e0b' },
    { id: 'specialties'  as TabId, label: 'Doctor Specialties',    icon: Stethoscope,   color: '#60a5fa' },
    { id: 'testimonials' as TabId, label: 'Patient Testimonials',  icon: MessageSquare, color: '#fb7185' },
    { id: 'faqs'         as TabId, label: 'FAQs & Footer',         icon: HelpCircle,    color: '#a78bfa' },
  ];

  const panel = (bc: string) => ({
    background: 'linear-gradient(135deg,rgba(10,22,40,0.97),rgba(6,13,31,0.99))',
    border: `1px solid ${bc}`,
    boxShadow: `0 0 40px ${bc}20`,
  });

  const TIER_COLORS: Record<string, string> = { Silver: '#94a3b8', Gold: '#f59e0b', Platinum: '#818cf8', VIP: '#fb7185' };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">

      {/* HEADER BANNER */}
      <div className="relative rounded-3xl p-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#060d1f 0%,#0d1a35 50%,#0a1a2e 100%)', border: '1px solid rgba(30,58,138,0.5)', boxShadow: '0 0 60px rgba(30,58,138,0.18)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(21,128,61,0.18),transparent 70%)' }} />
        <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(30,58,138,0.22),transparent 70%)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(21,128,61,0.35),rgba(30,58,138,0.50))', border: '1px solid rgba(74,222,128,0.3)', boxShadow: '0 0 20px rgba(21,128,61,0.25)' }}>
              <Globe className="w-7 h-7 text-green-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-black tracking-tight text-white">3D Website Customizer &amp; CMS Studio</h2>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black"
                  style={{ background: 'rgba(124,58,237,0.25)', color: '#c084fc', border: '1px solid rgba(124,58,237,0.4)' }}>
                  👑 Super Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">Hospital-grade live control room. Edit hero content, health card pricing, doctor specialties, testimonials &amp; FAQs. Publishes instantly to the 3D website.</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(21,128,61,0.18)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {autoFetchDone ? '✓ Auto-Fetched from Admin Portal' : 'Fetching live data…'}
                </div>
                {lastSaved && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(30,58,138,0.18)', border: '1px solid rgba(96,165,250,0.3)', color: '#93c5fd' }}>
                    <Save className="w-3 h-3" /> Last saved: {lastSaved}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a href="#/home" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105"
              style={{ background: 'rgba(30,58,138,0.25)', border: '1px solid rgba(96,165,250,0.35)', color: '#93c5fd' }}>
              <Eye className="w-4 h-4" /> Live Preview <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            {isSuperAdmin && (
              <button type="button" onClick={handleReset}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
            <button type="button" onClick={() => handlePublish()} disabled={!isSuperAdmin || isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-black text-sm text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)', boxShadow: '0 0 24px rgba(21,128,61,0.4)', border: '1px solid rgba(74,222,128,0.3)' }}>
              <Save className="w-4 h-4" /> {isSaving ? 'Publishing…' : '⚡ Publish Changes Live'}
            </button>
          </div>
        </div>
      </div>

      {/* LIVE DATA WIDGETS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {liveStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-2xl p-4 space-y-2"
              style={{ background: 'linear-gradient(135deg,rgba(10,22,40,0.92),rgba(6,13,31,0.97))', border: `1px solid ${stat.color}30`, boxShadow: `0 0 20px ${stat.color}10` }}>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded" style={{ background: `${stat.color}18`, color: stat.color }}>LIVE</span>
              </div>
              <div>
                <div className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[11px] text-slate-400 font-semibold">{stat.label}</div>
                <div className="text-[9px] text-slate-600 font-mono mt-0.5">↳ {stat.source}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACCESS STATUS */}
      {!isSuperAdmin ? (
        <div className="p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold"
          style={{ background: 'rgba(180,83,9,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fde68a' }}>
          <Crown className="w-5 h-5 text-amber-400 shrink-0" />
          <span><strong>Read-Only Mode:</strong> Only Root Super Administrator can publish changes to the live website.</span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl flex items-center justify-between text-xs"
          style={{ background: 'linear-gradient(90deg,rgba(21,128,61,0.12),rgba(30,58,138,0.12))', border: '1px solid rgba(74,222,128,0.25)' }}>
          <div className="flex items-center gap-2 text-green-300">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span><strong>Super Admin Access:</strong> Edits publish instantly to <strong className="text-white">/home</strong> on click of Publish.</span>
          </div>
          <span className="font-mono text-[10px] text-blue-400 font-bold shrink-0">Standard INR ₹ • Live Sync Active</span>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ borderBottom: '1px solid rgba(30,58,138,0.25)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap"
              style={active
                ? { background: `linear-gradient(135deg,${tab.color}28,rgba(30,58,138,0.25))`, border: `1px solid ${tab.color}50`, color: tab.color, boxShadow: `0 0 14px ${tab.color}20` }
                : { background: 'rgba(10,22,40,0.60)', border: '1px solid rgba(30,58,138,0.25)', color: '#94a3b8' }}>
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded font-black text-[8px] font-mono"
                  style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)' }}>{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HERO */}
      {activeTab === 'hero' && (
        <div className="rounded-3xl p-6 space-y-6" style={panel('rgba(30,58,138,0.35)')}>
          <SH title="Public Homepage — Hero & Announcement Controls" icon={Sparkles} ic="#818cf8" sub="Section 1 of 6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F2 label="⚡ Top Announcement Ticker" icon={Bell}>
              <textarea className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-white focus:outline-none resize-none" style={TA_STYLE}
                rows={2} value={config.announcementTicker} onChange={e => updateField('announcementTicker', e.target.value)} disabled={!isSuperAdmin} />
            </F2>
            <F label="🏥 Hero Badge / Tagline" icon={Award}><CI value={config.heroBadge} onChange={v => updateField('heroBadge', v)} disabled={!isSuperAdmin} /></F>
            <F label="📞 Emergency Hotline" icon={Phone}><CI value={config.emergencyHotline} onChange={v => updateField('emergencyHotline', v)} disabled={!isSuperAdmin} /></F>
            <F label="🚑 Ambulance Helpline" icon={Activity}><CI value={config.ambulanceHelpline} onChange={v => updateField('ambulanceHelpline', v)} disabled={!isSuperAdmin} /></F>
            <F label="📧 Support Email" icon={Mail}><CI value={config.supportEmail} onChange={v => updateField('supportEmail', v)} disabled={!isSuperAdmin} /></F>
            <F label="🔘 Primary CTA Button Text" icon={Zap}><CI value={config.heroCtaPrimaryText} onChange={v => updateField('heroCtaPrimaryText', v)} disabled={!isSuperAdmin} /></F>
            <F2 label="Main Hero Headline" icon={AlignLeft}><CI value={config.heroTitle} onChange={v => updateField('heroTitle', v)} disabled={!isSuperAdmin} /></F2>
            <F2 label="Hero Sub-Description" icon={FileText}>
              <textarea className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-white focus:outline-none resize-none" style={TA_STYLE}
                rows={3} value={config.heroSubtitle} onChange={e => updateField('heroSubtitle', e.target.value)} disabled={!isSuperAdmin} />
            </F2>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE STATS */}
      {activeTab === 'stats' && (
        <div className="rounded-3xl p-6 space-y-6" style={panel('rgba(21,128,61,0.35)')}>
          <SH title="Live Hospital Statistics — Auto-Fetched & Editable" icon={BarChart3} ic="#4ade80" sub="Admin Data Source" />
          <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(21,128,61,0.08)', border: '1px solid rgba(74,222,128,0.20)' }}>
            <div className="flex items-center gap-2 text-xs font-bold text-green-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              AUTO-FETCHED FROM ADMIN PORTAL (Read-Only, Real-Time)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {liveStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-3 rounded-xl space-y-1" style={{ background: 'rgba(10,22,40,0.70)', border: `1px solid ${stat.color}25` }}>
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    <div className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-[10px] text-slate-400">{stat.label}</div>
                    <div className="text-[9px] font-mono" style={{ color: `${stat.color}80` }}>↳ {stat.source}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Edit className="w-3.5 h-3.5" /> EDITABLE DISPLAY NUMBERS (Shown in Hero Section on Public Website)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {([['happyCardholders','😊 Happy Cardholders'],['labTestsProcessed','🧪 Lab Tests Processed'],['doctorConsultations','🩺 Doctor Consultations'],['partnerHospitals','🏥 Partner Hospitals'],['diagnosticAccuracy','🎯 Diagnostic Accuracy %']] as [string,string][]).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 block">{label}</label>
                  <CI value={(config.stats as any)[key]} onChange={v => setConfig(prev => ({ ...prev, stats: { ...prev.stats, [key]: v } }))} disabled={!isSuperAdmin} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH CARD TIERS */}
      {activeTab === 'cards' && (
        <div className="rounded-3xl p-6 space-y-6" style={panel('rgba(180,83,9,0.35)')}>
          <SH title="3D Smart Health Card Tiers & Pricing Matrix (INR ₹)" icon={Award} ic="#f59e0b" sub={`${config.cardTiers.length} Active Tiers`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {config.cardTiers.map((tier, idx) => {
              const c = TIER_COLORS[tier.tier] || '#4ade80';
              return (
                <div key={tier.id} className="rounded-2xl p-5 space-y-4"
                  style={{ background: 'rgba(10,22,40,0.80)', border: `1px solid ${c}30`, boxShadow: `0 0 20px ${c}10` }}>
                  <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${c}25` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${c}20`, border: `1px solid ${c}40` }}>
                        <CreditCard className="w-4 h-4" style={{ color: c }} />
                      </div>
                      <strong className="text-sm font-black text-white">{tier.name}</strong>
                      {tier.popular && <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase" style={{ background: '#f59e0b', color: '#000' }}>⭐ POPULAR</span>}
                    </div>
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}35` }}>{tier.tier}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {([['annualFee','Annual Fee (₹)'],['discountPercentage','Discount % on Tests'],['cashbackPercentage','Cashback % (Wallet)'],['familyMembersCovered','Family Members']] as [string,string][]).map(([key, label]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">{label}</label>
                        <input type="number" className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none"
                          style={{ background: 'rgba(6,13,31,0.70)', border: `1px solid ${c}25` }}
                          value={(tier as any)[key]} onChange={e => updateCardTier(idx, key as any, parseFloat(e.target.value) || 0)} disabled={!isSuperAdmin} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-2">Included Perks ({tier.perks?.length || 0})</label>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {(tier.perks || []).map((perk, pi) => (
                        <div key={pi} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: c }} /><span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DOCTOR SPECIALTIES */}
      {activeTab === 'specialties' && (
        <div className="rounded-3xl p-6 space-y-6" style={panel('rgba(30,58,138,0.35)')}>
          <SH title="Doctor Consultation Specialties & Fees (INR ₹)" icon={Stethoscope} ic="#60a5fa" sub={`${config.specialties.length} Specialties`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.specialties.map((spec, sIdx) => (
              <div key={spec.id} className="p-5 rounded-2xl space-y-3" style={{ background: 'rgba(10,22,40,0.80)', border: '1px solid rgba(30,58,138,0.30)' }}>
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(30,58,138,0.25)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.18)', border: '1px solid rgba(96,165,250,0.35)' }}>
                      <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <strong className="text-sm font-black text-white">{spec.name}</strong>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{spec.department}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Consultation Fee (₹)</label>
                    <input type="number" className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none"
                      style={{ background: 'rgba(6,13,31,0.70)', border: '1px solid rgba(96,165,250,0.25)' }}
                      value={spec.consultationFee} onChange={e => updateSpecialty(sIdx, 'consultationFee', parseFloat(e.target.value) || 500)} disabled={!isSuperAdmin} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Department</label>
                    <input className="w-full px-3 py-2 rounded-xl text-xs font-medium text-white focus:outline-none"
                      style={{ background: 'rgba(6,13,31,0.70)', border: '1px solid rgba(96,165,250,0.25)' }}
                      value={spec.department} onChange={e => updateSpecialty(sIdx, 'department', e.target.value)} disabled={!isSuperAdmin} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block">Clinical Description</label>
                    <input className="w-full px-3 py-2 rounded-xl text-xs font-medium text-white focus:outline-none"
                      style={{ background: 'rgba(6,13,31,0.70)', border: '1px solid rgba(96,165,250,0.25)' }}
                      value={spec.description} onChange={e => updateSpecialty(sIdx, 'description', e.target.value)} disabled={!isSuperAdmin} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="rounded-3xl p-6 space-y-6" style={panel('rgba(251,113,133,0.30)')}>
          <SH title="Verified Patient Testimonials & Trust Reviews" icon={MessageSquare} ic="#fb7185" sub={`${config.testimonials.length} Reviews`} />
          <div className="space-y-4">
            {config.testimonials.map((test, tIdx) => (
              <div key={test.id} className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(10,22,40,0.80)', border: '1px solid rgba(251,113,133,0.20)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
                      style={{ background: 'linear-gradient(135deg,#15803d,#1e3a8a)' }}>{test.name[0]}</div>
                    <div>
                      <strong className="text-xs font-bold text-white">{test.name}</strong>
                      <span className="text-[10px] text-slate-500 font-mono ml-2">({test.location})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3"
                          style={{ color: i < test.rating ? '#f59e0b' : '#1e293b', fill: i < test.rating ? '#f59e0b' : 'transparent' }} />
                      ))}
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.30)' }}>{test.cardTier}</span>
                  </div>
                </div>
                <textarea className="w-full px-3 py-2.5 rounded-xl text-xs text-slate-300 focus:outline-none resize-none"
                  style={{ background: 'rgba(6,13,31,0.70)', border: '1px solid rgba(251,113,133,0.20)' }} rows={2}
                  value={test.comment}
                  onChange={e => { const u = [...config.testimonials]; u[tIdx] = { ...u[tIdx], comment: e.target.value }; setConfig({ ...config, testimonials: u }); }}
                  disabled={!isSuperAdmin} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FAQS & FOOTER */}
      {activeTab === 'faqs' && (
        <div className="rounded-3xl p-6 space-y-6" style={panel('rgba(167,139,250,0.30)')}>
          <SH title="Public FAQs & Footer About Text" icon={HelpCircle} ic="#a78bfa" sub={`${config.faqs?.length || 0} FAQs`} />
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5 text-purple-400" /> Footer &quot;About LABMEDIX&quot; Text
            </label>
            <textarea className="w-full px-3 py-2.5 rounded-xl text-xs text-slate-300 focus:outline-none resize-none"
              style={{ background: 'rgba(30,58,138,0.12)', border: '1px solid rgba(167,139,250,0.25)' }} rows={3}
              value={config.footerAboutText || ''} onChange={e => updateField('footerAboutText', e.target.value)} disabled={!isSuperAdmin} />
          </div>
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> FREQUENTLY ASKED QUESTIONS
            </div>
            {(config.faqs || []).map((faq, fIdx) => (
              <div key={fIdx} className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(10,22,40,0.80)', border: '1px solid rgba(167,139,250,0.20)' }}>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-400">
                  <Hash className="w-3 h-3" /> FAQ {fIdx + 1}
                </div>
                <input className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none"
                  style={{ background: 'rgba(6,13,31,0.70)', border: '1px solid rgba(167,139,250,0.25)' }} placeholder="Question…"
                  value={faq.question}
                  onChange={e => { const u = [...(config.faqs || [])]; u[fIdx] = { ...u[fIdx], question: e.target.value }; updateField('faqs', u); }}
                  disabled={!isSuperAdmin} />
                <textarea className="w-full px-3 py-2 rounded-xl text-xs text-slate-400 focus:outline-none resize-none"
                  style={{ background: 'rgba(6,13,31,0.70)', border: '1px solid rgba(167,139,250,0.20)' }} rows={2} placeholder="Answer…"
                  value={faq.answer}
                  onChange={e => { const u = [...(config.faqs || [])]; u[fIdx] = { ...u[fIdx], answer: e.target.value }; updateField('faqs', u); }}
                  disabled={!isSuperAdmin} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STICKY FLOATING SAVE FOOTER */}
      {isSuperAdmin && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-2xl px-5 py-3.5 z-20"
          style={{ background: 'rgba(6,13,31,0.94)', border: '1px solid rgba(21,128,61,0.40)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(21,128,61,0.15)' }}>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            <span>Changes are <strong className="text-white">not yet live</strong> — click Publish to update the 3D Website.</span>
          </div>
          <button type="button" onClick={() => handlePublish()} disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-black text-sm text-white transition-all hover:scale-105 shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#15803d,#1e3a8a)', boxShadow: '0 0 20px rgba(21,128,61,0.35)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <Zap className="w-4 h-4 text-green-200" />
            {isSaving ? 'Publishing…' : 'Publish Changes Live'}
          </button>
        </div>
      )}
    </div>
  );
};
