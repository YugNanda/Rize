import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Clear any old persistent session from localStorage so user is signed out by default
try {
  localStorage.removeItem('rize-auth');
} catch (e) {}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: (user, token) => set({ user, token: token || null, isAuthenticated: true }),

      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'rize-auth-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
