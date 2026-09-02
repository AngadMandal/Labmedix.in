import { PrescriptionTemplateTheme } from './smartLayoutTypes';

export interface ThemeConfigItem {
  name: string;
  subtext: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgClass: string;
  headerBg: string;
  borderClass: string;
  badgeClass: string;
  tableHeadBg: string;
  cardBg: string;
  fontClass: string;
}

export const THEME_CONFIGS: Record<PrescriptionTemplateTheme, ThemeConfigItem> = {
  apollo_modern: {
    name: 'Neo-Emerald',
    subtext: 'Apollo / Mayo Clinic Hospital Suite',
    icon: '🏥',
    primaryColor: '#0D9488',
    secondaryColor: '#0F766E',
    accentColor: '#10B981',
    bgClass: 'bg-white',
    headerBg: 'bg-gradient-to-r from-teal-800 via-teal-900 to-emerald-900',
    borderClass: 'border-teal-500 shadow-teal-500/15',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
    tableHeadBg: 'bg-teal-800 text-white',
    cardBg: 'bg-teal-50/60 border-teal-200',
    fontClass: 'font-sans'
  },
  executive_slate: {
    name: 'Royal Cobalt',
    subtext: 'Max / Fortis Luxury Clinical Suite',
    icon: '💎',
    primaryColor: '#1E293B',
    secondaryColor: '#0F172A',
    accentColor: '#2563EB',
    bgClass: 'bg-white',
    headerBg: 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900',
    borderClass: 'border-blue-600 shadow-blue-500/15',
    badgeClass: 'bg-blue-50 text-blue-900 border-blue-300',
    tableHeadBg: 'bg-slate-900 text-white',
    cardBg: 'bg-slate-50 border-slate-200',
    fontClass: 'font-sans'
  },
  academic_crest: {
    name: 'Imperial Gold',
    subtext: 'AIIMS / Heritage Medical College',
    icon: '👑',
    primaryColor: '#881337',
    secondaryColor: '#4C0519',
    accentColor: '#D97706',
    bgClass: 'bg-amber-50/25',
    headerBg: 'bg-gradient-to-r from-rose-950 via-amber-950 to-rose-950',
    borderClass: 'border-amber-600 shadow-amber-500/15',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    tableHeadBg: 'bg-rose-950 text-amber-100',
    cardBg: 'bg-amber-50/70 border-amber-200',
    fontClass: 'font-serif'
  },
  cyber_health: {
    name: 'Future-Tech',
    subtext: 'Precision Next-Gen Telehealth Suite',
    icon: '🔬',
    primaryColor: '#06B6D4',
    secondaryColor: '#0891B2',
    accentColor: '#6366F1',
    bgClass: 'bg-slate-950 text-slate-100',
    headerBg: 'bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950',
    borderClass: 'border-cyan-500 shadow-cyan-500/25',
    badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-700',
    tableHeadBg: 'bg-cyan-900 text-white',
    cardBg: 'bg-slate-900 border-cyan-800',
    fontClass: 'font-sans'
  },
  swiss_minimal: {
    name: 'Swiss Clean',
    subtext: 'Minimalist Monochromatic Architecture',
    icon: '🍃',
    primaryColor: '#18181B',
    secondaryColor: '#27272A',
    accentColor: '#71717A',
    bgClass: 'bg-white',
    headerBg: 'bg-gradient-to-r from-zinc-950 to-zinc-800',
    borderClass: 'border-zinc-400 shadow-zinc-500/10',
    badgeClass: 'bg-zinc-100 text-zinc-900 border-zinc-300',
    tableHeadBg: 'bg-zinc-900 text-white',
    cardBg: 'bg-zinc-50 border-zinc-200',
    fontClass: 'font-sans'
  },
  velvet_orchid: {
    name: 'Velvet Orchid',
    subtext: 'Specialty Care & Maternal Wellness',
    icon: '💜',
    primaryColor: '#7E22CE',
    secondaryColor: '#6B21A8',
    accentColor: '#EC4899',
    bgClass: 'bg-white',
    headerBg: 'bg-gradient-to-r from-purple-950 via-fuchsia-950 to-purple-950',
    borderClass: 'border-purple-500 shadow-purple-500/15',
    badgeClass: 'bg-purple-50 text-purple-900 border-purple-300',
    tableHeadBg: 'bg-purple-900 text-white',
    cardBg: 'bg-purple-50/60 border-purple-200',
    fontClass: 'font-sans'
  }
};
