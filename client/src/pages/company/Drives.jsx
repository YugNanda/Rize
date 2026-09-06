import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Users, Clock, TrendingUp, MapPin, Building2, ToggleLeft, ToggleRight, Loader2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { driveService, applicationService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';

const statusConfig = {
  draft:     { label: 'Pending T&P Approval', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  open:      { label: 'Open',                  color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  closed:    { label: 'Closed',                color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
  completed: { label: 'Completed',             color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
};

const fmt = (n) => n >= 100 ? `${(n / 100).toFixed(0)}Cr` : `${n}L`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const daysLeft = (d) => { const diff = Math.ceil((new Date(d) - Date.now()) / 86400000); return diff; };

export default function CompanyDrives() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await driveService.getAll({ limit: 50 });
      setDrives(res.data.data.drives);
    } catch { toast.error('Failed to load drives.'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (drive) => {
    setTogglingId(drive._id);
    const next = drive.status === 'open' ? 'closed' : 'open';
    try {
      await driveService.updateStatus(drive._id, next);
      window.dispatchEvent(new Event('rize:drive_updated'));
      setDrives(ds => ds.map(d => d._id === drive._id ? { ...d, status: next } : d));
      toast.success(`Drive ${next}.`);
    } catch { toast.error('Status update failed.'); } finally { setTogglingId(null); }
  };

  const stats = {
    total: drives.length,
    open: drives.filter(d => d.status === 'open').length,
    draft: drives.filter(d => d.status === 'draft').length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1rem', fontFamily: "'Inter',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .dr-row{transition:all 0.15s} .dr-row:hover{background:var(--bg-elevated)!important}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Drives</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>Manage your campus recruitment drives</p>
        </div>
        <button onClick={() => navigate('/company/drives/new')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
          <Plus size={15} /> New Drive
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[['Total Drives', stats.total, '#6366F1'], ['Live & Open', stats.open, '#10B981'], ['Pending T&P Approval', stats.draft, '#F59E0B']].map(([l, v, c]) => (
          <div key={l} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: c, margin: 0 }}>{v}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {drives.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, color: 'var(--text-muted)' }}>
          <Building2 size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No drives yet</p>
          <button onClick={() => navigate('/company/drives/new')} style={{ marginTop: '1rem', padding: '0.625rem 1.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
            Create First Drive
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            {['Role / Drive', 'Package', 'Deadline', 'Status', 'Actions'].map(h => (
              <span key={h} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {drives.map((d, i) => {
            const sc = statusConfig[d.status] || statusConfig.draft;
            const dl = daysLeft(d.applicationDeadline);
            return (
              <div key={d._id} className="dr-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < drives.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontSize: '0.875rem' }}>{d.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{d.jobRole} · {d.location}</p>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>₹{fmt(d.package.min)}–{fmt(d.package.max)} LPA</span>
                <span style={{ fontSize: '0.8125rem', color: dl < 0 ? 'var(--danger)' : dl <= 3 ? 'var(--warning)' : 'var(--text-muted)' }}>
                  {dl < 0 ? 'Expired' : `${dl}d left`} <span style={{ color: 'var(--text-disabled)', fontSize: '0.75rem' }}>({fmtDate(d.applicationDeadline)})</span>
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: sc.color, background: sc.bg, padding: '0.2rem 0.6rem', borderRadius: 999, display: 'inline-block' }}>{sc.label}</span>
                <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                  {/* Applicants */}
                  <button onClick={() => navigate(`/company/drives/${d._id}/applicants`)} title="View Applicants"
                    style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>
                    <Users size={13} color="var(--text-muted)" />
                  </button>
                  {/* Edit */}
                  <button onClick={() => navigate(`/company/drives/${d._id}/edit`)} title="Edit Drive"
                    style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>
                    <Edit size={13} color="var(--text-muted)" />
                  </button>
                  {/* Toggle open/close */}
                  <button onClick={() => toggleStatus(d)} title={d.status === 'open' ? 'Close drive' : 'Open drive'} disabled={togglingId === d._id}
                    style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>
                    {togglingId === d._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : d.status === 'open' ? <ToggleRight size={13} color="var(--success)" /> : <ToggleLeft size={13} color="var(--text-muted)" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
