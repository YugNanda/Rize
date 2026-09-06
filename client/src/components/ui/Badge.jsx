import { cn } from '../../utils/cn';

const variants = {
  default: 'bg-bg-elevated text-text-secondary border border-border',
  accent: 'bg-accent-subtle text-accent-hover border border-accent-muted',
  success: 'bg-success-subtle text-success border border-success/20',
  warning: 'bg-warning-subtle text-warning border border-warning/20',
  danger: 'bg-danger-subtle text-danger border border-danger/20',
  info: 'bg-info-subtle text-info border border-info/20',
};

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  return (
    <span className={cn('badge', variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

// Helper: map status strings to badge variants
export const statusVariant = (status) => {
  const map = {
    applied: 'default',
    shortlisted: 'info',
    rejected: 'danger',
    interview: 'warning',
    selected: 'success',
    offer_received: 'success',
    joined: 'success',
    open: 'success',
    closed: 'danger',
    draft: 'default',
    completed: 'accent',
    scheduled: 'info',
    cancelled: 'danger',
    not_placed: 'default',
    placed: 'success',
    opted_out: 'warning',
  };
  return map[status] || 'default';
};

export const statusLabel = (status) => {
  return status
    ? status
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '—';
};

export default Badge;
