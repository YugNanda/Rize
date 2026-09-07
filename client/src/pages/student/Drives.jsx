import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Clock, Filter, ChevronRight, Building2, TrendingUp, X } from 'lucide-react';
import { driveService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import CompanyLogo from '../../components/ui/CompanyLogo';

const JOB_TYPES = ['full-time', 'internship', 'part-time', 'contract'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'applicationDeadline', label: 'Deadline Soon' },
  { value: '-package.max', label: 'Highest Package' },
];

const statusConfig = {
  open:      { color: 'var(--success)',  bg: 'color-mix(in srgb,var(--success) 12%,transparent)',  label: 'Open' },
  closed:    { color: 'var(--danger)',   bg: 'color-mix(in srgb,var(--danger) 12%,transparent)',   label: 'Closed' },
  draft:     { color: 'var(--text-muted)',bg: 'var(--bg-elevated)', label: 'Draft' },
  completed: { color: 'var(--info)',     bg: 'color-mix(in srgb,var(--info) 12%,transparent)',     label: 'Completed' },
};

const jobTypeColor = {
  'full-time':  { color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  'internship': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  'part-time':  { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  'contract':   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

const fmt = (n) => n >= 100 ? `${(n / 100).toFixed(0)}Cr` : `${n}L`;
const daysLeft = (d) => { const diff = Math.ceil((new Date(d) - Date.now()) / 86400000); return diff > 0 ? diff : 0; };

const DriveCard = ({ drive, onClick }) => {
  const company = drive.companyId || {};
  const jt = jobTypeColor[drive.jobType] || jobTypeColor['full-time'];
  const st = statusConfig[drive.status] || statusConfig.open;
  const deadline = daysLeft(drive.applicationDeadline);

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14,
      padding: '1.25rem', cursor: 'pointer', transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
      display: 'flex', flexDirection: 'column', gap: '0.875rem', position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 4px 20px color-mix(in srgb,var(--accent) 12%,transparent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>

      {/* Top: logo + badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="md" />
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{company.name}</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{company.industry}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: st.color, background: st.bg, padding: '0.2rem 0.6rem', borderRadius: 999 }}>{st.label}</span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: jt.color, background: jt.bg, padding: '0.2rem 0.6rem', borderRadius: 999, textTransform: 'capitalize' }}>{drive.jobType.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Title + role */}
      <div>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>{drive.title}</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>{drive.jobRole}</p>
      </div>

      {/* Package + Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <TrendingUp size={13} color="var(--success)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success)' }}>
            ₹{fmt(drive.package.min)}–{fmt(drive.package.max)} LPA
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <MapPin size={12} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{drive.location}</span>
        </div>
      </div>

      {/* Deadline + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.625rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Clock size={12} color={deadline <= 3 ? 'var(--danger)' : 'var(--text-muted)'} />
          <span style={{ fontSize: '0.75rem', color: deadline <= 3 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: deadline <= 3 ? 600 : 400 }}>
            {deadline === 0 ? 'Deadline today!' : `${deadline} days left`}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          View & Apply <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
};

export default function StudentDrives() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await driveService.getAll({ search, jobType, sortBy, page, limit: 9, status: 'open' });
      setDrives(res.data.data.drives);
      setPagination(res.data.data.pagination);
    } catch { } finally { setLoading(false); }
  }, [search, jobType, sortBy, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (user?._id) {
      localStorage.setItem('rize_last_seen_drives_' + user._id, Date.now().toString());
      window.dispatchEvent(new Event('rize:drives_seen'));
    }
  }, [user?._id]);

  const clearFilters = () => { setSearch(''); setJobType(''); setSortBy('-createdAt'); setPage(1); };
  const hasFilters = search || jobType;

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        .d-inp { width:100%; background:var(--bg-elevated); border:1px solid var(--border); border-radius:8px; padding:0.5rem 0.75rem 0.5rem 2.25rem; color:var(--text-primary); font-size:0.875rem; font-family:'Inter',sans-serif; outline:none; }
        .d-inp:focus { border-color:var(--accent); }
        .d-sel { background:var(--bg-elevated); border:1px solid var(--border); border-radius:8px; padding:0.5rem 0.75rem; color:var(--text-primary); font-size:0.8125rem; font-family:'Inter',sans-serif; outline:none; cursor:pointer; }
        .d-sel:focus { border-color:var(--accent); }
        .page-btn { padding:0.375rem 0.75rem; border:1px solid var(--border); border-radius:6px; background:var(--bg-elevated); color:var(--text-secondary); font-size:0.8125rem; cursor:pointer; font-family:'Inter',sans-serif; }
        .page-btn:hover { border-color:var(--accent); color:var(--accent); }
        .page-btn.active { background:var(--accent); color:#fff; border-color:var(--accent); }
        .sk { background:var(--bg-elevated); border-radius:14px; height:180px; border:1px solid var(--border); animation:sk_pulse 1.5s ease-in-out infinite alternate; }
        @keyframes sk_pulse { from{opacity:0.6} to{opacity:1} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Placement Drives</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
          {pagination ? `${pagination.total} open drives available` : 'Browse all open placement opportunities'}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input className="d-inp" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search company, role, location..." />
        </div>

        {/* Job type */}
        <select className="d-sel" value={jobType} onChange={e => { setJobType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {JOB_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.replace('-', ' ')}</option>)}
        </select>

        {/* Sort */}
        <select className="d-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', border: '1px solid var(--danger)', borderRadius: 8, background: 'none', color: 'var(--danger)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%, 280px),1fr))', gap: '1rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="sk" />)}
        </div>
      ) : drives.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <Briefcase size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No drives found</p>
          <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%, 280px),1fr))', gap: '1rem' }}>
          {drives.map(d => (
            <DriveCard key={d._id} drive={d} onClick={() => navigate(`/student/drives/${d._id}`)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '2rem' }}>
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
