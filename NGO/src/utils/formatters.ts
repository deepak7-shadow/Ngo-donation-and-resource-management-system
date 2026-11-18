import { format, parseISO, formatDistanceToNow } from 'date-fns';

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateString: string, dateFormat: string = 'MMM dd, yyyy'): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, dateFormat);
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function calculateProgress(current: number, goal: number): number {
  if (goal <= 0) return 0;
  const pct = Math.round((current / goal) * 100);
  return Math.min(100, Math.max(0, pct));
}

export function getUrgencyColor(urgency: string): { bg: string; text: string; border: string } {
  switch (urgency) {
    case 'critical':
      return { bg: 'var(--color-danger-bg)', text: 'var(--color-danger)', border: 'var(--color-danger)' };
    case 'high':
      return { bg: 'var(--color-warning-bg)', text: 'var(--color-warning)', border: 'var(--color-warning)' };
    case 'medium':
      return { bg: 'var(--color-info-bg)', text: 'var(--color-info)', border: 'var(--color-info)' };
    default:
      return { bg: 'var(--color-neutral-bg)', text: 'var(--color-text-muted)', border: 'var(--color-border)' };
  }
}
