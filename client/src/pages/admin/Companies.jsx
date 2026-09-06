import { useState, useEffect, useMemo } from 'react';
import {
  Building2, CheckCircle2, XCircle, Search, Filter,
  ExternalLink, ShieldCheck, Globe, MapPin, Mail, Loader2,
  RefreshCw, Briefcase, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { companyService } from '../../services/dataService';
import CompanyLogo from '../../components/ui/CompanyLogo';

export default function AdminCompanies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companyService.getAll({ limit: 100 });
      setCompanies(res.data?.data?.companies || []);
    } catch (err) {
      toast.error('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleVerify = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      const res = await companyService.verify(id);
      setCompanies(prev => prev.map(c => c._id === id ? { ...c, isVerified: true } : c));
      toast.success('Company verified and cleared for campus recruitment! 🛡️');
    } catch (err) {
      toast.error('Failed to verify company.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const q = search.toLowerCase().trim();
      const name = (c.name || '').toLowerCase();
      const industry = (c.industry || '').toLowerCase();
      const location = (c.location || '').toLowerCase();
      const email = (c.email || '').toLowerCase();

      const matchesSearch = !q || name.includes(q) || industry.includes(q) || location.includes(q) || email.includes(q);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'verified' && c.isVerified) ||
        (filter === 'pending' && !c.isVerified);

      return matchesSearch && matchesFilter;
    });
  }, [companies, search, filter]);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      verified: companies.filter(c => c.isVerified).length,
      pending: companies.filter(c => !c.isVerified).length,
    };
  }, [companies]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary">Company Legitimacy & Approvals</h2>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent/15 border border-accent/30 text-accent uppercase tracking-wider">
              T&P Vetting Desk
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Vet partner recruiters, inspect company credentials, and authorize corporate placement drives.
          </p>
        </div>

        <button
          onClick={fetchCompanies}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-text-muted uppercase">Total Registered Recruiters</p>
          <p className="text-2xl font-black text-text-primary mt-1">{stats.total}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-emerald-400 uppercase">Verified Campus Partners</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.verified}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-amber-400 uppercase">Pending Review</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.pending}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company by name, industry (e.g. FinTech, Cloud), or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-bg-elevated border border-border text-text-primary rounded-lg text-xs px-3 py-2 outline-none focus:border-accent cursor-pointer w-full sm:w-auto"
        >
          <option value="all">All Statuses ({companies.length})</option>
          <option value="verified">Verified Partners ({stats.verified})</option>
          <option value="pending">Pending Vetting ({stats.pending})</option>
        </select>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
          <span className="text-xs text-text-muted">Loading partner companies...</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center">
          <Building2 className="w-10 h-10 text-text-disabled mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-text-primary">No companies found</h3>
          <p className="text-xs text-text-muted mt-1">Adjust search parameters to find recruiters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((c) => {
            const isUpdating = updatingId === c._id;
            return (
              <div
                key={c._id}
                className="bg-bg-surface border border-border hover:border-border-strong rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all shadow-sm"
              >
                <div>
                  {/* Top: Logo + Verification */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={c.name} logoUrl={c.logoUrl} size="md" />
                      <div>
                        <h3 className="font-bold text-sm text-text-primary leading-tight">{c.name}</h3>
                        <p className="text-2xs text-text-muted mt-0.5">{c.industry || 'Tech / Services'}</p>
                      </div>
                    </div>

                    {c.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                    {c.description || 'No detailed company description provided.'}
                  </p>

                  {/* Metadata */}
                  <div className="mt-3 space-y-1 text-2xs text-text-muted">
                    {c.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-text-muted shrink-0" />
                        <span className="truncate">{c.location}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-text-muted shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-text-muted shrink-0" />
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline inline-flex items-center gap-0.5 truncate"
                        >
                          <span>{c.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/tpcell/drives`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>View Drives</span>
                  </button>

                  {!c.isVerified ? (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleVerify(c._id, c.isVerified)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve Partner</span>
                    </button>
                  ) : (
                    <span className="text-3xs text-emerald-400/80 font-medium">Cleared for Campus</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
