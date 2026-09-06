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
  Building2,
  ChevronRight,
  Info,
  Loader2,
  Filter,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { interviewService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import CompanyLogo from '../../components/ui/CompanyLogo';

const STATUS_CONFIG = {
  scheduled: {
    label: 'Upcoming',
    bg: 'bg-blue-500/10',
    color: 'text-blue-400',
    border: 'border-blue-500/25',
    icon: Clock,
  },
  rescheduled: {
    label: 'Rescheduled',
    bg: 'bg-amber-500/10',
    color: 'text-amber-400',
    border: 'border-amber-500/25',
    icon: AlertCircle,
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-400',
    border: 'border-emerald-500/25',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10',
    color: 'text-rose-400',
    border: 'border-rose-500/25',
    icon: XCircle,
  },
};

const StudentInterviews = () => {
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'completed'

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await interviewService.getMyInterviews();
      const list = res.data?.data?.interviews || (Array.isArray(res.data?.data) ? res.data?.data : []);
      setInterviews(list);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Filtered list
  const filteredInterviews = interviews.filter((item) => {
    if (activeTab === 'upcoming') {
      return ['scheduled', 'rescheduled'].includes(item.status);
    }
    if (activeTab === 'completed') {
      return item.status === 'completed';
    }
    return true;
  });

  const upcomingCount = interviews.filter((i) => ['scheduled', 'rescheduled'].includes(i.status)).length;
  const completedCount = interviews.filter((i) => i.status === 'completed').length;

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

  const getTimeLeft = (dateString) => {
    const diff = new Date(dateString) - new Date();
    if (diff < 0) return 'Past scheduled time';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    const mins = Math.floor(diff / (1000 * 60));
    return `In ${mins} minute${mins > 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Interview Desk & Round Scheduler
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            My Placement Interviews
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track round schedules, live meeting links, interviewer notes, and performance evaluations.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-bg-surface border border-border flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              {upcomingCount}
            </div>
            <div className="text-left">
              <p className="text-2xs uppercase tracking-wider text-text-muted font-semibold">Upcoming</p>
              <p className="text-xs font-medium text-text-primary">Rounds Pending</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-bg-surface border border-border flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {completedCount}
            </div>
            <div className="text-left">
              <p className="text-2xs uppercase tracking-wider text-text-muted font-semibold">Evaluated</p>
              <p className="text-xs font-medium text-text-primary">Rounds Finished</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {[
          { id: 'all', label: `All Interviews (${interviews.length})` },
          { id: 'upcoming', label: `Upcoming & Live (${upcomingCount})` },
          { id: 'completed', label: `Completed & Feedback (${completedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm">Loading your interview schedule...</p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/25 text-accent flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-text-primary">
              {activeTab === 'upcoming'
                ? 'No Upcoming Interviews'
                : activeTab === 'completed'
                ? 'No Completed Interviews Yet'
                : 'No Interviews Scheduled Yet'}
            </h3>
            <p className="text-xs text-text-muted">
              Once recruiters review your application and schedule technical or cultural rounds, they will appear here with live meeting links and interview instructions.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map((item) => {
            const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;
            const StatusIcon = sc.icon;
            const app = item.applicationId || {};
            const drive = app.driveId || item.driveId || {};
            const company = drive.companyId || item.companyId || {};
            const isUpcoming = ['scheduled', 'rescheduled'].includes(item.status);
            const scheduledDate = item.scheduledAt || item.scheduledDate;
            const roundNum = item.round || item.roundNumber || 1;
            const roundTitle = item.title || item.roundName || 'Technical Round';
            const interviewerName = typeof item.interviewer === 'string' && item.interviewer
              ? item.interviewer
              : (item.interviewer?.name || item.interviewerName || 'Assigned Lead');
            const logo = company.logoUrl || company.logo;

            return (
              <div
                key={item._id}
                className="bg-bg-surface border border-border rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:border-border-hover shadow-sm space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Company Logo in circular frame */}
                    <CompanyLogo name={company.name} logoUrl={logo} size="md" />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-text-primary text-base sm:text-lg">
                          {company.name || 'Company'}
                        </span>
                        <span className="text-text-muted text-xs">·</span>
                        <span className="text-xs font-medium text-text-secondary">
                          {drive.title || drive.jobRole || 'Placement Role'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider border ${sc.bg} ${sc.color} ${sc.border}`}>
                          {sc.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                        <span className="font-semibold text-accent">
                          Round {roundNum}: {roundTitle}
                        </span>
                        {item.mode && (
                          <>
                            <span>·</span>
                            <span className="capitalize flex items-center gap-1">
                              {item.mode === 'online' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                              {item.mode}
                            </span>
                          </>
                        )}
                        {item.durationMinutes && (
                          <>
                            <span>·</span>
                            <span>{item.durationMinutes} minutes</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date & Time pill */}
                  <div className="text-left sm:text-right bg-bg-elevated/70 border border-border/80 px-3.5 py-2 rounded-xl shrink-0">
                    <div className="flex items-center sm:justify-end gap-1.5 text-xs font-semibold text-text-primary">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>{formatDate(scheduledDate)}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-1.5 text-2xs text-text-muted mt-0.5">
                      <Clock className="w-3 h-3 text-text-muted" />
                      <span>{formatTime(scheduledDate)}</span>
                      {isUpcoming && (
                        <span className="text-accent font-medium ml-1">({getTimeLeft(scheduledDate)})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Details: Interviewer & Meeting Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-border/70 text-xs">
                  {/* Interviewer */}
                  <div className="p-3 rounded-xl bg-bg-elevated/50 border border-border flex items-start gap-2.5">
                    <User className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-2xs text-text-muted uppercase font-semibold tracking-wider">Interviewer</p>
                      <p className="font-medium text-text-primary mt-0.5">
                        {interviewerName}
                      </p>
                      {(item.interviewer?.designation || item.interviewerDesignation) && (
                        <p className="text-2xs text-text-muted">
                          {item.interviewer?.designation || item.interviewerDesignation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mode / Location / Join */}
                  <div className="p-3 rounded-xl bg-bg-elevated/50 border border-border flex items-start gap-2.5">
                    {item.mode === 'online' ? (
                      <Video className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    ) : (
                      <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-2xs text-text-muted uppercase font-semibold tracking-wider">
                        {item.mode === 'online' ? 'Meeting Platform' : 'Physical Location'}
                      </p>
                      {item.mode === 'online' && item.meetingLink ? (
                        <div className="mt-1">
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm cursor-pointer"
                          >
                            <span>Join Video Call</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-text-primary mt-0.5">
                          {item.location || 'College Placement Hall / Company Office'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Instructions or Preparation Focus */}
                  <div className="p-3 rounded-xl bg-bg-elevated/50 border border-border flex items-start gap-2.5 sm:col-span-2 lg:col-span-1">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-2xs text-text-muted uppercase font-semibold tracking-wider">Candidate Guidelines</p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {item.notes || 'Please have your IDE, GitHub profile, and project demo ready. Join 5 mins prior.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feedback block if completed */}
                {item.status === 'completed' && item.feedback && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Recruiter Feedback & Assessment
                      </span>
                      {item.rating && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-2xs">
                          Rating: {item.rating}/10
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary leading-relaxed pt-1">
                      {item.feedback}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentInterviews;
