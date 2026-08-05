import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  PieChart as PieIcon, 
  Layers, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Heart
} from 'lucide-react';
import { PrayerEntry } from '../types';

interface PrayerAnalyticsWidgetProps {
  prayers: PrayerEntry[];
}

const CATEGORY_COLORS: Record<PrayerEntry['category'], string> = {
  Family: '#2563EB',    // Blue
  Healing: '#10B981',   // Emerald
  Guidance: '#8B5CF6',  // Purple
  Peace: '#6366F1',     // Indigo
  Gratitude: '#F59E0B', // Amber
  General: '#64748B'    // Slate
};

export const PrayerAnalyticsWidget: React.FC<PrayerAnalyticsWidgetProps> = ({ prayers }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeChartTab, setActiveChartTab] = useState<'answeredVsUnanswered' | 'categories'>('answeredVsUnanswered');
  const [timeframeMonths, setTimeframeMonths] = useState<number>(6);

  // Parse dates and compute aggregated monthly datasets
  const { monthlyData, categoryDistribution, stats } = useMemo(() => {
    const monthsMap: Record<string, { month: string; sortKey: string; answered: number; unanswered: number; total: number; Family: number; Healing: number; Guidance: number; Peace: number; Gratitude: number; General: number }> = {};
    const categoryCounts: Record<PrayerEntry['category'], number> = {
      Family: 0,
      Healing: 0,
      Guidance: 0,
      Peace: 0,
      Gratitude: 0,
      General: 0
    };

    let totalAnswered = 0;
    let totalUnanswered = 0;

    // Helper to format date into "MMM YYYY"
    const parseMonthYear = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const monthName = d.toLocaleString('en-US', { month: 'short' });
          const year = d.getFullYear();
          const sortKey = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return { label: `${monthName} '${String(year).slice(-2)}`, sortKey };
        }
      } catch (e) {
        // Fallback
      }
      return { label: "Recent", sortKey: "2026-07" };
    };

    // Ensure we have last N months as baseline buckets
    const now = new Date();
    for (let i = timeframeMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const sortKey = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthName} '${String(year).slice(-2)}`;
      
      monthsMap[sortKey] = {
        month: label,
        sortKey,
        answered: 0,
        unanswered: 0,
        total: 0,
        Family: 0,
        Healing: 0,
        Guidance: 0,
        Peace: 0,
        Gratitude: 0,
        General: 0
      };
    }

    // Populate actual user prayer data
    prayers.forEach((p) => {
      if (p.isAnswered) totalAnswered++;
      else totalUnanswered++;

      if (categoryCounts[p.category] !== undefined) {
        categoryCounts[p.category]++;
      }

      const { label, sortKey } = parseMonthYear(p.createdAt);
      if (!monthsMap[sortKey]) {
        monthsMap[sortKey] = {
          month: label,
          sortKey,
          answered: 0,
          unanswered: 0,
          total: 0,
          Family: 0,
          Healing: 0,
          Guidance: 0,
          Peace: 0,
          Gratitude: 0,
          General: 0
        };
      }

      monthsMap[sortKey].total++;
      if (p.isAnswered) {
        monthsMap[sortKey].answered++;
      } else {
        monthsMap[sortKey].unanswered++;
      }

      if (monthsMap[sortKey][p.category] !== undefined) {
        monthsMap[sortKey][p.category]++;
      }
    });

    // If data is sparse, provide realistic historical demo trend to display continuous visualization
    const sortedKeys = Object.keys(monthsMap).sort();
    const resultMonthly = sortedKeys.map(k => monthsMap[k]);

    // Check if empty or minimal
    const totalEntries = prayers.length;
    if (totalEntries === 0) {
      // Demo baseline if no prayers exist yet
      resultMonthly.forEach((item, idx) => {
        item.answered = (idx % 2) + 1;
        item.unanswered = ((idx + 1) % 3) + 1;
        item.total = item.answered + item.unanswered;
        item.Gratitude = 1;
        item.Peace = 1;
        item.Guidance = 1;
      });
    }

    // Category breakdown list for Pie chart
    const catDist = Object.entries(categoryCounts)
      .map(([name, val]) => ({
        name: name as PrayerEntry['category'],
        value: val > 0 ? val : (totalEntries === 0 ? 1 : 0),
        color: CATEGORY_COLORS[name as PrayerEntry['category']]
      }))
      .filter(item => item.value > 0);

    // Find top category
    const topCatPair = Object.entries(categoryCounts).reduce(
      (max, curr) => (curr[1] > max[1] ? curr : max),
      ['General', 0] as [string, number]
    );

    const answeredPercentage = totalEntries > 0 
      ? Math.round((totalAnswered / totalEntries) * 100)
      : 0;

    return {
      monthlyData: resultMonthly,
      categoryDistribution: catDist,
      stats: {
        total: totalEntries,
        answered: totalAnswered,
        unanswered: totalUnanswered,
        answeredRate: answeredPercentage,
        topCategory: topCatPair[0]
      }
    };
  }, [prayers, timeframeMonths]);

  return (
    <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-md overflow-hidden transition-all">
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-[#1E3A8A] to-[#122452] text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
            <BarChart3 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-300/20">
                Faith Insights
              </span>
              <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                {stats.total} Total Requests
              </span>
            </div>
            <h3 className="font-black text-base sm:text-lg text-white">
              Prayer Analytics & Monthly Breakdown
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10">
            <span className="text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {stats.answeredRate}% Answered
            </span>
          </div>

          <button 
            type="button"
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5 animate-fadeIn">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Total Prayers</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-slate-500 font-medium">Logged in journal</span>
            </div>

            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Answered
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5">{stats.answered}</div>
              <span className="text-[10px] text-emerald-700 font-bold">{stats.answeredRate}% Answered Rate</span>
            </div>

            <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80">
              <span className="text-[10px] font-extrabold uppercase text-amber-800 block flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> Active Requests
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-950 mt-0.5">{stats.unanswered}</div>
              <span className="text-[10px] text-amber-700 font-medium">Currently in prayer</span>
            </div>

            <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200/80">
              <span className="text-[10px] font-extrabold uppercase text-blue-800 block">Top Focus</span>
              <div className="text-base sm:text-lg font-black text-blue-950 mt-0.5 truncate">{stats.topCategory}</div>
              <span className="text-[10px] text-blue-700 font-medium">Most prayed category</span>
            </div>
          </div>

          {/* Chart Controls & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveChartTab('answeredVsUnanswered')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeChartTab === 'answeredVsUnanswered'
                    ? 'bg-[#1E3A8A] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Answered vs. Active
              </button>

              <button
                type="button"
                onClick={() => setActiveChartTab('categories')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeChartTab === 'categories'
                    ? 'bg-[#1E3A8A] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
                Category Breakdown
              </button>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              <span className="font-bold text-slate-500 text-[11px]">Timeframe:</span>
              <select
                value={timeframeMonths}
                onChange={(e) => setTimeframeMonths(Number(e.target.value))}
                className="py-1 px-2.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-xs text-slate-800 focus:outline-none"
              >
                <option value={3}>Last 3 Months</option>
                <option value={6}>Last 6 Months</option>
                <option value={12}>Full Year</option>
              </select>
            </div>
          </div>

          {/* CHART DISPLAY SECTION */}
          {activeChartTab === 'answeredVsUnanswered' ? (
            <div className="bg-slate-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Monthly Prayer Fulfillment Trend
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Answered (Emerald) vs Active (Amber)
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tick={{ fill: '#475569', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '14px',
                        border: '1px solid #334155',
                        color: '#FFF',
                        fontSize: '12px',
                        fontWeight: '600',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                      }}
                      itemStyle={{ color: '#F8FAFC' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: '700' }} 
                    />
                    <Bar dataKey="answered" name="Answered Prayers" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="unanswered" name="Active Requests" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Category Monthly Stacked Bar Chart */}
              <div className="md:col-span-7 bg-slate-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Monthly Category Trend
                </span>
                <div className="h-60 sm:h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                        axisLine={{ stroke: '#CBD5E1' }}
                      />
                      <YAxis 
                        allowDecimals={false}
                        tick={{ fill: '#475569', fontSize: 11 }}
                        axisLine={{ stroke: '#CBD5E1' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '14px',
                          border: '1px solid #334155',
                          color: '#FFF',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="Healing" stackId="a" fill={CATEGORY_COLORS.Healing} />
                      <Bar dataKey="Family" stackId="a" fill={CATEGORY_COLORS.Family} />
                      <Bar dataKey="Guidance" stackId="a" fill={CATEGORY_COLORS.Guidance} />
                      <Bar dataKey="Peace" stackId="a" fill={CATEGORY_COLORS.Peace} />
                      <Bar dataKey="Gratitude" stackId="a" fill={CATEGORY_COLORS.Gratitude} />
                      <Bar dataKey="General" stackId="a" fill={CATEGORY_COLORS.General} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Pie Chart Distribution */}
              <div className="md:col-span-5 bg-slate-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-purple-600" />
                  Overall Category Ratio
                </span>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          color: '#FFF',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Legend Badges */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {categoryDistribution.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: cat.color }} 
                      />
                      <span className="truncate">{cat.name}: {cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
