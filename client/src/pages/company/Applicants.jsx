import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, BookOpen, Award, Code, Loader2,
  CheckCircle2, XCircle, Clock, Calendar, Briefcase, FileText,
  Search, Filter, ExternalLink, ChevronRight, UserCheck, AlertCircle, X,
  Video, MapPin, Sparkles, Download, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationService, driveService, interviewService } from '../../services/dataService';
import UserAvatar from '../../components/ui/UserAvatar';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';
import OfferLetterModal from '../../components/ui/OfferLetterModal';
import { exportToCsv } from '../../utils/exportCsv';

const STATUS_CONFIG = {
  applied:     { label: 'Applied',     color: 'text-indigo-400',  bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  shortlisted: { label: 'Shortlisted', color: 'text-amber-400',   bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  interview:   { label: 'Interview',   color: 'text-blue-400',    bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
  offered:     { label: 'Offered',     color: 'text-emerald-400', bg: 'bg-emerald-500/10',border: 'border-emerald-500/20'},
  selected:    { label: 'Selected',    color: 'text-emerald-400', bg: 'bg-emerald-500/10',border: 'border-emerald-500/20'},
  rejected:    { label: 'Rejected',    color: 'text-rose-400',    bg: 'bg-rose-500/10',   border: 'border-rose-500/20'   },
  withdrawn:   { label: 'Withdrawn',   color: 'text-zinc-400',    bg: 'bg-zinc-500/10',   border: 'border-zinc-500/20'   },
};

export default function Applicants() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(driveId || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch applications
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        if (driveId) {
          // Specific drive route
          const res = await applicationService.getDriveApplications(driveId);
          if (isMounted) {
            setApplications(res.data?.data?.applications || []);
            // Also fetch drive info for header
            try {
              const dRes = await driveService.getById(driveId);
              if (dRes.data?.data?.drive) {
                setDrives([dRes.data.data.drive]);
              }
            } catch (e) {
              // Ignore drive fetch error
            }
          }
        } else {
          // All company applications
          const res = await applicationService.getCompanyApplications();
          if (isMounted) {
            setApplications(res.data?.data?.applications || []);
            setDrives(res.data?.data?.drives || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          toast.error(err.response?.data?.message || 'Failed to load applicants.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [driveId]);

  // Rejection reason modal state
  const REJECTION_PRESETS = [
    "Required technical skills didn't match the job role",
    "Active backlogs / failed academic criteria",
    "CGPA below company internal cutoff requirement",
    "Profile and prior project experience didn't suit role",
    "Assessment / coding test performance below cutoff",
    "Other / Custom reason"
  ];
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [selectedReason, setSelectedReason] = useState(REJECTION_PRESETS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [offerModalApp, setOfferModalApp] = useState(null);

  // Export filtered applicants to CSV
  const handleExportCsv = () => {
    if (!filteredApps.length) {
      toast.error('No applicants to export.');
      return;
    }
    const rows = filteredApps.map(a => {
      const student = a.studentId || {};
      const user = student.userId || {};
      const drive = a.driveId || {};
      return {
        name: user.name || 'Candidate',
        email: user.email || '',
        phone: student.phone || '',
        department: student.department || 'CS',
        batch: student.batch || '2021-2025',
        cgpa: student.cgpa ? Number(student.cgpa).toFixed(1) : '',
        backlogs: student.backlogs ?? 0,
        driveTitle: drive.title || '',
        jobRole: drive.jobRole || '',
        status: a.status || 'applied',
        rejectionReason: a.rejectionReason || '',
        appliedAt: a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '',
      };
    });

    const headers = [
      { key: 'name', label: 'Candidate Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'department', label: 'Department' },
      { key: 'batch', label: 'Batch' },
      { key: 'cgpa', label: 'CGPA' },
      { key: 'backlogs', label: 'Backlogs' },
      { key: 'driveTitle', label: 'Placement Drive' },
      { key: 'jobRole', label: 'Job Role' },
      { key: 'status', label: 'Application Status' },
      { key: 'rejectionReason', label: 'Rejection Reason' },
      { key: 'appliedAt', label: 'Application Date' },
    ];

    exportToCsv(`Rize_Candidates_${Date.now()}.csv`, rows, headers);
    toast.success('Applicants roster exported as CSV! 📊');
  };

  // Schedule Interview modal state
  const [scheduleModalApp, setScheduleModalApp] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    roundName: 'Technical Round 1',
    roundNumber: 1,
    scheduledDate: '',
    durationMinutes: 45,
    mode: 'online',
    meetingLink: 'https://meet.google.com/xyz-placement-round',
    location: '',
    interviewerName: 'Principal Tech Lead',
    interviewerDesignation: 'Senior Staff Engineer',
    notes: 'Please keep your laptop ready with your capstone project code and Git profile.',
  });
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  // Open rejection modal with existing reason if already rejected
  const handleOpenRejectModal = (app) => {
    setRejectModalApp(app);
    if (app.rejectionReason && REJECTION_PRESETS.includes(app.rejectionReason)) {
      setSelectedReason(app.rejectionReason);
      setCustomReason('');
    } else if (app.rejectionReason) {
      // If it contains a preset with hyphen or is custom
      const matchedPreset = REJECTION_PRESETS.find(p => p !== 'Other / Custom reason' && app.rejectionReason.startsWith(p));
      if (matchedPreset) {
        setSelectedReason(matchedPreset);
        setCustomReason(app.rejectionReason.replace(`${matchedPreset} - `, ''));
      } else {
        setSelectedReason('Other / Custom reason');
        setCustomReason(app.rejectionReason);
      }
    } else {
      setSelectedReason(REJECTION_PRESETS[0]);
      setCustomReason('');
    }
  };

  // Submit rejection with reason
  const handleConfirmReject = async () => {
    if (!rejectModalApp) return;
    const finalReason = selectedReason === 'Other / Custom reason'
      ? (customReason.trim() || 'Candidate profile or eligibility did not meet company criteria.')
      : (customReason.trim() ? `${selectedReason} - ${customReason.trim()}` : selectedReason);

    setIsSubmittingReject(true);
    setUpdatingId(rejectModalApp._id);
    try {
      await applicationService.updateStatus(rejectModalApp._id, 'rejected', finalReason);
      setApplications(prev =>
        prev.map(app =>
          app._id === rejectModalApp._id
            ? { ...app, status: 'rejected', rejectionReason: finalReason }
            : app
        )
      );
      const student = rejectModalApp.studentId || {};
      const candidateName = student.userId?.name || 'Candidate';
      toast.success(`${candidateName}: Application rejected with reason.`);
      setRejectModalApp(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject application.');
    } finally {
      setIsSubmittingReject(false);
      setUpdatingId(null);
    }
  };

  // Open schedule interview modal
  const handleOpenScheduleModal = (app) => {
    setScheduleModalApp(app);
    // Tomorrow at 11:00 AM
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(11, 0, 0, 0);
    const iso = new Date(tmrw.getTime() - tmrw.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    setScheduleForm({
      roundName: app.status === 'interview' ? 'Technical Round 2' : 'Technical Round 1',
      roundNumber: app.status === 'interview' ? 2 : 1,
      scheduledDate: iso,
      durationMinutes: 45,
      mode: 'online',
      meetingLink: 'https://meet.google.com/xyz-placement-round',
      location: 'Company Conference Room / T&P Seminar Hall',
      interviewerName: 'Principal Tech Lead',
      interviewerDesignation: 'Senior Staff Engineer',
      notes: 'Please keep your laptop ready with your capstone project code and Git profile.',
    });
  };

  // Submit interview schedule
  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleModalApp) return;

    setIsSubmittingSchedule(true);
    setUpdatingId(scheduleModalApp._id);

    try {
      const student = scheduleModalApp.studentId || {};
      const candidateName = student.userId?.name || 'Candidate';
      const drive = scheduleModalApp.driveId || {};

      const scheduledIso = new Date(scheduleForm.scheduledDate).toISOString();
      const payload = {
        applicationId: scheduleModalApp._id,
        driveId: drive._id || drive,
        studentId: student._id || student,
        round: Number(scheduleForm.roundNumber) || 1,
        roundNumber: Number(scheduleForm.roundNumber) || 1,
        title: scheduleForm.roundName || 'Technical Round',
        roundName: scheduleForm.roundName || 'Technical Round',
        scheduledAt: scheduledIso,
        scheduledDate: scheduledIso,
        durationMinutes: Number(scheduleForm.durationMinutes) || 45,
        mode: scheduleForm.mode,
        meetingLink: scheduleForm.mode === 'online' ? scheduleForm.meetingLink : '',
        location: scheduleForm.mode === 'offline' ? scheduleForm.location : '',
        interviewer: scheduleForm.interviewerDesignation
          ? `${scheduleForm.interviewerName} (${scheduleForm.interviewerDesignation})`
          : scheduleForm.interviewerName,
        interviewerName: scheduleForm.interviewerName,
        interviewerDesignation: scheduleForm.interviewerDesignation,
        notes: scheduleForm.notes,
      };

      await interviewService.schedule(payload);

      // Update local status
      setApplications(prev =>
        prev.map(app => (app._id === scheduleModalApp._id ? { ...app, status: 'interview' } : app))
      );

      toast.success(`Interview scheduled successfully for ${candidateName}!`);
      setScheduleModalApp(null);
    } catch (err) {
      console.error('Failed to schedule interview:', err);
      toast.error(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setIsSubmittingSchedule(false);
      setUpdatingId(null);
    }
  };

  // Handle status update (Accept, Reject, Shortlist, Interview)
  const handleUpdateStatus = async (appId, newStatus, candidateName = 'Candidate') => {
    if (newStatus === 'rejected') {
      const app = applications.find(a => a._id === appId);
      if (app) {
        handleOpenRejectModal(app);
        return;
      }
    }

    setUpdatingId(appId);
    try {
      await applicationService.updateStatus(appId, newStatus, '');
      setApplications(prev =>
        prev.map(app => (app._id === appId ? { ...app, status: newStatus, rejectionReason: '' } : app))
      );

      const statusLabels = {
        offered: 'Offered / Accepted! 🎉',
        shortlisted: 'Shortlisted! ⭐',
        interview: 'Scheduled for Interview! 📅',
        applied: 'Reset to Applied.',
      };
      toast.success(`${candidateName}: ${statusLabels[newStatus] || newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      // Drive filter
      if (selectedDriveId !== 'all') {
        const dId = app.driveId?._id || app.driveId;
        if (dId?.toString() !== selectedDriveId) return false;
      }
      // Status filter
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const student = app.studentId || {};
        const user = student.userId || {};
        const drive = app.driveId || {};
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const dept = (student.department || '').toLowerCase();
        const role = (drive.jobRole || drive.title || '').toLowerCase();
        const skills = (student.skills || []).join(' ').toLowerCase();

        return name.includes(q) || email.includes(q) || dept.includes(q) || role.includes(q) || skills.includes(q);
      }
      return true;
    });
  }, [applications, selectedDriveId, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const list = selectedDriveId === 'all'
      ? applications
      : applications.filter(a => (a.driveId?._id || a.driveId)?.toString() === selectedDriveId);

    return {
      total: list.length,
      shortlisted: list.filter(a => a.status === 'shortlisted').length,
      interview: list.filter(a => a.status === 'interview').length,
      offered: list.filter(a => ['offered', 'selected'].includes(a.status)).length,
      rejected: list.filter(a => a.status === 'rejected').length,
    };
  }, [applications, selectedDriveId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-2 sm:p-4">
      {/* Back button if in drive sub-route */}
      {driveId && (
        <button
          onClick={() => navigate('/company/drives')}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all drives
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {driveId && drives[0] ? `${drives[0].title} — Applicants` : 'Candidate Applications'}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Review, evaluate, and accept or reject candidates for your placement drives.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {!driveId && drives.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted whitespace-nowrap">Filter Drive:</span>
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="bg-bg-elevated border border-border text-text-primary rounded-lg text-xs px-3 py-2 outline-none focus:border-accent"
              >
                <option value="all">All Drives ({drives.length})</option>
                {drives.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.title} ({d.jobRole})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export Applicants CSV Button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-bg-elevated hover:bg-bg-overlay border border-border text-text-primary transition-colors cursor-pointer shadow-sm"
            title="Export filtered applicants to CSV spreadsheet"
          >
            <Download size={13} className="text-accent" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-bg-surface border border-border rounded-xl p-3.5 text-center">
          <p className="text-2xl font-black text-indigo-400">{stats.total}</p>
          <p className="text-xs text-text-muted mt-0.5">Total Applied</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-3.5 text-center">
          <p className="text-2xl font-black text-amber-400">{stats.shortlisted}</p>
          <p className="text-xs text-text-muted mt-0.5">Shortlisted</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-3.5 text-center">
          <p className="text-2xl font-black text-blue-400">{stats.interview}</p>
          <p className="text-xs text-text-muted mt-0.5">In Interview</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-3.5 text-center">
          <p className="text-2xl font-black text-emerald-400">{stats.offered}</p>
          <p className="text-xs text-text-muted mt-0.5">Offered / Hired</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-3.5 text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-black text-rose-400">{stats.rejected}</p>
          <p className="text-xs text-text-muted mt-0.5">Rejected</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-bg-surface border border-border rounded-xl p-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search candidate name, email, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs text-text-primary placeholder:text-text-disabled outline-none focus:border-accent"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'applied', label: 'Applied' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'interview', label: 'Interview' },
            { id: 'offered', label: 'Offered' },
            { id: 'rejected', label: 'Rejected' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applicants List */}
      {filteredApps.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center text-text-muted mb-3">
            <User className="w-7 h-7 opacity-40" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No applicants found</h3>
          <p className="text-xs text-text-muted max-w-sm mt-1">
            {searchQuery || statusFilter !== 'all' || selectedDriveId !== 'all'
              ? 'Try changing your search query or filters to find applicants.'
              : 'Candidates who apply to your placement drives will appear here.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || selectedDriveId !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setSelectedDriveId('all'); }}
              className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-text-primary hover:bg-bg-overlay cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredApps.map(app => {
            const student = app.studentId || {};
            const user = student.userId || {};
            const drive = app.driveId || {};
            const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
            const candidateName = user.name || 'Candidate';
            const isUpdating = updatingId === app._id;

            return (
              <div
                key={app._id}
                className="bg-bg-surface border border-border hover:border-border-strong rounded-xl p-4 sm:p-5 transition-all shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Circular Aesthetic Anime Avatar */}
                  <UserAvatar
                    student={student}
                    name={candidateName}
                    size="md"
                    className="w-11 h-11 ring-2 ring-border/80 shrink-0"
                  />

                  {/* Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-text-primary text-sm sm:text-base leading-snug truncate">
                        {candidateName}
                      </h3>
                      {/* Status badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider border ${sc.bg} ${sc.color} ${sc.border}`}>
                        {sc.label}
                      </span>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 opacity-70" />
                        {user.email || '—'}
                      </span>
                      {student.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 opacity-70" />
                          {student.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 opacity-70" />
                        {student.department || 'Dept —'}
                      </span>
                      <span className="font-semibold text-text-secondary">
                        CGPA: {student.cgpa ? Number(student.cgpa).toFixed(1) : '—'}
                      </span>
                      <span className="text-text-muted">
                        Backlogs: {student.backlogs ?? 0}
                      </span>
                    </div>

                    {/* Drive applied for */}
                    <div className="flex items-center gap-1.5 text-xs text-accent">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium">{drive.title || 'Placement Drive'}</span>
                      {drive.jobRole && <span className="text-text-muted">· {drive.jobRole}</span>}
                      {drive.package?.max && (
                        <span className="text-text-muted">· ₹{drive.package.min}–{drive.package.max} LPA</span>
                      )}
                    </div>

                    {/* Skills pills */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {student.skills.slice(0, 7).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-bg-elevated border border-border text-text-muted text-3xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rejection reason badge */}
                    {app.status === 'rejected' && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-rose-400">Rejection Reason: </span>
                          <span className="text-text-secondary">{app.rejectionReason || 'Profile criteria not met'}</span>
                        </div>
                        <button
                          onClick={() => handleOpenRejectModal(app)}
                          className="text-3xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer shrink-0 ml-1"
                        >
                          Change reason
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-border shrink-0">
                  {/* View Resume in modal */}
                  {student.resumeUrl ? (
                    <button
                      onClick={() => setPreviewPdf({ url: student.resumeUrl, candidateName })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                      title="Preview candidate resume in modal"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resume</span>
                      <Eye className="w-3 h-3 opacity-70" />
                    </button>
                  ) : (
                    <span className="text-3xs text-text-disabled italic px-2 py-1">No resume</span>
                  )}

                  {/* Quick One-Click Actions: Accept/Offer & Reject */}
                  <div className="flex items-center gap-1.5">
                    {/* Accept / Offer Button */}
                    <button
                      disabled={isUpdating || ['offered', 'selected'].includes(app.status)}
                      onClick={() => handleUpdateStatus(app._id, 'offered', candidateName)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Accept candidate and make an offer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept / Offer</span>
                    </button>

                    {/* View Issued Offer Letter PDF */}
                    {['offered', 'selected'].includes(app.status) && (
                      <button
                        onClick={() => setOfferModalApp(app)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer"
                        title="View formal Offer Letter PDF issued to candidate"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Offer Letter 📜</span>
                      </button>
                    )}

                    {/* Shortlist Button */}
                    <button
                      disabled={isUpdating || app.status === 'shortlisted'}
                      onClick={() => handleUpdateStatus(app._id, 'shortlisted', candidateName)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Shortlist for next round"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Shortlist</span>
                    </button>

                    {/* Interview Button */}
                    <button
                      disabled={isUpdating}
                      onClick={() => handleOpenScheduleModal(app)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Schedule interview round"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{app.status === 'interview' ? 'Schedule Next Round' : 'Interview'}</span>
                    </button>

                    {/* Reject Button */}
                    <button
                      disabled={isUpdating}
                      onClick={() => handleOpenRejectModal(app)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        app.status === 'rejected'
                          ? 'bg-rose-500/25 border-rose-500/50 text-rose-300'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      title={app.status === 'rejected' ? 'View/edit rejection reason' : 'Reject candidate with reason'}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{app.status === 'rejected' ? 'Rejected' : 'Reject'}</span>
                    </button>

                    {/* Dropdown for any status */}
                    <select
                      value={app.status}
                      disabled={isUpdating}
                      onChange={(e) => handleUpdateStatus(app._id, e.target.value, candidateName)}
                      className="bg-bg-elevated border border-border text-text-primary rounded-lg text-xs px-2 py-1.5 outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="offered">Offered</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Reject Applicant</h3>
                  <p className="text-xs text-text-muted">
                    {rejectModalApp.studentId?.userId?.name || 'Candidate'} · {rejectModalApp.driveId?.title || 'Drive'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalApp(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  Select Reason for Rejection <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2">
                  {REJECTION_PRESETS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedReason === reason
                          ? 'border-rose-500/50 bg-rose-500/10 text-text-primary font-medium'
                          : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectionReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="accent-rose-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional / Custom remarks */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  {selectedReason === 'Other / Custom reason' ? 'Specify Custom Reason' : 'Additional Feedback (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder={
                    selectedReason === 'Other / Custom reason'
                      ? 'e.g. Active backlogs in 5th semester, requires at least 8.0 CGPA...'
                      : 'e.g. Needs more hands-on C++ and multi-threading experience...'
                  }
                  className="w-full bg-bg-elevated border border-border focus:border-rose-500/60 rounded-xl p-3 text-xs text-text-primary outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-bg-elevated border-t border-border flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectModalApp(null)}
                disabled={isSubmittingReject}
                className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary hover:bg-bg-surface border border-border cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmittingReject}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
              >
                {isSubmittingReject ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                ) : (
                  <><XCircle className="w-3.5 h-3.5" /> Confirm Rejection</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-bg-elevated shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-base">
                    Schedule Candidate Interview
                  </h3>
                  <p className="text-2xs text-text-muted">
                    Candidate: <span className="text-text-primary font-medium">{scheduleModalApp.studentId?.userId?.name || 'Student'}</span> · {scheduleModalApp.driveId?.title || 'Drive'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScheduleModalApp(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmSchedule} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Round Name */}
                <div>
                  <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                    Round Name / Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.roundName}
                    onChange={(e) => setScheduleForm(f => ({ ...f, roundName: e.target.value }))}
                    placeholder="e.g. Technical Round 1"
                    className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl px-3 py-2 text-text-primary outline-none"
                  />
                </div>

                {/* Round Number */}
                <div>
                  <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                    Round Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={scheduleForm.roundNumber}
                    onChange={(e) => setScheduleForm(f => ({ ...f, roundNumber: e.target.value }))}
                    className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl px-3 py-2 text-text-primary outline-none"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl px-3 py-2 text-text-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                    Duration (Minutes)
                  </label>
                  <select
                    value={scheduleForm.durationMinutes}
                    onChange={(e) => setScheduleForm(f => ({ ...f, durationMinutes: e.target.value }))}
                    className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl px-3 py-2 text-text-primary outline-none"
                  >
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes (1 hour)</option>
                    <option value="90">90 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                    Interview Mode
                  </label>
                  <select
                    value={scheduleForm.mode}
                    onChange={(e) => setScheduleForm(f => ({ ...f, mode: e.target.value }))}
                    className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl px-3 py-2 text-text-primary outline-none"
                  >
                    <option value="online">Online (Video Call)</option>
                    <option value="offline">In-Person (Campus / Office)</option>
                  </select>
                </div>

                {scheduleForm.mode === 'online' ? (
                  <div>
                    <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://meet.google.com/..."
                      value={scheduleForm.meetingLink}
                      onChange={(e) => setScheduleForm(f => ({ ...f, meetingLink: e.target.value }))}
                      className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl px-3 py-2 text-text-primary outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                      Location / Hall
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. T&P Seminar Hall Room 204"
                      value={scheduleForm.location}
                      onChange={(e) => setScheduleForm(f => ({ ...f, location: e.target.value }))}
                      className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl px-3 py-2 text-text-primary outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Interviewer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                    Interviewer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.interviewerName}
                    onChange={(e) => setScheduleForm(f => ({ ...f, interviewerName: e.target.value }))}
                    placeholder="e.g. Siddharth Rao"
                    className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl px-3 py-2 text-text-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                    Interviewer Designation
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.interviewerDesignation}
                    onChange={(e) => setScheduleForm(f => ({ ...f, interviewerDesignation: e.target.value }))}
                    placeholder="e.g. Principal Systems Engineer"
                    className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl px-3 py-2 text-text-primary outline-none"
                  />
                </div>
              </div>

              {/* Notes for candidate */}
              <div>
                <label className="block font-semibold text-text-secondary uppercase tracking-wider text-2xs mb-1">
                  Preparation Notes / Guidelines for Candidate
                </label>
                <textarea
                  rows={2}
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Please be prepared to explain your recent full-stack system design."
                  className="w-full bg-bg-elevated border border-border focus:border-accent rounded-xl p-3 text-text-primary outline-none resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setScheduleModalApp(null)}
                  disabled={isSubmittingSchedule}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  {isSubmittingSchedule ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scheduling...</>
                  ) : (
                    <><Clock className="w-3.5 h-3.5" /> Confirm & Notify Candidate</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Resume Preview Modal */}
      <PdfPreviewModal
        isOpen={!!previewPdf}
        onClose={() => setPreviewPdf(null)}
        pdfUrl={previewPdf?.url}
        candidateName={previewPdf?.candidateName}
        title="Candidate Resume"
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
