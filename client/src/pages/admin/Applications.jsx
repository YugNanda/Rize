import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText, CheckCircle2, XCircle, Search, Filter,
  Award, Clock, Building2, User, ExternalLink, ShieldCheck,
  Check, AlertTriangle, AlertCircle, Loader2, RefreshCw, Star,
  Download, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationService, driveService } from '../../services/dataService';
import UserAvatar from '../../components/ui/UserAvatar';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';
import NocCertificateModal from '../../components/ui/NocCertificateModal';
import OfferLetterModal from '../../components/ui/OfferLetterModal';
import { exportToCsv } from '../../utils/exportCsv';

export default function AdminApplications() {
  const [searchParams] = useSearchParams();
  const urlDriveId = searchParams.get('driveId');

  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDriveId, setSelectedDriveId] = useState(urlDriveId || 'all');
  const [updatingId, setUpdatingId] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [nocModalApp, setNocModalApp] = useState(null);
  const [offerModalApp, setOfferModalApp] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, driveRes] = await Promise.all([
        applicationService.getAll({ limit: 100 }),
        driveService.getAll({ limit: 50 }),
      ]);
      setApplications(appRes.data?.data?.applications || []);
      setDrives(driveRes.data?.data?.drives || []);
    } catch (err) {
      toast.error('Failed to load university applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update NOC status
  const handleUpdateNoc = async (appId, currentNoc) => {
    setUpdatingId(appId);
    const newStatus = currentNoc === 'issued' ? 'none' : 'issued';
    try {
      const res = await applicationService.updateNoc(appId, { nocStatus: newStatus });
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, ...res.data?.data?.application } : a)
      );
      toast.success(newStatus === 'issued' ? 'College Placement NOC issued! 📜' : 'NOC revoked.');
    } catch (err) {
      toast.error('Failed to update NOC status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Approve Dream Offer Upgrade
  const handleToggleDreamOffer = async (appId, currentCleared) => {
    setUpdatingId(appId);
    try {
      const res = await applicationService.updateNoc(appId, { dreamOfferCleared: !currentCleared });
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, ...res.data?.data?.application } : a)
      );
      toast.success(!currentCleared ? 'Dream Offer upgrade cleared! 🌟' : 'Dream offer status cleared.');
    } catch (err) {
      toast.error('Failed to update Dream Offer clearance.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Export filtered applications to CSV
  const handleExportCsv = () => {
    if (!filteredApps.length) {
      toast.error('No applications to export.');
      return;
    }
    const rows = filteredApps.map(a => {
      const student = a.studentId || {};
      const user = student.userId || {};
      const drive = a.driveId || {};
      const company = drive.companyId || {};
      return {
        studentName: user.name || 'Student',
        rollNo: student.rollNo || '',
        email: user.email || '',
        department: student.department || '',
        cgpa: student.cgpa ? Number(student.cgpa).toFixed(1) : '',
        backlogs: student.backlogs ?? 0,
        driveTitle: drive.title || '',
        company: company.name || '',
        package: drive.package?.max ? `₹${drive.package.min}-${drive.package.max} LPA` : '',
        status: a.status || 'applied',
        rejectionReason: a.rejectionReason || '',
        nocStatus: a.nocStatus === 'issued' ? 'Issued' : 'Pending',
        dreamOffer: a.dreamOfferCleared ? 'Yes' : 'No',
        appliedAt: a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '',
      };
    });

    const headers = [
      { key: 'studentName', label: 'Student Name' },
      { key: 'rollNo', label: 'Roll Number' },
      { key: 'email', label: 'Email' },
      { key: 'department', label: 'Department' },
      { key: 'cgpa', label: 'CGPA' },
      { key: 'backlogs', label: 'Active Backlogs' },
      { key: 'driveTitle', label: 'Placement Drive' },
      { key: 'company', label: 'Company' },
      { key: 'package', label: 'CTC Package' },
      { key: 'status', label: 'Status' },
      { key: 'rejectionReason', label: 'Rejection Reason' },
      { key: 'nocStatus', label: 'NOC Status' },
      { key: 'dreamOffer', label: 'Dream Offer Upgrade' },
      { key: 'appliedAt', label: 'Applied On' },
    ];

    exportToCsv(`Rize_Placement_Ledger_${Date.now()}.csv`, rows, headers);
    toast.success('Institutional placement ledger exported as CSV! 📊');
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const student = a.studentId || {};
      const user = student.userId || {};
      const drive = a.driveId || {};
      const company = drive.companyId || {};

      const q = search.toLowerCase().trim();
      const sName = (user.name || '').toLowerCase();
      const sEmail = (user.email || '').toLowerCase();
      const sRoll = (student.rollNo || '').toLowerCase();
      const cName = (company.name || '').toLowerCase();
      const dTitle = (drive.title || '').toLowerCase();

      const matchesSearch = !q || sName.includes(q) || sEmail.includes(q) || sRoll.includes(q) || cName.includes(q) || dTitle.includes(q);
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesDrive = selectedDriveId === 'all' || (drive._id?.toString() === selectedDriveId);

      return matchesSearch && matchesStatus && matchesDrive;
    });
  }, [applications, search, statusFilter, selectedDriveId]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      interview: applications.filter(a => a.status === 'interview').length,
      offered: applications.filter(a => ['offered', 'selected'].includes(a.status)).length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };
  }, [applications]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary">Institutional Applications & Clearance Hub</h2>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent/15 border border-accent/30 text-accent uppercase tracking-wider">
              1-Offer & NOC Policy
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Monitor all student applications, audit rejection reasons, enforce 1-Student-1-Offer & Dream Offer policies, and issue official college NOCs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-elevated border border-border text-text-primary hover:bg-bg-overlay transition-colors cursor-pointer shadow-sm"
            title="Export Institutional Placement Ledger to CSV"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-text-muted uppercase">Applications</p>
          <p className="text-2xl font-black text-text-primary mt-1">{stats.total}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-amber-400 uppercase">Shortlisted</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.shortlisted}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-blue-400 uppercase">Interviews</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{stats.interview}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-emerald-400 uppercase">Offers Made</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.offered}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-rose-400 uppercase">Rejections</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
          />
        </div>

        <select
          value={selectedDriveId}
          onChange={(e) => setSelectedDriveId(e.target.value)}
          className="bg-bg-elevated border border-border text-text-primary rounded-lg text-xs px-2.5 py-2 outline-none focus:border-accent cursor-pointer w-full sm:w-auto"
        >
          <option value="all">All Placement Drives</option>
          {drives.map(d => (
            <option key={d._id} value={d._id}>{d.title} ({d.companyId?.name || 'Company'})</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-bg-elevated border border-border text-text-primary rounded-lg text-xs px-2.5 py-2 outline-none focus:border-accent cursor-pointer w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="offered">Offered / Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
          <span className="text-xs text-text-muted">Loading student applications ledger...</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center">
          <FileText className="w-10 h-10 text-text-disabled mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-text-primary">No applications found</h3>
          <p className="text-xs text-text-muted mt-1">Adjust search query or status filter to see submissions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((a) => {
            const student = a.studentId || {};
            const user = student.userId || {};
            const drive = a.driveId || {};
            const company = drive.companyId || {};
            const isUpdating = updatingId === a._id;
            const isOffered = ['offered', 'selected'].includes(a.status);
            const isRejected = a.status === 'rejected';

            return (
              <div
                key={a._id}
                className="bg-bg-surface border border-border hover:border-border-strong rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all shadow-sm"
              >
                {/* Left: Student + Drive */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <UserAvatar
                    student={student}
                    name={user.name}
                    size="md"
                    className="w-11 h-11 ring-2 ring-border/80 shrink-0"
                  />

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-text-primary leading-tight">{user.name || 'Candidate'}</h3>
                      <span className="text-2xs font-mono text-text-muted">({student.rollNo || 'CS2021001'})</span>

                      {/* Status badge */}
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold uppercase tracking-wider ${
                        isOffered
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isRejected
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : a.status === 'shortlisted'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : a.status === 'interview'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {a.status}
                      </span>

                      {/* Dream Offer badge */}
                      {a.dreamOfferCleared && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-3xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Star className="w-2.5 h-2.5 fill-amber-300" /> Dream Offer Cleared
                        </span>
                      )}

                      {/* NOC Status badge */}
                      {a.nocStatus === 'issued' && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <Check className="w-2.5 h-2.5" /> NOC Issued
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span>{student.department || 'CSE'}</span>
                      <span className="font-medium text-text-secondary">CGPA: {student.cgpa ? Number(student.cgpa).toFixed(1) : '—'}</span>
                      <span>Applied for <strong className="text-text-primary">{drive.title || 'Drive'}</strong></span>
                      <span className="text-accent font-medium">@{company.name || 'Company'}</span>
                      {drive.package && (
                        <span className="text-emerald-400 font-semibold">₹{drive.package.min}–{drive.package.max} LPA</span>
                      )}
                    </div>

                    {/* Rejection Reason Callout */}
                    {isRejected && (
                      <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-rose-400">Company Rejection Reason: </span>
                          <span className="text-text-secondary">{a.rejectionReason || 'Criteria not met for this position.'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border shrink-0">
                  {/* Student resume link with modal preview */}
                  {student.resumeUrl && (
                    <button
                      onClick={() => setPreviewPdf({ url: student.resumeUrl, candidateName: user.name })}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                      title="Preview student resume in modal"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resume</span>
                      <Eye className="w-2.5 h-2.5 opacity-70" />
                    </button>
                  )}

                  {/* T&P Policy: Dream Offer Upgrade Button */}
                  <button
                    disabled={isUpdating}
                    onClick={() => handleToggleDreamOffer(a._id, a.dreamOfferCleared)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      a.dreamOfferCleared
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary'
                    }`}
                    title="Allow student to participate in Dream Offer upgrade beyond single-offer limit"
                  >
                    <Star className={`w-3.5 h-3.5 ${a.dreamOfferCleared ? 'fill-amber-300' : ''}`} />
                    <span>{a.dreamOfferCleared ? 'Dream Approved' : 'Dream Offer'}</span>
                  </button>

                  {/* Corporate Offer Letter (PDF) */}
                  {isOffered && (
                    <button
                      onClick={() => setOfferModalApp(a)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition-colors cursor-pointer"
                      title="View & Download official Corporate Offer Letter (PDF)"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Offer Letter 📜</span>
                    </button>
                  )}

                  {/* T&P Policy: Issue / Revoke College NOC */}
                  {isOffered && (
                    <div className="inline-flex items-center gap-1.5">
                      {a.nocStatus === 'issued' && (
                        <button
                          onClick={() => setNocModalApp(a)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                          title="View & Print Official College Placement NOC Certificate"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>View NOC</span>
                        </button>
                      )}
                      <button
                        disabled={isUpdating}
                        onClick={() => handleUpdateNoc(a._id, a.nocStatus)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          a.nocStatus === 'issued'
                            ? 'bg-zinc-500/15 border-zinc-500/30 text-zinc-400'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                        }`}
                        title="Issue official College No-Objection Certificate for this offer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{a.nocStatus === 'issued' ? 'Revoke NOC' : 'Issue NOC'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF Resume Preview Modal */}
      <PdfPreviewModal
        isOpen={!!previewPdf}
        onClose={() => setPreviewPdf(null)}
        pdfUrl={previewPdf?.url}
        candidateName={previewPdf?.candidateName}
        title="Student Resume"
      />

      {/* Official NOC Certificate Modal */}
      <NocCertificateModal
        isOpen={!!nocModalApp}
        onClose={() => setNocModalApp(null)}
        application={nocModalApp}
      />

      {/* Corporate Offer Letter Modal (PDF) */}
      <OfferLetterModal
        isOpen={!!offerModalApp}
        onClose={() => setOfferModalApp(null)}
        application={offerModalApp}
      />
    </div>
  );
}
