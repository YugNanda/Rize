import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const THEMES = ['dark', 'light', 'solarized'];

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'solarized', // default

      setTheme: (theme) => {
        if (!THEMES.includes(theme)) return;
        applyTheme(theme);
        set({ theme });
      },

      cycleTheme: () => {
        const current = get().theme;
        const idx = THEMES.indexOf(current);
        const next = THEMES[(idx + 1) % THEMES.length];
        applyTheme(next);
        set({ theme: next });
      },

      // Called on app mount to restore persisted theme
      initTheme: () => {
        applyTheme(get().theme);
      },
    }),
    {
      name: 'rize-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export { THEMES };
