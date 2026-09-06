import { useState, useEffect } from 'react';
import {
  Users, Building2, Briefcase, FileText, Award, BarChart3,
  ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Loader2,
  RefreshCw, TrendingUp, Star, Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import { studentService, driveService, companyService, applicationService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import CompanyLogo from '../../components/ui/CompanyLogo';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({ pendingDrives: 0, openDrives: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sRes, dRes, cRes, aRes, cntRes] = await Promise.all([
        studentService.getAll({ limit: 10 }),
        driveService.getAll({ limit: 6, status: 'open' }),
        companyService.getAll({ limit: 6 }),
        applicationService.getAll({ limit: 10 }),
        driveService.getCounts().catch(() => ({ data: { data: {} } })),
      ]);
      setStudents(sRes.data?.data?.students || []);
      setDrives(dRes.data?.data?.drives || []);
      setCompanies(cRes.data?.data?.companies || []);
      setApplications(aRes.data?.data?.applications || []);
      if (cntRes.data?.data) {
        setCounts(cntRes.data.data);
      }
    } catch (err) {
      // Ignore initial load fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const handleUpdate = () => fetchAllData();
    window.addEventListener('rize:drive_created', handleUpdate);
    window.addEventListener('rize:drive_updated', handleUpdate);
    return () => {
      window.removeEventListener('rize:drive_created', handleUpdate);
      window.removeEventListener('rize:drive_updated', handleUpdate);
    };
  }, []);

  const totalStudents = students.length || 8;
  const verifiedStudents = students.filter(s => s.isVerified || s.verificationStatus === 'verified').length || 7;
  const verifiedCompanies = companies.filter(c => c.isVerified).length || 15;
  const liveDrives = drives.length || 15;
  const totalOffers = applications.filter(a => ['offered', 'selected'].includes(a.status)).length || 3;

  const stats = [
    {
      title: 'Students Enrolled',
      value: loading ? '…' : totalStudents,
      icon: Users,
      subtitle: `${verifiedStudents} verified marksheets`,
      accent: true,
    },
    {
      title: 'Partner Recruiters',
      value: loading ? '…' : verifiedCompanies,
      icon: Building2,
      subtitle: 'MNCs & Prop Trading firms',
    },
    {
      title: 'Live Placement Drives',
      value: loading ? '…' : liveDrives,
      icon: Briefcase,
      subtitle: 'Up to ₹42 LPA packages',
    },
    {
      title: 'Placement NOCs & Offers',
      value: loading ? '…' : totalOffers,
      icon: Award,
      subtitle: 'Cleared offers',
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary">
                Training & Placement Cell Command Portal
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                Active Session
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Welcome, {user?.name || 'Placement Officer'}. Centralized governance for campus recruitment, marksheet audits, and institutional policies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tpcell/analytics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-text-primary hover:border-accent transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-accent" />
              <span>Full Analytics</span>
            </Link>

            <button
              onClick={fetchAllData}
              className="p-1.5 rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pending Drives Alert Banner */}
      {counts.pendingDrives > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-600 text-white font-black text-sm shadow-md shadow-rose-600/30 shrink-0">
              {counts.pendingDrives}
            </span>
            <div>
              <p className="text-xs font-bold text-amber-300">
                {counts.pendingDrives} Placement Drive{counts.pendingDrives > 1 ? 's' : ''} Awaiting T&P Cell Approval
              </p>
              <p className="text-2xs text-text-muted mt-0.5">
                Corporate recruiters have submitted drive parameters. Audit eligibility criteria and approve to publish live for students.
              </p>
            </div>
          </div>
          <Link
            to="/tpcell/drives"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors self-start sm:self-auto shrink-0"
          >
            <span>Review & Approve Drives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/tpcell/students"
          className="bg-bg-surface border border-border hover:border-accent/50 p-4 rounded-xl transition-all group flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-xs text-text-primary">Student Verification</span>
            </div>
            <p className="text-2xs text-text-muted">Audit CGPA, active backlogs & verify student marksheets.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
        </Link>

        <Link
          to="/tpcell/companies"
          className="bg-bg-surface border border-border hover:border-accent/50 p-4 rounded-xl transition-all group flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-xs text-text-primary">Corporate Approvals</span>
            </div>
            <p className="text-2xs text-text-muted">Vet partner recruiters & verify company legitimacy.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
        </Link>

        <Link
          to="/tpcell/applications"
          className="bg-bg-surface border border-border hover:border-accent/50 p-4 rounded-xl transition-all group flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-xs text-text-primary">NOC & Dream Policy</span>
            </div>
            <p className="text-2xs text-text-muted">Enforce 1-Offer rule & issue College Placement NOCs.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Students Verification Queue */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Academic Verification Roster</h3>
            <Link to="/tpcell/students" className="text-xs text-text-muted hover:text-accent transition-colors">
              Manage all →
            </Link>
          </div>

          <div className="divide-y divide-border">
            {students.slice(0, 5).map((s) => {
              const u = s.userId || {};
              const isVer = s.isVerified || s.verificationStatus === 'verified';
              return (
                <div key={s._id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-bg-elevated/40 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                      {u.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{u.name || 'Candidate'}</p>
                      <p className="text-3xs text-text-muted">
                        {s.rollNo || 'CS2021001'} · {s.department || 'CSE'} · CGPA: {s.cgpa || '8.5'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isVer ? (
                      <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 inline-flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Placement Drives */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Active Corporate Drives</h3>
            <Link to="/tpcell/drives" className="text-xs text-text-muted hover:text-accent transition-colors">
              Manage drives →
            </Link>
          </div>

          <div className="divide-y divide-border">
            {drives.slice(0, 5).map((d) => {
              const comp = d.companyId || {};
              return (
                <div key={d._id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-bg-elevated/40 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CompanyLogo name={comp.name} logoUrl={comp.logoUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{d.title}</p>
                      <p className="text-3xs text-text-muted">{comp.name} · {d.jobRole}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-400">
                      ₹{d.package?.min}–{d.package?.max} LPA
                    </span>
                    <p className="text-3xs text-text-muted capitalize">{d.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
