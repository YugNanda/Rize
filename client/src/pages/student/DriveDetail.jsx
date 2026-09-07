import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, TrendingUp, Building2, CheckCircle, XCircle, AlertCircle, Loader2, FileText, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { driveService, applicationService } from '../../services/dataService';
import CompanyLogo from '../../components/ui/CompanyLogo';

const fmt = (n) => n >= 100 ? `${(n / 100).toFixed(0)} Crore` : `${n} LPA`;
const daysLeft = (d) => { const diff = Math.ceil((new Date(d) - Date.now()) / 86400000); return diff > 0 ? diff : 0; };
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const Chip = ({ children, color = 'var(--text-muted)', bg = 'var(--bg-elevated)' }) => (
  <span style={{ padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, color, background: bg, border: `1px solid ${color}30`, display: 'inline-block' }}>
    {children}
  </span>
);

export default function DriveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driveService.getById(id).then(res => {
      setData(res.data.data);
      setLoading(false);
    }).catch(() => { toast.error('Drive not found.'); navigate('/student/drives'); });
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applicationService.applyToDrive(id);
      toast.success('Application submitted! 🎉');
      // Reload to update alreadyApplied state
      const res = await driveService.getById(id);
      setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed.');
    } finally { setApplying(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return null;
  const { drive, eligibilityResult, alreadyApplied } = data;
  const company = drive.companyId || {};
  const el = drive.eligibility || {};
  const deadline = daysLeft(drive.applicationDeadline);
  const canApply = drive.status === 'open' && !alreadyApplied && eligibilityResult?.eligible;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem', fontFamily: "'Inter',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .apply-btn{transition:all 0.18s} .apply-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--accent) 35%,transparent)}`}</style>

      {/* Back */}
      <button onClick={() => navigate('/student/drives')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.5rem', padding: 0, fontFamily: "'Inter',sans-serif" }}>
        <ArrowLeft size={16} /> Back to drives
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        {/* ── Main content ── */}
        <div>
          {/* Company header */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="lg" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 4px' }}>{company.name} · {company.industry}</p>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>{drive.title}</h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{drive.jobRole}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <TrendingUp size={14} color="var(--success)" />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>₹{fmt(drive.package.min)} – ₹{fmt(drive.package.max)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <MapPin size={13} color="var(--text-muted)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{drive.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Clock size={13} color={deadline <= 3 ? 'var(--danger)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '0.875rem', color: deadline <= 3 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: deadline <= 3 ? 600 : 400 }}>
                  {deadline === 0 ? 'Deadline today' : `${deadline} days to apply`}
                </span>
              </div>
              <Chip color={drive.jobType === 'internship' ? '#F59E0B' : '#6366F1'}>
                {drive.jobType.replace('-', ' ')}
              </Chip>
            </div>
          </div>

          {/* Job Description */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="var(--accent)" /> Job Description
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {drive.description}
            </div>
          </div>

          {/* Company about */}
          {company.description && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} color="var(--accent)" /> About {company.name}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{company.description}</p>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none' }}>
                  Visit website →
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Apply card */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
            {alreadyApplied ? (
              <div style={{ textAlign: 'center' }}>
                {data.userApplication?.status === 'rejected' ? (
                  <>
                    <XCircle size={32} color="var(--danger)" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 700, color: 'var(--danger)', margin: 0 }}>Application Rejected</p>
                    <div style={{ marginTop: '0.625rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, textAlign: 'left' }}>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--danger)', margin: '0 0 2px', textTransform: 'uppercase' }}>Reason</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {data.userApplication?.rejectionReason || 'Did not meet position criteria.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle size={32} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 700, color: 'var(--success)', margin: 0 }}>Application Submitted</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Status: <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{data.userApplication?.status || 'In Review'}</strong>
                    </p>
                  </>
                )}
                <button onClick={() => navigate('/student/applications')} style={{ width: '100%', marginTop: '1rem', padding: '0.625rem', border: '1px solid var(--border)', borderRadius: 8, background: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                  View All Applications →
                </button>
              </div>
            ) : eligibilityResult && !eligibilityResult.eligible ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <XCircle size={18} color="var(--danger)" />
                  <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.875rem' }}>Not Eligible</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {eligibilityResult.issues.map((issue, i) => (
                    <li key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : drive.status !== 'open' ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontWeight: 600, margin: 0 }}>Drive {drive.status}</p>
              </div>
            ) : (
              <button className="apply-btn" onClick={handleApply} disabled={applying}
                style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg,var(--accent),var(--accent-hover))', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 16px color-mix(in srgb,var(--accent) 30%,transparent)' }}>
                {applying ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : '🚀 Apply Now'}
              </button>
            )}
          </div>

          {/* Details card */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Drive Details</h3>
            {[
              ['Deadline', fmtDate(drive.applicationDeadline), Calendar],
              ...(drive.driveDate ? [['Drive Date', fmtDate(drive.driveDate), Calendar]] : []),
            ].map(([label, value, Icon]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Icon size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{label}</span>
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Eligibility card */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.875rem' }}>Eligibility</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {el.minCGPA > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}><span style={{ color: 'var(--text-muted)' }}>Min CGPA</span><strong style={{ color: 'var(--text-primary)' }}>{el.minCGPA}</strong></div>}
              {el.maxBacklogs !== undefined && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}><span style={{ color: 'var(--text-muted)' }}>Max Backlogs</span><strong style={{ color: 'var(--text-primary)' }}>{el.maxBacklogs}</strong></div>}
              {el.min10Percentage > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}><span style={{ color: 'var(--text-muted)' }}>Min 10th %</span><strong style={{ color: 'var(--text-primary)' }}>{el.min10Percentage}%</strong></div>}
              {el.min12Percentage > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}><span style={{ color: 'var(--text-muted)' }}>Min 12th %</span><strong style={{ color: 'var(--text-primary)' }}>{el.min12Percentage}%</strong></div>}
              {el.allowedDepartments?.length > 0 && (
                <div style={{ fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Departments</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {el.allowedDepartments.map(d => <Chip key={d}>{d}</Chip>)}
                  </div>
                </div>
              )}
              {el.requiredSkills?.length > 0 && (
                <div style={{ fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Required Skills</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {el.requiredSkills.map(s => <Chip key={s} color="var(--accent)">{s}</Chip>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
