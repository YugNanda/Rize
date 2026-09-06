import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <div className="p-4 rounded-xl bg-bg-elevated border border-border mb-4">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-base font-medium text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-xs mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
