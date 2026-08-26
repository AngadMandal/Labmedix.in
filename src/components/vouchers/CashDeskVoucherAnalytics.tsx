import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart
} from 'recharts';
import { CashDeskVoucher, VoucherCategory } from '../../types';
import { VOUCHER_CATEGORIES } from '../../services/cashDeskVoucherService';
import { formatCurrency } from '../../utils/formatters';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Coins,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Clock
} from 'lucide-react';

interface CashDeskVoucherAnalyticsProps {
  vouchers: CashDeskVoucher[];
}

const CATEGORY_COLORS: Record<string, string> = {
  opd_consultation: '#0D9488', // Teal
  diagnostic_lab: '#6366F1',   // Indigo
  pharmacy_meds: '#10B981',    // Emerald
  emergency_float: '#F43F5E',  // Rose
  health_card_topup: '#F59E0B',// Amber
  all_purpose_cash: '#8B5CF6'  // Purple
};

export const CashDeskVoucherAnalytics: React.FC<CashDeskVoucherAnalyticsProps> = ({ vouchers }) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'categories' | 'departments'>('trends');

  // Calculate Current Month Daily Trends
  const { dailyTrendData, monthTotals, categoryData, departmentData } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayMap: Record<number, { day: number; label: string; issuedAmount: number; redeemedAmount: number; count: number }> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      dayMap[d] = {
        day: d,
        label: `${d} ${dayName}`,
        issuedAmount: 0,
        redeemedAmount: 0,
        count: 0
      };
    }

    let totalIssuedMonth = 0;
    let totalRedeemedMonth = 0;
    let totalCountMonth = 0;
    let activeFloatMonth = 0;
    let lockedCountMonth = 0;

    const catTotals: Record<string, { key: string; name: string; value: number; count: number; color: string }> = {};
    const deptTotals: Record<string, { department: string; amount: number; count: number }> = {};

    vouchers.forEach(v => {
      const createdDate = new Date(v.createdAt || v.validFrom);
      const isCurrentMonth = createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth;

      // Category breakdown (all or current month)
      const catKey = v.category;
      const catConfig = VOUCHER_CATEGORIES[catKey as VoucherCategory];
      const catName = catConfig ? catConfig.name : catKey;
      const catColor = CATEGORY_COLORS[catKey] || '#3B82F6';

      if (!catTotals[catKey]) {
        catTotals[catKey] = {
          key: catKey,
          name: catName,
          value: 0,
          count: 0,
          color: catColor
        };
      }
      catTotals[catKey].value += v.amount;
      catTotals[catKey].count += 1;

      // Department breakdown
      const deptName = v.departmentRestriction || 'Universal Cash Desk';
      if (!deptTotals[deptName]) {
        deptTotals[deptName] = { department: deptName, amount: 0, count: 0 };
      }
      deptTotals[deptName].amount += v.amount;
      deptTotals[deptName].count += 1;

      if (v.status === 'active') {
        activeFloatMonth += v.amount;
      }
      if (v.isLocked || v.status === 'locked') {
        lockedCountMonth += 1;
      }

      if (isCurrentMonth) {
        const dayNum = createdDate.getDate();
        if (dayMap[dayNum]) {
          dayMap[dayNum].issuedAmount += v.amount;
          dayMap[dayNum].count += 1;
        }
        totalIssuedMonth += v.amount;
        totalCountMonth += 1;

        if (v.status === 'redeemed' && v.redeemedAt) {
          const redeemedDate = new Date(v.redeemedAt);
          if (redeemedDate.getFullYear() === currentYear && redeemedDate.getMonth() === currentMonth) {
            const rDay = redeemedDate.getDate();
            if (dayMap[rDay]) {
              dayMap[rDay].redeemedAmount += v.amount;
            }
            totalRedeemedMonth += v.amount;
          }
        }
      }
    });

    const monthName = now.toLocaleString('default', { month: 'long' });
    const clearanceRate = totalIssuedMonth > 0 ? Math.round((totalRedeemedMonth / totalIssuedMonth) * 100) : 0;

    return {
      dailyTrendData: Object.values(dayMap),
      monthTotals: {
        monthName,
        currentYear,
        totalIssuedMonth,
        totalRedeemedMonth,
        totalCountMonth,
        activeFloatMonth,
        lockedCountMonth,
        clearanceRate
      },
      categoryData: Object.values(catTotals),
      departmentData: Object.values(deptTotals).sort((a, b) => b.amount - a.amount).slice(0, 6)
    };
  }, [vouchers]);

  return (
    <div className="space-y-4">
      {/* Month Highlights Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-900/40 via-slate-900 to-slate-900 border border-teal-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-teal-300 font-mono">
              {monthTotals.monthName} Float Issued
            </span>
            <Coins className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1 tracking-tight">
            {formatCurrency(monthTotals.totalIssuedMonth)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-teal-400 font-medium mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{monthTotals.totalCountMonth} Vouchers Minted</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
              Cleared & Redeemed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1 tracking-tight">
            {formatCurrency(monthTotals.totalRedeemedMonth)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            {monthTotals.clearanceRate}% Monthly Clearance Rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-900/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-300 font-mono">
              Active Unredeemed Float
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1 tracking-tight">
            {formatCurrency(monthTotals.activeFloatMonth)}
          </p>
          <span className="text-[11px] text-amber-400/80 font-mono block mt-1">
            Available for POS Redemption
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
              Security & Anti-Tamper
            </span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-300 font-mono mt-1 tracking-tight">
            256-bit SHA
          </p>
          <span className="text-[11px] text-indigo-300/80 font-mono block mt-1">
            {monthTotals.lockedCountMonth} Locked Security Alerts
          </span>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="p-5 rounded-3xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        {/* Header & Chart Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Cash Desk Financial Analytics & Trends ({monthTotals.monthName} {monthTotals.currentYear})
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Daily revenue, issue volumes, and departmental float distribution powered by Recharts
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'trends'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily Trends</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('departments')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'departments'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Departments</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DAILY REVENUE & VOUCHER ISSUE TRENDS */}
        {activeTab === 'trends' && (
          <div className="space-y-2">
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="issuedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="redeemedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `Day ${val}`}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val} qty`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '16px',
                      color: '#F8FAFC',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Issued Float (₹)') return [formatCurrency(Number(value)), name];
                      if (name === 'Redeemed Float (₹)') return [formatCurrency(Number(value)), name];
                      return [`${value} vouchers`, name];
                    }}
                    labelFormatter={(label) => `Day ${label} of ${monthTotals.monthName}`}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="issuedAmount"
                    name="Issued Float (₹)"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#issuedGradient)"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="redeemedAmount"
                    name="Redeemed Float (₹)"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#redeemedGradient)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="count"
                    name="Voucher Count"
                    fill="#6366F1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={16}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-2 pt-1 border-t border-slate-800/60">
              <span>● Teal Area: Daily Issued Float Value (₹)</span>
              <span>● Emerald Area: Daily Redeemed Float (₹)</span>
              <span>● Indigo Bars: Vouchers Minted Daily</span>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY ALLOCATION BREAKDOWN */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '16px',
                      color: '#F8FAFC'
                    }}
                    formatter={(value: any, name: any, item: any) => [
                      `${formatCurrency(Number(value))} (${item.payload.count} vouchers)`,
                      item.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Category Float Distribution
              </h4>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {categoryData.map(cat => (
                  <div
                    key={cat.key}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-200 font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <strong className="text-white block">{formatCurrency(cat.value)}</strong>
                      <span className="text-[10px] text-slate-400">{cat.count} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENT ALLOCATION */}
        {activeTab === 'departments' && (
          <div className="space-y-2 pt-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <YAxis type="category" dataKey="department" stroke="#94A3B8" fontSize={11} width={95} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '16px',
                      color: '#F8FAFC'
                    }}
                    formatter={(value: any, name: string) => [formatCurrency(Number(value)), 'Float Allocation']}
                  />
                  <Bar dataKey="amount" fill="#8B5CF6" radius={[0, 8, 8, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 font-mono text-center">
              Top hospital clinical departments and cash desk counters ranked by assigned voucher float value.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
