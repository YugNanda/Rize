import { useState, useEffect } from 'react';
import { FileText, CheckCircle, MessageSquare, Award, Briefcase, ArrowRight, TrendingUp, MapPin, Clock, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/ui/StatCard';
import { applicationService, driveService } from '../../services/dataService';
import CompanyLogo from '../../components/ui/CompanyLogo';
import UserAvatar from '../../components/ui/UserAvatar';
import OfferLetterModal from '../../components/ui/OfferLetterModal';

const fmt = (n) => n >= 100 ? `${(n/100).toFixed(0)}Cr` : `${n}L`;
const daysLeft = (d) => Math.max(0, Math.ceil((new Date(d) - Date.now()) / 86400000));

const statusColor = {
  applied:     '#6366F1',
  shortlisted: '#F59E0B',
  interview:   '#3B82F6',
  offered:     '#10B981',
  selected:    '#10B981',
  rejected:    '#EF4444',
  withdrawn:   '#6B7280',
};
const statusLabel = { applied:'Applied', shortlisted:'Shortlisted', interview:'Interview', offered:'Offer!', selected:'Selected', rejected:'Rejected', withdrawn:'Withdrawn' };

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerModalApp, setOfferModalApp] = useState(null);

  useEffect(() => {
    Promise.all([
      applicationService.getMyApplications(),
      driveService.getAll({ limit: 6, status: 'open' }),
    ]).then(([appRes, driveRes]) => {
      setApps(appRes.data?.data?.applications || []);
      setDrives(driveRes.data?.data?.drives || []);
    }).catch((err) => {
      console.error('Dashboard load error:', err);
    }).finally(() => setLoading(false));
  }, []);

  const total      = apps.length;
  const shortlisted = apps.filter(a => a.status === 'shortlisted').length;
  const interviews  = apps.filter(a => a.status === 'interview').length;
  const offers      = apps.filter(a => ['offered','selected'].includes(a.status)).length;
  const offeredApp  = apps.find(a => ['offered', 'selected'].includes(a.status));

  const stats = [
    { title: 'Applications', value: loading ? '…' : total,       icon: FileText,    subtitle: 'Total submitted', accent: true },
    { title: 'Shortlisted',  value: loading ? '…' : shortlisted, icon: CheckCircle, subtitle: 'In review' },
    { title: 'Interviews',   value: loading ? '…' : interviews,  icon: MessageSquare,subtitle: 'Scheduled' },
    { title: 'Offers',       value: loading ? '…' : offers,      icon: Award,       subtitle: offers > 0 ? '🎉 Congratulations!' : 'Keep applying' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link to="/student/profile" className="shrink-0 group" title="View Profile">
              <UserAvatar user={user} size="lg" className="w-12 h-12 ring-2 ring-accent/30 group-hover:ring-accent transition-all shadow-sm" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {total > 0 ? `You have ${total} application${total > 1 ? 's' : ''} in progress.` : "Start applying to open placement drives below."}
              </p>
            </div>
          </div>
          <Link to="/student/drives" className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors font-medium">
            Browse drives <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Placement Offer Celebration Banner */}
      {offeredApp && (
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-bg-surface to-accent/10 shadow-lg animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Corporate Offer Received 🎉
                  </span>
                  <span className="text-3xs text-text-muted">
                    Ref: {offeredApp.offerLetter?.referenceNo || 'Official Offer Order'}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-text-primary mt-1">
                  Congratulations, {user?.name?.split(' ')[0]}! You have been Selected
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {offeredApp.driveId?.companyId?.name || 'Company'} · {offeredApp.offerLetter?.designation || offeredApp.driveId?.jobRole || 'SDE'} ·{' '}
                  <strong className="text-emerald-400 font-semibold">
                    ₹{offeredApp.offerLetter?.packageLpa || offeredApp.driveId?.package?.max || 12} LPA
                  </strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const enriched = {
                  ...offeredApp,
                  studentId: {
                    ...(offeredApp.studentId || {}),
                    userId: offeredApp.studentId?.userId || user || {},
                  },
                };
                setOfferModalApp(enriched);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all self-stretch sm:self-auto shrink-0"
              title="View, print and download official Corporate Offer Letter PDF"
            >
              <Award size={15} />
              <span>View & Print Offer Letter 📜</span>
            </button>
          </div>
        </div>
      )}

      {/* Banner for campus recruitment */}
      {drives.length > 0 && (
        <div className="bg-accent/10 border border-accent/25 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs text-text-secondary m-0">
              <strong className="text-text-primary">Campus Recruitment Active:</strong> Review eligibility criteria across partner firms and apply with your verified profile.
            </p>
          </div>
          <Link
            to="/student/drives"
            className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>Browse Open Drives</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* KPI stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent applications */}
        <div className="card">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">Recent Applications</h3>
            <Link to="/student/applications" className="text-xs text-text-muted hover:text-accent transition-colors">View all</Link>
          </div>
          {apps.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.8125rem' }}>No applications yet</p>
              <Link to="/student/drives" style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none', marginTop: 6, display: 'inline-block' }}>Browse drives →</Link>
            </div>
          ) : (
            <div>
              {apps.slice(0, 4).map(app => {
                const drive = app.driveId || {};
                const company = drive.companyId || {};
                const sc = statusColor[app.status] || '#6366F1';
                const sl = statusLabel[app.status] || app.status;
                return (
                  <div key={app._id} onClick={() => navigate(`/student/drives/${drive._id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drive.title || 'Drive'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{company.name}</p>
                    </div>
                    {['offered', 'selected'].includes(app.status) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const enriched = {
                            ...app,
                            studentId: {
                              ...(app.studentId || {}),
                              userId: app.studentId?.userId || user || {},
                            },
                          };
                          setOfferModalApp(enriched);
                        }}
                        className="px-2 py-0.5 rounded text-3xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                        title="View Official Offer Letter PDF"
                      >
                        <Award size={11} />
                        <span className="hidden sm:inline">Offer Letter</span>
                      </button>
                    )}
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: sc, background: `${sc}18`, padding: '0.15rem 0.5rem', borderRadius: 999, flexShrink: 0 }}>{sl}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Open drives preview */}
        <div className="card">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">Open Drives</h3>
            <Link to="/student/drives" className="text-xs text-text-muted hover:text-accent transition-colors">Browse all</Link>
          </div>
          {drives.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Briefcase size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.8125rem' }}>No open drives right now</p>
            </div>
          ) : (
            <div>
              {drives.slice(0, 4).map(drive => {
                const company = drive.companyId || {};
                const dl = daysLeft(drive.applicationDeadline);
                return (
                  <div key={drive._id} onClick={() => navigate(`/student/drives/${drive._id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drive.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{fmt(drive.package.min)}–{fmt(drive.package.max)} LPA</span> · {drive.location}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: dl <= 3 ? 'var(--danger)' : 'var(--text-muted)', flexShrink: 0 }}>{dl}d left</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Official Corporate Offer Letter Modal */}
      <OfferLetterModal
        isOpen={!!offerModalApp}
        onClose={() => setOfferModalApp(null)}
        application={offerModalApp}
      />
    </div>
  );
};

export default StudentDashboard;
