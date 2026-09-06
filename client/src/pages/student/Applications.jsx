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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {apps.map(app => {
            const drive = app.driveId || {};
            const company = drive.companyId || {};
            const sc = statusConfig[app.status] || statusConfig.applied;

            return (
              <div key={app._id} className="app-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                onClick={() => navigate(`/student/drives/${drive._id}`)}>

                {/* Logo */}
                <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="md" />

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4, flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '0.9375rem' }}>{drive.title || 'Drive'}</p>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: sc.color, background: sc.bg, padding: '0.15rem 0.625rem', borderRadius: 999 }}>{sc.label}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>{company.name} · {drive.location}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 6, flexWrap: 'wrap' }}>
                    {drive.package && <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)' }}>₹{fmt(drive.package.min)}–{fmt(drive.package.max)} LPA</span>}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>Applied {fmtDate(app.appliedAt)}</span>
                  </div>

                  {/* Rejection Reason Alert */}
                  {app.status === 'rejected' && (
                    <div style={{ marginTop: '0.625rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <XCircle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444' }}>Reason for Rejection: </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {app.rejectionReason || 'Candidate profile or eligibility criteria did not meet cutoff.'}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Placement Offer Letter & NOC Action Buttons */}
                  {['offered', 'selected'].includes(app.status) && (
                    <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const enrichedApp = {
                            ...app,
                            studentId: {
                              ...(app.studentId || {}),
                              userId: app.studentId?.userId || user || {},
                            }
                          };
                          setOfferModalApp(enrichedApp);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.38rem 0.85rem',
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(16,185,129,0.18))',
                          border: '1px solid rgba(16,185,129,0.4)',
                          color: '#10B981',
                          borderRadius: 8,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(16,185,129,0.12)',
                        }}
                        title="Download and view official Corporate Offer Letter PDF"
                      >
                        <Award size={13} /> View / Download Offer Letter 📜 (PDF)
                      </button>

                      {app.nocStatus === 'issued' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const enrichedApp = {
                              ...app,
                              studentId: {
                                ...(app.studentId || {}),
                                userId: app.studentId?.userId || user || {},
                              }
                            };
                            setNocModalApp(enrichedApp);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.38rem 0.75rem',
                            background: 'rgba(99,102,241,0.12)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            color: '#6366F1',
                            borderRadius: 8,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="View College No Objection Certificate"
                        >
                          <ShieldCheck size={13} /> College NOC
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <ArrowRight size={16} color="var(--text-muted)" />
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
