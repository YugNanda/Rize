import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, MapPin, Calendar, ArrowRight, Loader2, Building2, ShieldCheck, Award } from 'lucide-react';
import { applicationService } from '../../services/dataService';
import CompanyLogo from '../../components/ui/CompanyLogo';
import NocCertificateModal from '../../components/ui/NocCertificateModal';
import OfferLetterModal from '../../components/ui/OfferLetterModal';
import { useAuthStore } from '../../store/authStore';

const statusConfig = {
  applied:     { label: 'Applied',     color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  shortlisted: { label: 'Shortlisted', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  interview:   { label: 'Interview',   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  offered:     { label: 'Offer!',      color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  selected:    { label: 'Selected',    color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  rejected:    { label: 'Rejected',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
  withdrawn:   { label: 'Withdrawn',   color: '#6B7280', bg: 'rgba(107,114,128,0.1)'},
};

const fmt = (n) => n >= 100 ? `${(n / 100).toFixed(0)}Cr` : `${n}L`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function StudentApplications() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [nocModalApp, setNocModalApp] = useState(null);
  const [offerModalApp, setOfferModalApp] = useState(null);

  useEffect(() => {
    applicationService.getMyApplications(filter ? { status: filter } : {}).then(res => {
      setApps(res.data?.data?.applications || []);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load student applications:', err);
      setLoading(false);
    });
  }, [filter]);

  const stats = {
    total: apps.length,
    shortlisted: apps.filter(a => a.status === 'shortlisted').length,
    interview: apps.filter(a => a.status === 'interview').length,
    offered: apps.filter(a => ['offered', 'selected'].includes(a.status)).length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem', fontFamily: "'Inter',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .app-card{transition:all 0.18s} .app-card:hover{border-color:var(--border-strong)!important;box-shadow:var(--shadow)}`}</style>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>My Applications</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>Track all your placement applications in one place</p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          ['Total Applied', stats.total, '#6366F1'],
          ['Shortlisted', stats.shortlisted, '#F59E0B'],
          ['Interviews', stats.interview, '#3B82F6'],
          ['Offers', stats.offered, '#10B981'],
        ].map(([label, count, color]) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color, margin: 0 }}>{count}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['', 'applied', 'shortlisted', 'interview', 'offered', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '0.375rem 0.875rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 500, border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border)'}`, background: filter === s ? 'var(--accent-subtle)' : 'transparent', color: filter === s ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: "'Inter',sans-serif", textTransform: 'capitalize' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      {apps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{filter ? `No ${filter} applications` : "You haven't applied anywhere yet"}</p>
          {!filter && (
            <button onClick={() => navigate('/student/drives')} style={{ marginTop: '1rem', padding: '0.625rem 1.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
              Browse Drives →
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map(app => {
            const drive = app.driveId || {};
            const company = drive.companyId || {};
            const sc = statusConfig[app.status] || statusConfig.applied;

            return (
              <div
                key={app._id}
                className="app-card bg-bg-surface border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 cursor-pointer hover:border-accent/40 transition-all shadow-sm"
                onClick={() => navigate(`/student/drives/${drive._id}`)}
              >
                {/* Logo & Mobile Header */}
                <div className="flex items-center gap-3 sm:block shrink-0">
                  <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="md" className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl" />
                  <div className="sm:hidden flex-1 min-w-0">
                    <p className="font-bold text-text-primary text-sm truncate m-0">{drive.title || 'Drive'}</p>
                    <p className="text-xs text-text-muted truncate m-0">{company.name}</p>
                  </div>
                  <span className="sm:hidden text-3xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: sc.color, background: sc.bg }}>
                    {sc.label}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="hidden sm:flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-text-primary text-sm sm:text-base m-0">{drive.title || 'Drive'}</p>
                    <span className="text-3xs font-bold px-2.5 py-0.5 rounded-full" style={{ color: sc.color, background: sc.bg }}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted hidden sm:block m-0">{company.name} · {drive.location}</p>
                  <p className="text-xs text-text-muted sm:hidden m-0">📍 {drive.location}</p>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {drive.package && (
                      <span className="text-xs font-bold text-emerald-400">
                        ₹{fmt(drive.package.min)}–{fmt(drive.package.max)} LPA
                      </span>
                    )}
                    <span className="text-3xs text-text-muted">Applied {fmtDate(app.appliedAt)}</span>
                  </div>

                  {/* Rejection Reason Alert */}
                  {app.status === 'rejected' && (
                    <div className="mt-2.5 p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-2 text-xs">
                      <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-400">Reason for Rejection: </span>
                        <span className="text-text-secondary">
                          {app.rejectionReason || 'Candidate profile or eligibility criteria did not meet cutoff.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Placement Offer Letter & NOC Action Buttons */}
                  {['offered', 'selected'].includes(app.status) && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap w-full">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const enrichedApp = {
                            ...app,
                            studentId: {
                              ...(app.studentId || {}),
                              userId: app.studentId?.userId || user || {},
                            },
                          };
                          setOfferModalApp(enrichedApp);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500/15 via-accent/15 to-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:from-emerald-500/25 hover:to-emerald-500/30 transition-all w-full sm:w-auto"
                        title="Download and view official Corporate Offer Letter PDF"
                      >
                        <Award size={14} />
                        <span>View / Download Offer Letter 📜 (PDF)</span>
                      </button>

                      {app.nocStatus === 'issued' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const enrichedApp = {
                              ...app,
                              studentId: {
                                ...(app.studentId || {}),
                                userId: app.studentId?.userId || user || {},
                              },
                            };
                            setNocModalApp(enrichedApp);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-accent/15 border border-accent/35 text-accent rounded-xl text-xs font-bold cursor-pointer hover:bg-accent/25 transition-all w-full sm:w-auto"
                          title="View College No Objection Certificate"
                        >
                          <ShieldCheck size={14} />
                          <span>College NOC</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <ArrowRight size={16} className="text-text-muted shrink-0 hidden sm:block" />
              </div>
            );
          })}
        </div>
      )}

      {/* Official NOC Certificate Modal */}
      <NocCertificateModal
        isOpen={!!nocModalApp}
        onClose={() => setNocModalApp(null)}
        application={nocModalApp}
      />

      {/* Official Corporate Offer Letter Modal (PDF Download) */}
      <OfferLetterModal
        isOpen={!!offerModalApp}
        onClose={() => setOfferModalApp(null)}
        application={offerModalApp}
      />
    </div>
  );
}
