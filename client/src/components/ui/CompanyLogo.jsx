import { useState } from 'react';

const LOCAL_LOGOS = {
  google: '/logos/google.svg',
  microsoft: '/logos/microsoft.svg',
  razorpay: '/logos/razorpay.svg',
  zerodha: '/logos/zerodha.svg',
  cred: '/logos/cred.svg',
  phonepe: '/logos/phonepe.svg',
  groww: '/logos/groww.svg',
  flipkart: '/logos/flipkart.svg',
  atlassian: '/logos/atlassian.svg',
  browserstack: '/logos/browserstack.svg',
  meesho: '/logos/meesho.svg',
  amazon: '/logos/amazon.svg',
  fundingpips: '/logos/fundingpips.svg',
  legion: '/logos/legionfunding.svg',
  fundedfirm: '/logos/fundedfirm.svg',
};

const BRAND_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-pink-600',
  'from-emerald-600 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-700',
  'from-cyan-600 to-blue-700',
];

const SIZE_CLASSES = {
  xs: 'w-6 h-6 p-0.5 text-3xs',
  sm: 'w-8 h-8 p-1 text-2xs',
  md: 'w-11 h-11 p-1.5 text-xs',
  lg: 'w-14 h-14 p-2 text-sm',
  xl: 'w-16 h-16 p-2.5 text-base',
  '2xl': 'w-20 h-20 p-3 text-lg',
};

export default function CompanyLogo({
  name = 'Company',
  logoUrl = '',
  size = 'md',
  className = '',
}) {
  const [imgFailed, setImgFailed] = useState(false);

  // Compute best logo source
  const getSrc = () => {
    if (logoUrl && !logoUrl.includes('clearbit.com')) {
      return logoUrl;
    }
    const cleanName = (name || '').toLowerCase();
    for (const [key, path] of Object.entries(LOCAL_LOGOS)) {
      if (cleanName.includes(key)) {
        return path;
      }
    }
    return logoUrl || '';
  };

  const src = getSrc();
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  // Hash company name to pick consistent brand gradient for fallback
  const getGradient = (str = '') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % BRAND_GRADIENTS.length;
    return BRAND_GRADIENTS[index];
  };

  const initials = (name || 'C')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden border border-border/80 bg-white shadow-sm flex items-center justify-center transition-all ${sizeClass} ${className}`}
      title={name}
    >
      {src && !imgFailed ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-contain rounded-full select-none"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${getGradient(name)} text-white font-bold flex items-center justify-center select-none shadow-inner`}
        >
          <span>{initials}</span>
        </div>
      )}
    </div>
  );
}
