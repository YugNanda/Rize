import { cn } from '../../utils/cn';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <svg
      className={cn('animate-spin text-accent', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

export const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base gap-4">
    <Spinner size="lg" />
    <p className="text-sm text-text-muted">{message}</p>
  </div>
);

export const LoadingOverlay = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner size="md" />
  </div>
);

export default Spinner;
