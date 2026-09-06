import { cn } from '../../utils/cn';

const Avatar = ({ name = '', src = '', size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-2xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Generate a consistent color from name
  const colors = [
    'bg-indigo-500',
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];
  const colorIndex =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white shrink-0',
        colors[colorIndex],
        sizes[size],
        className
      )}
    >
      {initials || '?'}
    </div>
  );
};

export default Avatar;
