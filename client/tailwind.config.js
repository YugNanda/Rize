/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // All colors reference CSS variables — theme-switchable at runtime
        bg: {
          base:     'var(--bg-base)',
          surface:  'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          overlay:  'var(--bg-overlay)',
          subtle:   'var(--bg-subtle)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle:  'var(--border-subtle)',
          strong:  'var(--border-strong)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          disabled:  'var(--text-disabled)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          hover:      'var(--accent-hover)',
          muted:      'var(--accent-muted)',
          subtle:     'var(--accent-subtle)',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT:    'var(--success)',
          subtle:     'var(--success-subtle)',
          foreground: 'var(--success-fg)',
        },
        warning: {
          DEFAULT:    'var(--warning)',
          subtle:     'var(--warning-subtle)',
          foreground: 'var(--warning-fg)',
        },
        danger: {
          DEFAULT:    'var(--danger)',
          subtle:     'var(--danger-subtle)',
          foreground: 'var(--danger-fg)',
        },
        info: {
          DEFAULT:    'var(--info)',
          subtle:     'var(--info-subtle)',
          foreground: 'var(--info-fg)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      boxShadow: {
        sm:     'var(--shadow-sm)',
        DEFAULT:'var(--shadow)',
        md:     'var(--shadow-md)',
        lg:     'var(--shadow-lg)',
        accent: '0 0 0 1px rgba(var(--accent-rgb), 0.4)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-in-out',
        'slide-in':   'slideIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn:   { '0%': { opacity: '0', transform: 'translateY(-4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
};
