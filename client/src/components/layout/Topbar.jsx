import { Bell, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import UserAvatar from '../ui/UserAvatar';
import ThemeToggle from '../ui/ThemeToggle';

const Topbar = ({ title = '', onMenuClick }) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // silently ignore logout API errors
    } finally {
      clearAuth();
      toast.success('Logged out successfully.');
      navigate('/login');
    }
  };

  const notifPath =
    user?.role === 'student'
      ? '/student/notifications'
      : user?.role === 'company'
      ? '/company/notifications'
      : '/admin/notifications';

  return (
    <header className="h-14 border-b border-border bg-bg-surface flex items-center px-3 sm:px-6 gap-2 sm:gap-4 shrink-0 sticky top-0 z-20">
      {/* Mobile hamburger menu toggle */}
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated md:hidden transition-colors cursor-pointer shrink-0"
          title="Open Navigation"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Page title */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-sm font-semibold text-text-primary truncate">{title}</h1>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          onClick={() => navigate(notifPath)}
          className="p-2 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* User avatar + name */}
        <div
          onClick={() => {
            if (user?.role === 'student') navigate('/student/profile');
          }}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bg-elevated cursor-pointer transition-colors"
        >
          <UserAvatar user={user} size="sm" className="w-8 h-8" />
          <span className="text-xs font-semibold text-text-secondary hidden sm:block">
            {user?.name}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded hover:bg-bg-elevated text-text-muted hover:text-danger transition-colors ml-1"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
