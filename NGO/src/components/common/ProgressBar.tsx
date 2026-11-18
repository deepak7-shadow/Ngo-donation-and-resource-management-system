import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'primary' | 'urgent' | 'accent';
  className?: string;
  ariaLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  showLabel = false,
  variant = 'primary',
  className = '',
  ariaLabel = 'Progress',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return '6px';
      case 'lg':
        return '12px';
      default:
        return '8px';
    }
  };

  const getFillClass = () => {
    if (variant === 'urgent') return 'progress-fill progress-fill-urgent';
    return 'progress-fill';
  };

  return (
    <div className={`progress-container ${className}`} style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            marginBottom: 'var(--space-1)',
            color: 'var(--color-text-main)',
          }}
        >
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div
        className="progress-track"
        style={{ height: getHeight() }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={getFillClass()}
          style={{
            width: `${clampedProgress}%`,
          }}
        />
      </div>
    </div>
  );
};
