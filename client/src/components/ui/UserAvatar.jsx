import { useState } from 'react';
import CompanyLogo from './CompanyLogo';

// Aesthetic local anime avatars matching sample uploaded by user
export const AESTHETIC_STUDENT_AVATARS = [
  { id: 'sample', name: 'Original Cap Sketch', url: '/avatars/yug.png' },
  { id: 'avatar-1', name: 'Cap & Stripes', url: '/avatars/avatar-1.png' },
  { id: 'avatar-2', name: 'Headphones Hoodie', url: '/avatars/avatar-2.jpg' },
  { id: 'avatar-3', name: 'Glasses & Shirt', url: '/avatars/avatar-3.jpg' },
  { id: 'avatar-4', name: 'Ponytail Jacket', url: '/avatars/avatar-4.jpg' },
  { id: 'avatar-5', name: 'Sweater & Collar', url: '/avatars/avatar-5.jpg' },
  { id: 'avatar-6', name: 'Beanie & Denim', url: '/avatars/avatar-6.jpg' },
  { id: 'avatar-7', name: 'Bob Cut & Glasses', url: '/avatars/avatar-7.jpg' },
  { id: 'avatar-8', name: 'Neck Headphones', url: '/avatars/avatar-8.jpg' },
];

/**
 * Deterministically pick an aesthetic anime avatar for any student
 */
export const getStudentDefaultAvatar = (name = '', email = '') => {
  const cleanEmail = (email || '').toLowerCase();
  if (cleanEmail.includes('yug')) {
    return '/avatars/yug.png';
  }
  const str = (cleanEmail || name || 'student').trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const pool = AESTHETIC_STUDENT_AVATARS.slice(1); // skip duplicate sample
  const index = Math.abs(hash) % pool.length;
  return pool[index].url;
};

const SIZE_MAP = {
  xs: 'w-6 h-6 text-3xs',
  sm: 'w-8 h-8 text-2xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
  '2xl': 'w-20 h-20 text-lg',
  '3xl': 'w-28 h-28 text-xl',
};

const GRADIENTS = [
  'from-indigo-600 to-violet-700',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-700',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

export default function UserAvatar({
  user = null,
  student = null,
  name = '',
  src = '',
  role = '',
  size = 'md',
  className = '',
  showRoleBadge = false,
}) {
  const [imgError, setImgError] = useState(false);

  const effectiveRole = role || user?.role || (student ? 'student' : '');
  const displayName = name || user?.name || student?.userId?.name || 'User';
  const displayEmail = user?.email || student?.userId?.email || '';

  // If user is a company, render circular company logo
  if (effectiveRole === 'company') {
    const compLogo =
      src ||
      user?.avatar ||
      user?.logoUrl ||
      (typeof user?.company === 'object' ? user?.company?.logoUrl : '');

    return (
      <CompanyLogo
        name={displayName}
        logoUrl={compLogo}
        size={size}
        className={className}
      />
    );
  }

  // Determine avatar image URL
  const computedSrc =
    src ||
    user?.avatar ||
    user?.profilePhotoUrl ||
    student?.profilePhotoUrl ||
    student?.userId?.avatar ||
    getStudentDefaultAvatar(displayName, displayEmail);

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = (hash << 5) - hash + displayName.charCodeAt(i);
    hash |= 0;
  }
  const grad = GRADIENTS[Math.abs(hash) % GRADIENTS.length];

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden border border-border/80 bg-bg-elevated shadow-sm flex items-center justify-center select-none transition-all ${sizeClass} ${className}`}
      title={displayName}
    >
      {computedSrc && !imgError ? (
        <img
          src={computedSrc}
          alt={displayName}
          className="w-full h-full object-cover rounded-full select-none pointer-events-none"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${grad} text-white font-bold flex items-center justify-center`}
        >
          <span>{initials || '?'}</span>
        </div>
      )}
    </div>
  );
}
