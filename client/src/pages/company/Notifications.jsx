import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Trash2,
  ExternalLink,
  Briefcase,
  Users,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { notificationService } from '../../services/dataService';

const TYPE_ICONS = {
  interview: { icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25' },
  application: { icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/25' },
  drive: { icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
  default: { icon: Bell, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/25' },
};

const CompanyNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch company notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('rize:notification_read'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(c => Math.max(0, c - 1));
      window.dispatchEvent(new CustomEvent('rize:notification_read'));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.delete(id);
      const target = notifications.find(n => n._id === id);
      if (target && !target.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.read) {
      await handleMarkAsRead(item._id);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const filteredList = notifications.filter(item => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'read') return item.read;
    return true;
  });

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            Recruiter Notification Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Company Alerts & Updates
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track student application submissions, T&P drive approvals, and interview reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-bg-surface border border-border text-text-primary hover:border-accent hover:text-accent transition-all shadow-sm cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-accent" />
            <span>Mark all as read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'read', label: `Read (${notifications.length - unreadCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm">Loading company alerts...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/25 text-accent flex items-center justify-center mx-auto">
            <Bell className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-text-primary">
              {activeFilter === 'unread' ? 'No Unread Alerts' : 'No Alerts Yet'}
            </h3>
            <p className="text-xs text-text-muted">
              Notifications will appear here when students apply to your placement drives or when T&P Cell reviews your drive postings.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredList.map((item) => {
            const typeConfig = TYPE_ICONS[item.type] || TYPE_ICONS.default;
            const Icon = typeConfig.icon;

            return (
              <div
                key={item._id}
                onClick={() => handleNotificationClick(item)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  item.read
                    ? 'bg-bg-surface/60 border-border opacity-85 hover:opacity-100 hover:border-border-hover'
                    : 'bg-bg-surface border-accent/30 shadow-sm hover:border-accent'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} border ${typeConfig.border} ${typeConfig.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`text-sm font-semibold leading-snug ${item.read ? 'text-text-primary' : 'text-accent'}`}>
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-2xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      {item.link && (
                        <span className="text-accent flex items-center gap-1 font-medium group-hover:underline">
                          View details <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                  {!item.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item._id);
                      }}
                      className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(item._id, e)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyNotifications;
