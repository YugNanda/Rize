/**
 * RizeLogo — renders the official Rize brand logo.
 * Supports multiple sizes and an optional text-only variant for tight spaces.
 *
 * Props:
 *   size   — 'xs' | 'sm' | 'md' | 'lg' | 'xl'  (default: 'md')
 *   showText — boolean (default: true)
 *   className — extra wrapper class
 */
const SIZES = {
  xs: { img: 24,  text: '0.75rem',  gap: '0.25rem' },
  sm: { img: 32,  text: '0.9rem',   gap: '0.375rem' },
  md: { img: 44,  text: '1.125rem', gap: '0.5rem' },
  lg: { img: 64,  text: '1.5rem',   gap: '0.625rem' },
  xl: { img: 96,  text: '2rem',     gap: '0.75rem' },
};

const RizeLogo = ({ size = 'md', showText = true, className = '', style = {} }) => {
  const s = SIZES[size] || SIZES.md;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        userSelect: 'none',
        ...style,
      }}
    >
      <img
        src="/rize-logo.png"
        alt="Rize logo"
        width={s.img}
        height={s.img}
        style={{
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 0 8px rgba(0, 180, 255, 0.35))',
          flexShrink: 0,
        }}
        draggable={false}
      />
      {showText && (
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: s.text,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          Rize
        </span>
      )}
    </div>
  );
};

export default RizeLogo;
