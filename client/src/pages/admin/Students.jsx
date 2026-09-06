import { useState, useEffect, useMemo } from 'react';
import {
  Users, CheckCircle2, AlertTriangle, FileText, Search, Filter,
  ExternalLink, ShieldCheck, Award, XCircle, ChevronRight, Loader2,
  RefreshCw, Check, School, Download, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { studentService } from '../../services/dataService';
import UserAvatar from '../../components/ui/UserAvatar';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';
import { exportToCsv } from '../../utils/exportCsv';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({ limit: 100 });
      setStudents(res.data?.data?.students || []);
    } catch (err) {
      toast.error('Failed to fetch students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // One-click Verify Student
  const handleVerify = async (id, status, remarks = '') => {
    setUpdatingId(id);
    try {
      const res = await studentService.verify(id, {
        verificationStatus: status,
        verificationRemarks: remarks || (status === 'verified' ? 'Academic records & CGPA verified by T&P Cell' : 'Flagged for academic review'),
      });
      setStudents(prev => prev.map(s => s._id === id ? { ...s, ...res.data?.data?.student } : s));
      toast.success(status === 'verified' ? 'Student marksheet verified! 🛡️' : 'Student flagged for backlog review.');
    } catch (err) {
      toast.error('Failed to update verification status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // One-click Issue NOC
  const handleToggleNoc = async (id, currentNoc) => {
    setUpdatingId(id);
    try {
      const res = await studentService.issueNoc(id, { nocIssued: !currentNoc });
      setStudents(prev => prev.map(s => s._id === id ? { ...s, ...res.data?.data?.student } : s));
      toast.success(!currentNoc ? 'College Placement NOC issued! 📜' : 'NOC revoked.');
    } catch (err) {
      toast.error('Failed to update NOC status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Export filtered students to CSV
  const handleExportCsv = () => {
    if (!filteredStudents.length) {
      toast.error('No students to export.');
      return;
    }
    const rows = filteredStudents.map(s => {
      const user = s.userId || {};
      return {
        name: user.name || 'Student',
        rollNo: s.rollNo || '',
        email: user.email || '',
        department: s.department || '',
        batch: s.batch || '',
        cgpa: s.cgpa ? Number(s.cgpa).toFixed(1) : '',
        backlogs: s.backlogs ?? 0,
        phone: s.phone || '',
        verificationStatus: s.verificationStatus || 'pending',
        nocIssued: s.nocIssued ? 'Yes' : 'No',
        skills: (s.skills || []).join(', '),
      };
    });

    const headers = [
      { key: 'name', label: 'Student Name' },
      { key: 'rollNo', label: 'Roll Number' },
      { key: 'email', label: 'Email Address' },
      { key: 'department', label: 'Department' },
      { key: 'batch', label: 'Batch' },
      { key: 'cgpa', label: 'CGPA' },
      { key: 'backlogs', label: 'Active Backlogs' },
      { key: 'phone', label: 'Phone' },
      { key: 'verificationStatus', label: 'Verification Status' },
      { key: 'nocIssued', label: 'NOC Issued' },
      { key: 'skills', label: 'Skills' },
    ];

    exportToCsv(`Rize_Students_Roster_${Date.now()}.csv`, rows, headers);
    toast.success('Students roster exported to CSV! 📊');
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const user = s.userId || {};
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const roll = (s.rollNo || '').toLowerCase();
      const q = search.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || email.includes(q) || roll.includes(q);
      const matchesDept = deptFilter === 'all' || s.department?.toUpperCase() === deptFilter.toUpperCase();
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && s.verificationStatus === 'verified') ||
        (statusFilter === 'flagged' && s.verificationStatus === 'flagged') ||
        (statusFilter === 'pending' && (!s.verificationStatus || s.verificationStatus === 'pending')) ||
        (statusFilter === 'noc' && s.nocIssued);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [students, search, deptFilter, statusFilter]);

  // Summary counts
  const stats = useMemo(() => {
    return {
      total: students.length,
      verified: students.filter(s => s.verificationStatus === 'verified' || s.isVerified).length,
      flagged: students.filter(s => s.verificationStatus === 'flagged' || (s.backlogs > 0)).length,
      noc: students.filter(s => s.nocIssued).length,
    };
  }, [students]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary">Student Verification & Records</h2>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent/15 border border-accent/30 text-accent uppercase tracking-wider">
              T&P Cell Gatekeeper
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Audit student CGPA, backlogs, marksheet legitimacy, and issue official college placement NOCs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-elevated border border-border text-text-primary hover:bg-bg-overlay transition-colors cursor-pointer shadow-sm"
            title="Export student directory to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchStudents}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Records
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-text-muted uppercase">Total Enrolled</p>
          <p className="text-2xl font-black text-text-primary mt-1">{stats.total}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-emerald-400 uppercase">Verified Marksheets</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.verified}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-amber-400 uppercase">Flagged / Backlogs</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.flagged}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-4">
          <p className="text-2xs font-medium text-indigo-400 uppercase">NOC Issued</p>
          <p className="text-2xl font-black text-indigo-400 mt-1">{stats.noc}</p>
        </div>
      </div>

      {/* Controls / Filter row */}
      <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name, roll no (e.g. CS2021001), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-bg-elevated border border-border text-text-primary rounded-lg text-xs px-2.5 py-2 outline-none focus:border-accent cursor-pointer flex-1 sm:flex-none"
          >
            <option value="all">All Departments</option>
            <option value="CS">Computer Science (CS)</option>
            <option value="IT">Information Tech (IT)</option>
            <option value="ECE">Electronics (ECE)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-elevated border border-border text-text-primary rounded-lg text-xs px-2.5 py-2 outline-none focus:border-accent cursor-pointer flex-1 sm:flex-none"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified Only</option>
            <option value="flagged">Flagged Only</option>
            <option value="pending">Pending Review</option>
            <option value="noc">NOC Issued Only</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
          <span className="text-xs text-text-muted">Loading university student roster...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center">
          <Users className="w-10 h-10 text-text-disabled mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-text-primary">No students match your criteria</h3>
          <p className="text-xs text-text-muted mt-1">Try changing your search keywords or filter settings.</p>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-elevated/50 text-text-muted uppercase text-3xs font-bold tracking-wider">
                  <th className="py-3 px-4">Student & Contact</th>
                  <th className="py-3 px-4">Roll No / Dept</th>
                  <th className="py-3 px-4">CGPA / Backlogs</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">T&P Status</th>
                  <th className="py-3 px-4">Placement NOC</th>
                  <th className="py-3 px-4 text-right">T&P Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((s) => {
                  const user = s.userId || {};
                  const isUpdating = updatingId === s._id;
                  const isVerified = s.verificationStatus === 'verified' || s.isVerified;
                  const isFlagged = s.verificationStatus === 'flagged';

                  return (
                    <tr key={s._id} className="hover:bg-bg-elevated/40 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            student={s}
                            name={user.name}
                            size="sm"
                            className="w-8 h-8 ring-1 ring-border/80"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-text-primary truncate">{user.name || 'Unknown'}</p>
                            <p className="text-3xs text-text-muted truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Roll No / Dept */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-text-primary">{s.rollNo || '—'}</span>
                        <div className="text-3xs text-text-muted">{s.department || 'CSE'} · Sem {s.semester || 8}</div>
                      </td>

                      {/* CGPA / Backlogs */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent text-3xs">
                            {s.cgpa ? Number(s.cgpa).toFixed(1) : '—'} CGPA
                          </span>
                          {s.backlogs > 0 ? (
                            <span className="font-semibold px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 text-3xs">
                              {s.backlogs} Backlog
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-3xs">
                              0 Backlogs
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Resume with modal preview */}
                      <td className="py-3 px-4">
                        {s.resumeUrl ? (
                          <button
                            onClick={() => setPreviewPdf({ url: s.resumeUrl, candidateName: user.name })}
                            className="inline-flex items-center gap-1 text-accent hover:underline text-3xs font-medium cursor-pointer"
                            title="Preview resume in modal"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Preview</span>
                            <Eye className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ) : (
                          <span className="text-3xs text-text-disabled italic">Not uploaded</span>
                        )}
                      </td>

                      {/* T&P Status */}
                      <td className="py-3 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        ) : isFlagged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400">
                            <AlertTriangle className="w-3 h-3" /> Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            Pending Audit
                          </span>
                        )}
                      </td>

                      {/* NOC Status */}
                      <td className="py-3 px-4">
                        {s.nocIssued ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                            <Check className="w-3 h-3" /> NOC Cleared
                          </span>
                        ) : (
                          <span className="text-3xs text-text-disabled">Not Issued</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Verify button */}
                          <button
                            disabled={isUpdating || isVerified}
                            onClick={() => handleVerify(s._id, 'verified')}
                            className="px-2 py-1 rounded text-3xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Verify student marksheet & eligibility"
                          >
                            Verify
                          </button>

                          {/* Flag button */}
                          <button
                            disabled={isUpdating || isFlagged}
                            onClick={() => handleVerify(s._id, 'flagged')}
                            className="px-2 py-1 rounded text-3xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Flag student for active backlogs or discrepancies"
                          >
                            Flag
                          </button>

                          {/* NOC button */}
                          <button
                            disabled={isUpdating}
                            onClick={() => handleToggleNoc(s._id, s.nocIssued)}
                            className={`px-2 py-1 rounded text-3xs font-semibold border transition-colors cursor-pointer ${
                              s.nocIssued
                                ? 'bg-zinc-500/15 border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/25'
                                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25'
                            }`}
                            title="Issue or revoke official college placement NOC"
                          >
                            {s.nocIssued ? 'Revoke NOC' : 'Issue NOC'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
    </div>
  );
}
