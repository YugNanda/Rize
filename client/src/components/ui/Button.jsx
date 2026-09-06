import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white',
  secondary: 'bg-bg-elevated hover:bg-bg-subtle border border-border text-text-primary',
  ghost: 'hover:bg-bg-elevated text-text-secondary hover:text-text-primary',
  danger: 'bg-danger hover:bg-red-600 text-white',
  outline: 'border border-accent text-accent hover:bg-accent-subtle',
};

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded font-medium',
        'transition-all duration-150 select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
