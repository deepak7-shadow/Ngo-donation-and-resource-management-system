import React from 'react';
import { ShieldCheck, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'verified';
  icon?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon = false,
  className = '',
  size = 'md',
}) => {
  const getBadgeClass = () => {
    switch (variant) {
      case 'success':
        return 'badge-success';
      case 'warning':
        return 'badge-warning';
      case 'danger':
        return 'badge-danger';
      case 'info':
        return 'badge-info';
      case 'verified':
        return 'badge-success';
      default:
        return 'badge-neutral';
    }
  };

  const renderIcon = () => {
    if (!icon && variant !== 'verified') return null;
    const iconSize = size === 'sm' ? 12 : 14;

    switch (variant) {
      case 'verified':
        return <ShieldCheck size={iconSize} style={{ color: 'var(--color-success)' }} />;
      case 'success':
        return <CheckCircle size={iconSize} />;
      case 'warning':
        return <Clock size={iconSize} />;
      case 'danger':
        return <AlertCircle size={iconSize} />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`badge ${getBadgeClass()} ${className}`}
      style={{
        fontSize: size === 'sm' ? '0.7rem' : 'var(--text-xs)',
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.2rem 0.6rem',
      }}
    >
      {renderIcon()}
      <span>{children}</span>
    </span>
  );
};
