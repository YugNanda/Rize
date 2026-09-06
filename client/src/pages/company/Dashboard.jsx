import { useState, useEffect } from 'react';
import {
  Briefcase, Users, CheckCircle, TrendingUp, ArrowRight, Plus,
  Clock, Building2, UserCheck, Award, XCircle, CheckCircle2, ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/ui/StatCard';
import { driveService, applicationService } from '../../services/dataService';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';

const fmt = (n) => n >= 100 ? `${(n/100).toFixed(0)}Cr` : `${n}L`;
const daysLeft = (d) => Math.max(0, Math.ceil((new Date(d) - Date.now()) / 86400000));

const statusColor = {
  draft: 'var(--text-muted)',
  open: '#10B981',
  closed: '#EF4444',
  completed: '#6366F1'
};

const appStatusColor = {
  applied:     { label: 'Applied',     color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  shortlisted: { label: 'Shortlisted', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  interview:   { label: 'Interview',   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  offered:     { label: 'Offered',     color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  selected:    { label: 'Selected',    color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  rejected:    { label: 'Rejected',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
};

const CompanyDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      driveService.getAll({ limit: 50 }),
      applicationService.getCompanyApplications(),
    ])
      .then(([drivesRes, appsRes]) => {
        if (isMounted) {
          setDrives(drivesRes.data?.data?.drives || []);
          setApplications(appsRes.data?.data?.applications || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleQuickStatus = async (appId, status, candidateName) => {
    setUpdatingId(appId);
    try {
      await applicationService.updateStatus(appId, status);
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, status } : a)
      );
      toast.success(`${candidateName}: marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeDrives = drives.filter(d => d.status === 'open').length;
  const totalApplicants = applications.length;
  const shortlistedCount = applications.filter(a => ['shortlisted', 'interview'].includes(a.status)).length;
  const offersCount = applications.filter(a => ['offered', 'selected'].includes(a.status)).length;

  const stats = [
    { title: 'Active Drives',    value: loading ? '…' : activeDrives,    icon: Briefcase,   subtitle: 'Accepting applications', accent: true },
    { title: 'Total Applicants', value: loading ? '…' : totalApplicants, icon: Users,       subtitle: 'Across all drives' },
    { title: 'In Evaluation',   value: loading ? '…' : shortlistedCount,icon: Clock,       subtitle: 'Shortlisted & Interview' },
    { title: 'Offers Extended',  value: loading ? '…' : offersCount,     icon: CheckCircle, subtitle: 'Offered candidates' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <UserAvatar user={user} size="lg" className="w-12 h-12 ring-2 ring-border/80 shadow-sm" />
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Welcome, {user?.name} 👋
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                {activeDrives > 0
                  ? `${activeDrives} drive${activeDrives > 1 ? 's' : ''} active with ${totalApplicants} candidate application${totalApplicants === 1 ? '' : 's'}.`
                  : 'Create your first placement drive to begin hiring top talent.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/company/applicants"
              className="inline-flex items-center gap-1.5 text-xs bg-bg-elevated hover:bg-bg-overlay text-text-primary border border-border px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <Users size={13} /> View All Applicants ({totalApplicants})
            </Link>
            <Link
              to="/company/drives/new"
              className="inline-flex items-center gap-1.5 text-xs bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-lg transition-colors font-semibold shadow-sm"
            >
              <Plus size={13} /> Create Drive
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      {/* Recent Applicants Section */}
      <div className="card">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Recent Applicants</h3>
          </div>
          <Link
            to="/company/applicants"
            className="text-xs text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1"
          >
            Manage all ({totalApplicants}) <ArrowRight size={12} />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium text-text-secondary">No applicants yet</p>
            <p className="text-xs text-text-muted mt-0.5">When students apply to your open drives, they will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {applications.slice(0, 5).map((app) => {
              const student = app.studentId || {};
              const userObj = student.userId || {};
              const driveObj = app.driveId || {};
              const sc = appStatusColor[app.status] || appStatusColor.applied;
              const name = userObj.name || 'Candidate';
              const isUpdating = updatingId === app._id;

              return (
                <div
                  key={app._id}
                  className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bg-elevated transition-colors"
                >
                  {/* Candidate Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold text-sm flex items-center justify-center shrink-0">
                      {name[0]?.toUpperCase() || 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary truncate">{name}</p>
                        <span
                          className="text-3xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: sc.color, background: sc.bg }}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {driveObj.title || 'Placement Drive'} · CGPA: {student.cgpa || '—'} · {student.department || 'Dept —'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {student.resumeUrl && (
                      <a
                        href={student.resumeUrl.startsWith('http') ? student.resumeUrl : `${import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')}${student.resumeUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline px-2 py-1"
                      >
                        Resume
                      </a>
                    )}
                    <button
                      disabled={isUpdating || ['offered', 'selected'].includes(app.status)}
                      onClick={() => handleQuickStatus(app._id, 'offered', name)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      disabled={isUpdating || app.status === 'rejected'}
                      onClick={() => handleQuickStatus(app._id, 'rejected', name)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      disabled={isUpdating || app.status === 'shortlisted'}
                      onClick={() => handleQuickStatus(app._id, 'shortlisted', name)}
                      className="px-2 py-1 rounded-md text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Shortlist
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Drives Table */}
      <div className="card">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Placement Drives</h3>
          </div>
          <Link to="/company/drives" className="text-xs text-text-muted hover:text-accent transition-colors font-medium">
            Manage all ({drives.length})
          </Link>
        </div>

        {drives.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-text-secondary text-sm">No drives yet</p>
            <Link
              to="/company/drives/new"
              className="inline-block mt-3 px-4 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent-hover transition-colors"
            >
              Create First Drive
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {drives.slice(0, 5).map((d) => {
              const sc = statusColor[d.status] || 'var(--text-muted)';
              const dl = daysLeft(d.applicationDeadline);
              return (
                <div
                  key={d._id}
                  onClick={() => navigate(`/company/drives/${d._id}/applicants`)}
                  className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-bg-elevated transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-sm font-semibold text-text-primary truncate">{d.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      <span className="text-success font-semibold">₹{fmt(d.package.min)}–{fmt(d.package.max)} LPA</span> · {d.location} · Role: {d.jobRole}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs ${dl <= 3 ? 'text-danger font-bold' : 'text-text-muted'}`}>
                      {dl}d left
                    </span>
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize"
                      style={{ color: sc, background: `${sc}18` }}
                    >
                      {d.status}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-60" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
