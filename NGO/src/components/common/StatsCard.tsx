import React, { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  color?: 'emerald' | 'teal' | 'amber' | 'blue' | 'purple';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  subtitle,
  trend,
  color = 'emerald',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  // Count-up animation on mount or value change
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // ms
    const initial = displayValue;
    const diff = value - initial;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease out
      setDisplayValue(Math.floor(initial + diff * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  const getColorStyles = () => {
    switch (color) {
      case 'amber':
        return {
          iconBg: 'rgba(245, 158, 11, 0.12)',
          iconColor: 'var(--color-accent-500)',
          borderHover: 'rgba(245, 158, 11, 0.3)',
        };
      case 'teal':
        return {
          iconBg: 'rgba(20, 184, 166, 0.12)',
          iconColor: 'var(--color-teal-600)',
          borderHover: 'rgba(20, 184, 166, 0.3)',
        };
      case 'blue':
        return {
          iconBg: 'rgba(2, 132, 199, 0.12)',
          iconColor: 'var(--color-info)',
          borderHover: 'rgba(2, 132, 199, 0.3)',
        };
      case 'purple':
        return {
          iconBg: 'rgba(147, 51, 234, 0.12)',
          iconColor: '#9333ea',
          borderHover: 'rgba(147, 51, 234, 0.3)',
        };
      default:
        return {
          iconBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: 'var(--color-primary-600)',
          borderHover: 'rgba(16, 185, 129, 0.3)',
        };
    }
  };

  const colors = getColorStyles();

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: colors.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.iconColor,
          }}
        >
          <Icon size={22} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <h3
          style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 800,
            margin: 0,
            color: 'var(--color-text-main)',
            fontFeatureSettings: '"tnum"',
          }}
        >
          {prefix}
          {displayValue.toLocaleString()}
          {suffix}
        </h3>
        {trend && (
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-success)',
              backgroundColor: 'var(--color-success-bg)',
              padding: '0.15rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-subtle)',
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
