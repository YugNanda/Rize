import { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  MessageSquare,
  Calendar,
  Bell,
  Building2,
  Users,
  BarChart3,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { driveService, notificationService } from '../../services/dataService';
import { cn } from '../../utils/cn';
import RizeLogo from '../ui/RizeLogo';
import UserAvatar from '../ui/UserAvatar';

// Navigation configs per role
const tpCellNav = [
  { label: 'T&P Dashboard',        icon: LayoutDashboard, to: '/tpcell/dashboard' },
  { label: 'Student Verification', icon: Users,           to: '/tpcell/students' },
  { label: 'Company Approvals',    icon: Building2,       to: '/tpcell/companies' },
  { label: 'Drive Governance',     icon: Briefcase,       to: '/tpcell/drives', hasBadge: true },
  { label: 'Applications & NOC',   icon: FileText,        to: '/tpcell/applications' },
  { label: 'Placement Analytics',  icon: BarChart3,       to: '/tpcell/analytics' },
];

const navConfig = {
  student: [
    { label: 'Dashboard',     icon: LayoutDashboard, to: '/student/dashboard' },
    { label: 'My Profile',    icon: User,            to: '/student/profile' },
    { label: 'Drives',        icon: Briefcase,       to: '/student/drives', hasBadge: true },
    { label: 'Applications',  icon: FileText,        to: '/student/applications' },
    { label: 'Interviews',    icon: Calendar,        to: '/student/interviews' },
    { label: 'AI Resume',     icon: Zap,             to: '/student/resume' },
    { label: 'Notifications', icon: Bell,            to: '/student/notifications', hasBadge: true },
  ],
  company: [
    { label: 'Dashboard',     icon: LayoutDashboard, to: '/company/dashboard' },
    { label: 'My Drives',     icon: Briefcase,       to: '/company/drives', hasBadge: true },
    { label: 'Applicants',    icon: Users,           to: '/company/applicants' },
    { label: 'Interviews',    icon: Calendar,        to: '/company/interviews' },
    { label: 'Notifications', icon: Bell,            to: '/company/notifications', hasBadge: true },
  ],
  admin: tpCellNav,
  tpcell: tpCellNav,
};


const Sidebar = ({ onClose }) => {
  const { user } = useAuthStore();
  const nav = navConfig[user?.role] || [];
  const [counts, setCounts] = useState({ pendingDrives: 0, openDrives: 0, newDrives: 0 });
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const loadCounts = useCallback(async () => {
    if (!user) return;
    try {
      const params = {};
      if (user.role === 'student') {
        const lastSeen = localStorage.getItem('rize_last_seen_drives_' + user._id);
        if (lastSeen) {
          params.since = lastSeen;
        } else {
          // Initialize to current time on first load so historical drives don't show badge
          localStorage.setItem('rize_last_seen_drives_' + user._id, Date.now().toString());
          params.since = Date.now().toString();
        }
      }
      const [driveRes, notifRes] = await Promise.allSettled([
        driveService.getCounts(params),
        notificationService.getAll(),
      ]);

      if (driveRes.status === 'fulfilled' && driveRes.value?.data?.data) {
        setCounts(driveRes.value.data.data);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value?.data?.data) {
        setUnreadNotifs(notifRes.value.data.data.unreadCount || 0);
      }
    } catch {
      // ignore count fetch error
    }
  }, [user]);

  useEffect(() => {
    loadCounts();

    const handleUpdate = () => loadCounts();
    const handleSeen = () => setCounts(c => ({ ...c, newDrives: 0 }));
    const handleNotifRead = () => setUnreadNotifs(c => Math.max(0, c - 1));

    window.addEventListener('rize:drive_created', handleUpdate);
    window.addEventListener('rize:drive_updated', handleUpdate);
    window.addEventListener('rize:application_submitted', handleUpdate);
    window.addEventListener('rize:drives_seen', handleSeen);
    window.addEventListener('rize:notification_read', handleNotifRead);

    // Refresh every 20s
    const timer = setInterval(loadCounts, 20000);

    return () => {
      window.removeEventListener('rize:drive_created', handleUpdate);
      window.removeEventListener('rize:drive_updated', handleUpdate);
      window.removeEventListener('rize:application_submitted', handleUpdate);
      window.removeEventListener('rize:drives_seen', handleSeen);
      window.removeEventListener('rize:notification_read', handleNotifRead);
      clearInterval(timer);
    };
  }, [loadCounts]);

  const handleNavClick = (to) => {
    if (user?.role === 'student' && to === '/student/drives') {
      localStorage.setItem('rize_last_seen_drives_' + user._id, Date.now().toString());
      setCounts(c => ({ ...c, newDrives: 0 }));
    }
    if (to.includes('/notifications')) {
      setUnreadNotifs(0);
    }
    if (onClose) {
      onClose();
    }
  };

  const renderBadge = (to) => {
    if (to.includes('/notifications') && unreadNotifs > 0) {
      return (
        <span
          className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-3xs font-extrabold bg-accent text-white shadow-sm"
          title={`${unreadNotifs} unread alert(s)`}
        >
          {unreadNotifs}
        </span>
      );
    }

    if (user?.role === 'tpcell' || user?.role === 'admin') {
      if (to === '/tpcell/drives' && counts.pendingDrives > 0) {
        return (
          <span
            className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-3xs font-extrabold bg-rose-600 text-white shadow-sm shadow-rose-500/50 animate-pulse"
            title={`${counts.pendingDrives} drive(s) awaiting approval`}
          >
            {counts.pendingDrives}
          </span>
        );
      }
    }

    if (user?.role === 'student') {
      if (to === '/student/drives' && counts.newDrives > 0) {
        return (
          <span
            className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-3xs font-extrabold bg-rose-600 text-white shadow-sm shadow-rose-500/50"
            title={`${counts.newDrives} new live placement drive(s) open`}
          >
            {counts.newDrives}
          </span>
        );
      }
    }

    if (user?.role === 'company') {
      if (to === '/company/drives' && counts.pendingDrives > 0) {
        return (
          <span
            className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-3xs font-extrabold bg-amber-500 text-white shadow-sm"
            title={`${counts.pendingDrives} drive(s) pending review`}
          >
            {counts.pendingDrives}
          </span>
        );
      }
    }

    return null;
  };

  return (
    <aside className="w-56 shrink-0 bg-bg-surface border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <RizeLogo size="sm" />
          <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent">
            {user?.role === 'tpcell' || user?.role === 'admin' ? 'T&P Cell' : user?.role}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated md:hidden cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => handleNavClick(to)}
            className={({ isActive }) =>
              cn('nav-link flex items-center gap-2.5', isActive && 'active')
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
            {renderBadge(to)}
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      <div className="px-3 py-3 border-t border-border shrink-0">
        <div
          onClick={() => {
            if (user?.role === 'student') navigate('/student/profile');
            if (onClose) onClose();
          }}
          className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-bg-elevated cursor-pointer transition-all"
        >
          <UserAvatar user={user} size="sm" className="w-8 h-8 ring-2 ring-border/70" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="text-3xs text-text-muted truncate">{user?.email}</p>
          </div>
          <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

