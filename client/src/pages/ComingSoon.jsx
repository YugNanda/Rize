import { Construction } from 'lucide-react';

const ComingSoon = ({ pageName = 'This page' }) => (
  <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
    <div className="p-4 rounded-xl bg-bg-elevated border border-border mb-4">
      <Construction className="w-8 h-8 text-text-muted" />
    </div>
    <h3 className="text-base font-medium text-text-primary mb-1">{pageName}</h3>
    <p className="text-sm text-text-muted">Coming in the next phase.</p>
  </div>
);

export default ComingSoon;
