import { useState, useEffect, useMemo } from 'react';
import {
  Briefcase, CheckCircle2, XCircle, Search, Filter,
  Calendar, MapPin, TrendingUp, Users, Loader2, RefreshCw,
  Clock, ShieldAlert, Award, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { driveService } from '../../services/dataService';
import CompanyLogo from '../../components/ui/CompanyLogo';

export default function AdminDrives() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await driveService.getAll({ limit: 100 });
      setDrives(res.data?.data?.drives || []);
    } catch (err) {
      toast.error('Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await driveService.updateStatus(id, newStatus);
      window.dispatchEvent(new Event('rize:drive_updated'));
      setDrives(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d));
      if (newStatus === 'open') {
        toast.success('Drive approved! Published live for eligible students.');
      } else {
        toast.success(`Drive status updated to ${newStatus}!`);
      }
    } catch (err) {
      toast.error('Failed to update drive status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredDrives = useMemo(() => {
    return drives.filter(d => {
      const q = search.toLowerCase().trim();
      const title = (d.title || '').toLowerCase();
      const role = (d.jobRole || '').toLowerCase();
      const company = (d.companyId?.name || '').toLowerCase();
      const loc = (d.location || '').toLowerCase();

      const matchesSearch = !q || title.includes(q) || role.includes(q) || company.includes(q) || loc.includes(q);
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drives, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: drives.length,
      open: drives.filter(d => d.status === 'open').length,
      closed: drives.filter(d => ['closed', 'completed'].includes(d.status)).length,
      draft: drives.filter(d => d.status === 'draft').length,
    };
  }, [drives]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary">Placement Drive Governance</h2>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent/15 border border-accent/30 text-accent uppercase tracking-wider">
              T&P Schedule Desk
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Vet incoming corporate placement drives, audit CTC breakdown & eligibility terms, and manage campus drive schedules.
          </p>
        </div>

        <button
          onClick={fetchDrives}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-text-muted uppercase">Total Drives</p>
          <p className="text-2xl font-black text-text-primary mt-1">{stats.total}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-emerald-400 uppercase">Live & Open</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.open}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-zinc-400 uppercase">Completed / Closed</p>
          <p className="text-2xl font-black text-zinc-400 mt-1">{stats.closed}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-amber-400 uppercase">Pending Approval</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.draft}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drives by title, company, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-bg-elevated border border-border text-text-primary rounded-lg text-xs px-3 py-2 outline-none focus:border-accent cursor-pointer w-full sm:w-auto"
        >
          <option value="all">All Drives ({drives.length})</option>
          <option value="open">Open Drives ({stats.open})</option>
          <option value="closed">Closed Drives ({stats.closed})</option>
          <option value="draft">Pending Approval ({stats.draft})</option>
        </select>
      </div>

      {/* Drives List */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
          <span className="text-xs text-text-muted">Loading placement drives...</span>
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center">
          <Briefcase className="w-10 h-10 text-text-disabled mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-text-primary">No drives found</h3>
          <p className="text-xs text-text-muted mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDrives.map((d) => {
            const company = d.companyId || {};
            const isUpdating = updatingId === d._id;
            const el = d.eligibility || {};

            return (
              <div
                key={d._id}
                className={`rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all shadow-sm border ${
                  d.status === 'draft'
                    ? 'border-amber-500/50 bg-amber-500/[0.04] ring-1 ring-amber-500/25'
                    : 'bg-bg-surface border-border hover:border-border-strong'
                }`}
              >
                {/* Left: Company Logo + Drive Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="md" />

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-text-primary leading-tight">{d.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold uppercase tracking-wider ${
                        d.status === 'open'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : d.status === 'closed'
                          ? 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      }`}>
                        {d.status === 'draft' ? '⏳ Pending T&P Approval' : d.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span className="font-medium text-text-secondary">{company.name || 'Company'}</span>
                      <span>· {d.jobRole}</span>
                      {d.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 opacity-70" />
                          {d.location}
                        </span>
                      )}
                      {d.package && (
                        <span className="font-semibold text-emerald-400">
                          ₹{d.package.min}–{d.package.max} LPA
                        </span>
                      )}
                    </div>

                    {/* Eligibility Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-3xs text-text-muted">
                      <span className="px-2 py-0.5 rounded bg-bg-elevated border border-border font-medium">
                        Min CGPA: {el.minCGPA || 6.0}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-bg-elevated border border-border font-medium">
                        Max Backlogs: {el.maxBacklogs ?? 0}
                      </span>
                      {el.allowedDepartments && el.allowedDepartments.length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-bg-elevated border border-border font-medium">
                          Branches: {el.allowedDepartments.join(', ')}
                        </span>
                      )}
                      {d.applicationDeadline && (
                        <span className="flex items-center gap-1 text-text-disabled pl-1">
                          <Clock className="w-2.5 h-2.5" />
                          Deadline: {new Date(d.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-border shrink-0 flex-wrap">
                  {/* Quick 1-Click Approve Button for T&P Cell */}
                  {d.status === 'draft' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(d._id, 'open')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                      title="Approve this drive and make it live for students"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/tpcell/applications?driveId=${d._id}`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-text-primary hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Applications</span>
                  </button>

                  {/* Status Toggle Controls */}
                  <select
                    value={d.status}
                    disabled={isUpdating}
                    onChange={(e) => handleStatusChange(d._id, e.target.value)}
                    className="bg-bg-elevated border border-border text-text-primary rounded-lg text-xs px-2.5 py-1.5 outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="open">Open (Live)</option>
                    <option value="draft">Pending Approval (Draft)</option>
                    <option value="closed">Closed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
