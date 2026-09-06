import { useState, useRef, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const THEMES = [
  { id: 'dark',      label: 'Dark',      icon: Moon, iconColor: '#818CF8', bg: '#09090B', surface: '#111113', accent: '#6366F1' },
  { id: 'light',     label: 'Light',     icon: Sun,  iconColor: '#F59E0B', bg: '#FAFAFA', surface: '#F4F4F5', accent: '#4F46E5' },
  { id: 'solarized', label: 'Solarized', icon: Sun,  iconColor: '#B58900', bg: '#FDF6E3', surface: '#EEE8D5', accent: '#268BD2' },
];

/**
 * Compact theme switcher for auth pages (Login / Register).
 * Floats in the top-right corner, shows 3 clickable swatches.
 */
const AuthThemeToggle = () => {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = THEMES.find(t => t.id === theme) || THEMES[0];
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 100 }}>
      <style>{`
        @keyframes authDropIn {
          from { opacity:0; transform:translateY(-8px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .auth-theme-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 999px;
          cursor: pointer;
          font-size: 0.75rem; font-weight: 500;
          color: var(--text-muted);
          font-family: 'Inter', sans-serif;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .auth-theme-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
        .auth-drop {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          padding: 6px;
          min-width: 180px;
          animation: authDropIn 0.18s cubic-bezier(0.16,1,0.3,1);
        }
        .auth-theme-opt {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 8px;
          cursor: pointer; border: none; width: 100%;
          background: transparent; text-align: left;
          transition: background 0.12s;
          font-family: 'Inter', sans-serif;
        }
        .auth-theme-opt:hover { background: var(--bg-elevated); }
        .auth-theme-opt.active { background: var(--accent-subtle); }
        .swatch-group { display: flex; gap: 3px; }
        .swatch { width: 10px; height: 10px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.12); flex-shrink:0; }
      `}</style>

      {/* Trigger */}
      <button className="auth-theme-btn" onClick={() => setOpen(o => !o)}>
        <CurrentIcon size={13} color={current.iconColor} />
        {current.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="auth-drop">
          {THEMES.map(({ id, label, icon: Icon, iconColor, bg, surface, accent }) => (
            <button
              key={id}
              className={`auth-theme-opt ${theme === id ? 'active' : ''}`}
              onClick={() => { setTheme(id); setOpen(false); }}
            >
              {/* Mini icon */}
              <div style={{
                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                background: bg, border: `1px solid ${surface}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: theme === id ? `0 0 0 2px ${accent}40` : 'none',
              }}>
                <Icon size={12} color={iconColor} />
              </div>

              {/* Label */}
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', flex: 1 }}>
                {label}
              </span>

              {/* Swatches */}
              <div className="swatch-group">
                <div className="swatch" style={{ background: bg }} />
                <div className="swatch" style={{ background: surface }} />
                <div className="swatch" style={{ background: accent }} />
              </div>

              {/* Active dot */}
              {theme === id && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, boxShadow: `0 0 6px ${accent}` }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthThemeToggle;
