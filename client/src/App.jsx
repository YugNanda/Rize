import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import { useThemeStore } from './store/themeStore';

function App() {
  const { initTheme, theme } = useThemeStore();

  // Apply persisted theme immediately on mount
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: "'Inter', sans-serif",
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'var(--bg-elevated)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger)',
              secondary: 'var(--bg-elevated)',
            },
          },
        }}
      />
    </>
  );
}

export default App;
