import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Star,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import { interviewService, driveService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';

const STATUS_CONFIG = {
  scheduled: {
    label: 'Scheduled',
    bg: 'bg-blue-500/10',
    color: 'text-blue-400',
    border: 'border-blue-500/25',
  },
  rescheduled: {
    label: 'Rescheduled',
    bg: 'bg-amber-500/10',
    color: 'text-amber-400',
    border: 'border-amber-500/25',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-400',
    border: 'border-emerald-500/25',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10',
    color: 'text-rose-400',
    border: 'border-rose-500/25',
  },
};

const CompanyInterviews = () => {
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states for feedback / update
  const [editingInterview, setEditingInterview] = useState(null);
  const [editStatus, setEditStatus] = useState('completed');
  const [editFeedback, setEditFeedback] = useState('');
  const [editRating, setEditRating] = useState('8');
  const [editDate, setEditDate] = useState('');
  const [editMeetingLink, setEditMeetingLink] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await interviewService.getCompanyInterviews();
      const list = res.data?.data?.interviews || (Array.isArray(res.data?.data) ? res.data?.data : []);
      setInterviews(list);
    } catch (err) {
      console.error('Failed to fetch company interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleOpenEdit = (interview) => {
    setEditingInterview(interview);
    setEditStatus(interview.status || 'completed');
    setEditFeedback(interview.feedback || '');
    setEditRating(interview.rating?.toString() || '8');
    setEditMeetingLink(interview.meetingLink || '');
    setEditNotes(interview.notes || '');

    // Format date for datetime-local
    if (interview.scheduledDate) {
      const d = new Date(interview.scheduledDate);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditDate(iso);
    } else {
      setEditDate('');
    }
    setErrorMsg('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingInterview) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        status: editStatus,
        feedback: editFeedback,
        rating: editRating ? Number(editRating) : undefined,
        meetingLink: editMeetingLink,
        notes: editNotes,
      };
      if (editDate) {
        payload.scheduledDate = new Date(editDate).toISOString();
      }

      await interviewService.update(editingInterview._id, payload);
      setEditingInterview(null);
      await fetchInterviews();
    } catch (err) {
      console.error('Failed to update interview:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update interview');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and remove this interview?')) return;
    try {
      await interviewService.delete(id);
      await fetchInterviews();
    } catch (err) {
      console.error('Failed to delete interview:', err);
      alert('Failed to delete interview');
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sUser = item.studentId?.userId || {};
      const name = (sUser.name || '').toLowerCase();
      const email = (sUser.email || '').toLowerCase();
      const role = (item.driveId?.title || item.driveId?.jobRole || '').toLowerCase();
      const round = (item.roundName || '').toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q) || round.includes(q);
    }
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Interview Management Desk
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Conduct, coordinate, and evaluate candidate interview rounds across your active placement drives.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-bg-surface border border-border flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              {interviews.filter((i) => ['scheduled', 'rescheduled'].includes(i.status)).length}
            </div>
            <div className="text-left">
              <p className="text-2xs uppercase tracking-wider text-text-muted font-semibold">Active</p>
              <p className="text-xs font-medium text-text-primary">Upcoming Rounds</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-bg-surface border border-border flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {interviews.filter((i) => i.status === 'completed').length}
            </div>
            <div className="text-left">
              <p className="text-2xs uppercase tracking-wider text-text-muted font-semibold">Evaluated</p>
              <p className="text-xs font-medium text-text-primary">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-surface border border-border p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, role, or round..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'rescheduled', label: 'Rescheduled' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === pill.id
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interviews Table / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm">Loading interview roster...</p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/25 text-accent flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-text-primary">No Interviews Found</h3>
            <p className="text-xs text-text-muted">
              {searchQuery || statusFilter !== 'all'
                ? 'No interviews match your filters. Try clearing search or status.'
                : 'You have not scheduled any candidate interviews yet. Go to Applicants page to schedule interviews for shortlisted students.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredInterviews.map((item) => {
            const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;
            const app = item.applicationId || {};
            const student = app.studentId || item.studentId || {};
            const sUser = student.userId || {};
            const drive = app.driveId || item.driveId || {};
            const scheduledDate = item.scheduledAt || item.scheduledDate;
            const roundNum = item.round || item.roundNumber || 1;
            const roundTitle = item.title || item.roundName || 'Technical Round';
            const interviewerName = typeof item.interviewer === 'string' && item.interviewer
              ? item.interviewer
              : (item.interviewer?.name || item.interviewerName || 'Assigned Lead');

            return (
              <div
                key={item._id}
                className="bg-bg-surface border border-border rounded-2xl p-5 hover:border-border-hover transition-all shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Candidate & Round Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold text-base flex items-center justify-center shrink-0">
                    {sUser.name?.[0]?.toUpperCase() || 'S'}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-text-primary text-base leading-snug">
                        {sUser.name || 'Candidate'}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider border ${sc.bg} ${sc.color} ${sc.border}`}>
                        {sc.label}
                      </span>
                    </div>

                    <p className="text-xs text-text-muted">
                      {sUser.email} · {student.department || 'Dept'} · CGPA: {student.cgpa || '—'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                      <span className="font-medium text-accent">
                        Round {roundNum}: {roundTitle}
                      </span>
                      <span className="text-text-muted">·</span>
                      <span className="text-text-secondary">{drive.title || drive.jobRole || 'Drive'}</span>
                    </div>

                    {/* Interview details bar */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        {formatDate(scheduledDate)} at {formatTime(scheduledDate)}
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        {item.mode === 'offline' ? <MapPin className="w-3.5 h-3.5 text-amber-400" /> : <Video className="w-3.5 h-3.5 text-blue-400" />}
                        {item.mode || 'online'} ({item.durationMinutes || 45} mins)
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-text-muted" />
                        {interviewerName}
                      </span>
                    </div>

                    {/* Candidate feedback pill if present */}
                    {item.feedback && (
                      <div className="mt-2 p-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">Evaluation: </span>
                        {item.feedback}
                        {item.rating && <span className="ml-2 font-bold text-accent">★ {item.rating}/10</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border shrink-0">
                  {/* Join Call if online */}
                  {item.mode === 'online' && item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 transition-colors cursor-pointer"
                      title="Open Google Meet / Zoom link"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Call</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}

                  {/* Evaluate / Reschedule button */}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-elevated border border-border text-text-primary hover:border-accent hover:text-accent transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Evaluate / Reschedule</span>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Cancel & remove interview"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Evaluate Modal */}
      {editingInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-text-primary text-lg">
                  Evaluate & Update Interview
                </h3>
                <p className="text-xs text-text-muted">
                  Candidate: {editingInterview.studentId?.userId?.name || 'Student'}
                </p>
              </div>
              <button
                onClick={() => setEditingInterview(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              {/* Status */}
              <div>
                <label className="block text-text-muted font-semibold uppercase tracking-wider text-2xs mb-1">
                  Interview Round Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="scheduled">Upcoming / Scheduled</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="completed">Completed & Evaluated</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date & Time if rescheduling */}
              <div>
                <label className="block text-text-muted font-semibold uppercase tracking-wider text-2xs mb-1">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              {/* Meeting Link */}
              <div>
                <label className="block text-text-muted font-semibold uppercase tracking-wider text-2xs mb-1">
                  Meeting Link (Google Meet / Zoom URL)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={editMeetingLink}
                  onChange={(e) => setEditMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>

              {/* Rating (1-10) */}
              <div>
                <label className="block text-text-muted font-semibold uppercase tracking-wider text-2xs mb-1">
                  Score / Rating (1 to 10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editRating}
                  onChange={(e) => setEditRating(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-text-muted font-semibold uppercase tracking-wider text-2xs mb-1">
                  Interviewer Feedback & Recommendations
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Candidate demonstrated strong problem solving in DS/Algorithms. Cleared for next round."
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-text-muted font-semibold uppercase tracking-wider text-2xs mb-1">
                  Candidate Notes / Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please bring architectural diagram of your capstone project."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingInterview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInterviews;
