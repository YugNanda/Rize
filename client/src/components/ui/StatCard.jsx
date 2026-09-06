import { cn } from '../../utils/cn';

/**
 * KPI / metric card used on dashboards.
 * trend: 'up' | 'down' | 'neutral'
 */
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  subtitle,
  className = '',
  accent = false,
}) => {
  return (
    <div
      className={cn(
        'stat-card relative overflow-hidden',
        accent && 'border-accent/30',
        className
      )}
    >
      {/* Subtle accent glow for primary card */}
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent-subtle/30 to-transparent pointer-events-none" />
      )}

      <div className="flex items-start justify-between relative">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {title}
          </span>
          <span className="text-2xl font-semibold text-text-primary tabular-nums">
            {value ?? '—'}
          </span>
          {subtitle && (
            <span className="text-xs text-text-muted mt-1">{subtitle}</span>
          )}
          {trendLabel && (
            <span
              className={cn(
                'text-xs font-medium mt-1',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-danger',
                trend === 'neutral' && 'text-text-muted'
              )}
            >
              {trendLabel}
            </span>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'p-2.5 rounded-lg',
              accent ? 'bg-accent-subtle' : 'bg-bg-elevated'
            )}
          >
            <Icon
              className={cn('w-5 h-5', accent ? 'text-accent' : 'text-text-muted')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
