import { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Sunset } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '../../utils/cn';

const THEME_OPTIONS = [
  {
    id: 'dark',
    label: 'Dark',
    description: 'Charcoal — easy at night',
    icon: Moon,
    swatches: ['#09090B', '#111113', '#6366F1'],
    iconColor: '#818CF8',
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Warm white — comfortable',
    icon: Sun,
    swatches: ['#FAFAFA', '#F4F4F5', '#4F46E5'],
    iconColor: '#F59E0B',
  },
  {
    id: 'solarized',
    label: 'Solarized',
    description: 'Sepia — scientifically easy',
    // Lucide doesn't have 'sunset' in older versions, use Sun with diff color
    icon: Sun,
    swatches: ['#FDF6E3', '#EEE8D5', '#268BD2'],
    iconColor: '#B58900',
  },
];

const THEME_ICONS = {
  dark:      { icon: Moon,  color: '#818CF8' },
  light:     { icon: Sun,   color: '#F59E0B' },
  solarized: { icon: Sun,   color: '#B58900' },
};

const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = THEME_ICONS[theme] || THEME_ICONS.dark;
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        title={`Theme: ${theme}`}
        className={cn(
          'p-2 rounded transition-colors duration-150',
          'hover:bg-bg-elevated',
          open && 'bg-bg-elevated'
        )}
        style={{ color: open ? current.color : 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = current.color}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <CurrentIcon size={15} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '220px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-md)',
            zIndex: 100,
            overflow: 'hidden',
            animation: 'themeDropIn 0.18s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <style>{`
            @keyframes themeDropIn {
              from { opacity:0; transform:translateY(-6px) scale(0.97); }
              to   { opacity:1; transform:translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Appearance
            </span>
          </div>

          {/* Options */}
          {THEME_OPTIONS.map(({ id, label, description, icon: Icon, swatches, iconColor }) => {
            const isActive = theme === id;
            return (
              <button
                key={id}
                onClick={() => { setTheme(id); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  background: isActive ? 'var(--accent-subtle)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Theme icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: isActive ? `${iconColor}20` : 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: isActive ? `1px solid ${iconColor}40` : '1px solid var(--border)',
                  transition: 'all 0.15s',
                }}>
                  <Icon size={13} color={isActive ? iconColor : 'var(--text-muted)'} />
                </div>

                {/* Label + description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {description}
                  </div>
                </div>

                {/* Color swatches */}
                <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                  {swatches.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: color,
                        border: '1px solid rgba(0,0,0,0.15)',
                        boxShadow: isActive ? `0 0 0 1.5px var(--accent)` : 'none',
                        transition: 'box-shadow 0.15s',
                      }}
                    />
                  ))}
                </div>

                {/* Active check */}
                {isActive && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--accent)', flexShrink: 0,
                    boxShadow: '0 0 6px var(--accent)',
                  }} />
                )}
              </button>
            );
          })}

          {/* Footer hint */}
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', marginTop: '4px' }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
              Preference saved automatically
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
