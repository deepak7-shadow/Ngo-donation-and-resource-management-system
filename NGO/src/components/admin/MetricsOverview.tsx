import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useNGO } from '../../context/NGOContext';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, RefreshCw, Award, AlertTriangle } from 'lucide-react';

export const MetricsOverview: React.FC = () => {
  const { state } = useNGO();

  // Inflow vs Outflow aggregation by month
  const monthlyCashflowData = useMemo(() => {
    const months = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026'];
    const map: Record<string, { month: string; inflow: number; outflow: number }> = {};

    months.forEach(m => {
      map[m] = { month: m, inflow: 0, outflow: 0 };
    });

    // Populate inflows
    state.donations.forEach(d => {
      const date = new Date(d.createdAt);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (map[key]) {
        map[key].inflow += d.amount;
      }
    });

    // Populate outflows
    state.expenses.forEach(e => {
      const date = new Date(e.date);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (map[key]) {
        map[key].outflow += e.amount;
      }
    });

    return Object.values(map);
  }, [state.donations, state.expenses]);

  // Monthly Recurring Retention
  const recurringMetrics = useMemo(() => {
    const recurringDonations = state.donations.filter(d => d.frequency === 'monthly');
    const recurringRevenue = recurringDonations.reduce((acc, d) => acc + d.amount, 0);
    const retentionRate = 94.6; // benchmark retention
    return {
      count: recurringDonations.length,
      revenue: recurringRevenue,
      rate: retentionRate,
    };
  }, [state.donations]);

  // Volunteer hours distribution by skill
  const volunteerHoursBySkill = useMemo(() => {
    const skillMap: Record<string, number> = {};
    state.volunteers.forEach(v => {
      const primarySkill = v.skills[0] || 'General Aid';
      skillMap[primarySkill] = (skillMap[primarySkill] || 0) + v.totalHours;
    });

    return Object.entries(skillMap)
      .map(([skill, hours]) => ({ skill, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  }, [state.volunteers]);

  // Low stock count
  const criticalItemsCount = state.inventory.filter(i => i.status === 'critical').length;
  const lowStockCount = state.inventory.filter(i => i.status === 'low-stock').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Monthly Inflow Health
            </span>
            <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginTop: 'var(--space-2)' }}>
            +18.4%
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
            Capital surplus maintained
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Sustainer Retention Rate
            </span>
            <RefreshCw size={18} style={{ color: 'var(--color-teal-600)' }} />
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-teal-600)', marginTop: 'var(--space-2)' }}>
            {recurringMetrics.rate}%
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
            {recurringMetrics.count} active recurring donors
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Volunteer Service Surge
            </span>
            <Award size={18} style={{ color: 'var(--color-accent-500)' }} />
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-accent-600)', marginTop: 'var(--space-2)' }}>
            {state.volunteers.reduce((acc, v) => acc + v.totalHours, 0)} hrs
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
            Across 12 scheduled missions
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Inventory Pressure
            </span>
            <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-danger)', marginTop: 'var(--space-2)' }}>
            {criticalItemsCount} Critical
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
            +{lowStockCount} items nearing threshold
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflow vs Outflow Bar Chart */}
        <div className="glass-panel" style={{ padding: 'var(--space-6)' }}>
          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Capital Inflow vs Verified Field Outflow (Past 5 Months)
          </h4>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCashflowData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" fontSize={11} stroke="var(--color-text-muted)" />
                <YAxis
                  fontSize={11}
                  stroke="var(--color-text-muted)"
                  tickFormatter={val => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: unknown) => {
                    const numVal = typeof val === 'number' ? val : Number(val) || 0;
                    return [formatCurrency(numVal), ''];
                  }}
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 'var(--text-xs)', paddingTop: '10px' }} />
                <Bar dataKey="inflow" name="Donations Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Aid Outflow" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volunteer Service Hours by Discipline */}
        <div className="glass-panel" style={{ padding: 'var(--space-6)' }}>
          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Deployable Volunteer Hours by Primary Discipline
          </h4>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volunteerHoursBySkill} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" fontSize={11} stroke="var(--color-text-muted)" />
                <YAxis
                  type="category"
                  dataKey="skill"
                  fontSize={11}
                  width={110}
                  stroke="var(--color-text-muted)"
                />
                <Tooltip
                  formatter={(val: unknown) => {
                    const numVal = typeof val === 'number' ? val : Number(val) || 0;
                    return [`${numVal} Verified Hours`, 'Total Service'];
                  }}
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                  }}
                />
                <Bar dataKey="hours" name="Field Hours" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
