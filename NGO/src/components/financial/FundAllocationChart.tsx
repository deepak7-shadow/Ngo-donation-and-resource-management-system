import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNGO } from '../../context/NGOContext';
import { formatCurrency } from '../../utils/formatters';
import { ShieldCheck, Heart, Truck, Award } from 'lucide-react';

export const FundAllocationChart: React.FC = () => {
  const { state, telemetry } = useNGO();

  const chartData = useMemo(() => {
    const totalSpent = state.expenses.reduce((acc, e) => acc + e.amount, 0);
    if (totalSpent === 0) return [];

    const categoryTotals: Record<string, number> = {};
    state.expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    // Group into Direct Aid, Logistics, and Governance/Admin
    const directAid =
      (categoryTotals['direct-aid'] || 0) +
      (categoryTotals['medical'] || 0) +
      (categoryTotals['education'] || 0) +
      (categoryTotals['emergency'] || 0);

    const logistics = categoryTotals['logistics'] || 0;
    const admin = categoryTotals['admin'] || 0;

    return [
      {
        name: 'Direct Humanitarian Aid',
        value: directAid,
        percentage: Math.round((directAid / totalSpent) * 100),
        color: '#10b981', // emerald
      },
      {
        name: 'Last-Mile Logistics',
        value: logistics,
        percentage: Math.round((logistics / totalSpent) * 100),
        color: '#0d9488', // teal
      },
      {
        name: 'Governance & Statutory Audit',
        value: admin,
        percentage: Math.round((admin / totalSpent) * 100),
        color: '#f59e0b', // amber
      },
    ];
  }, [state.expenses]);

  const totalExpense = useMemo(() => {
    return state.expenses.reduce((acc, e) => acc + e.amount, 0);
  }, [state.expenses]);

  const totalInflow = useMemo(() => {
    return state.donations.reduce((acc, d) => acc + d.amount, 0);
  }, [state.donations]);

  const currentReserve = Math.max(0, totalInflow - totalExpense);

  return (
    <div
      className="glass-panel"
      style={{
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ShieldCheck size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>
            Live Fund Allocation &amp; Efficiency Breakdown
          </h3>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Computed dynamically from all {state.expenses.length} verified expenditure invoices in the ledger.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
          alignItems: 'center',
        }}
      >
        {/* Recharts Donut Pie */}
        <div style={{ height: '260px', width: '100%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val: unknown) => {
                  const numVal = typeof val === 'number' ? val : Number(val) || 0;
                  return [formatCurrency(numVal), 'Allocated'];
                }}
                contentStyle={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Telemetry Label */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              DIRECT AID
            </div>
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 800,
                color: 'var(--color-primary-600)',
                lineHeight: 1,
              }}
            >
              {telemetry.directAidPercentage}%
            </div>
          </div>
        </div>

        {/* Legend & Breakdown Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {chartData.map(item => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: item.color,
                  }}
                />
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {formatCurrency(item.value)} expended
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: item.color }}>
                {item.percentage}%
              </div>
            </div>
          ))}

          {/* Summary Box */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-muted)',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Total Expended
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>
                {formatCurrency(totalExpense)}
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-muted)',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Total Inflow
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-success)' }}>
                {formatCurrency(totalInflow)}
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-muted)',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Field Reserve
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                {formatCurrency(currentReserve)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-body)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={16} style={{ color: 'var(--color-success)' }} />
          <span><strong>86%+ Direct Impact Guarantee:</strong> 86 cents of every dollar funds frontline aid directly.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={16} style={{ color: 'var(--color-teal-600)' }} />
          <span>9% Logistics</span>
          <span>•</span>
          <Award size={16} style={{ color: 'var(--color-accent-600)' }} />
          <span>5% Independent Audits</span>
        </div>
      </div>
    </div>
  );
};
