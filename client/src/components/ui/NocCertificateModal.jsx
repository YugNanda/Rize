import { useRef } from 'react';
import { X, Printer, Download, ShieldCheck, Award, Building2, CheckCircle2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NocCertificateModal({
  isOpen,
  onClose,
  application,
}) {
  const printRef = useRef();

  if (!isOpen || !application) return null;

  const student = application.studentId || {};
  const user = student.userId || {};
  const drive = application.driveId || {};
  const company = drive.companyId || {};

  const candidateName = user.name || 'Candidate';
  const rollNo = student.rollNo || 'CS2021001';
  const dept = student.department || 'Computer Science & Engineering';
  const batch = student.batch || '2021-2025';
  const cgpa = student.cgpa ? Number(student.cgpa).toFixed(1) : '8.5';
  const companyName = company.name || 'Partner Company';
  const jobRole = drive.jobRole || drive.title || 'Software Engineer';
  const pkg = drive.package?.max ? `₹${drive.package.min}–${drive.package.max} LPA` : 'Competitive CTC';
  const issueDate = new Date(application.nocIssuedAt || application.updatedAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const refCode = `NOC/RIZE/2026/${(application._id || '000000').slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refCode);
    toast.success('NOC Reference Code copied! 📋');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-border bg-bg-elevated/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-text-primary">
              Official University Placement NOC
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-surface hover:bg-bg-elevated border border-border text-text-primary transition-colors cursor-pointer"
              title="Print Certificate"
            >
              <Printer size={14} />
              <span>Print NOC</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-bg-surface transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Certificate Sheet (Printable Document) */}
        <div
          ref={printRef}
          className="p-6 sm:p-8 bg-amber-500/[0.02] border-2 border-dashed border-border m-4 sm:m-6 rounded-xl relative space-y-6 select-text"
        >
          {/* Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Award className="w-96 h-96 text-text-primary" />
          </div>

          {/* Institutional Header */}
          <div className="text-center border-b-2 border-border/80 pb-5 space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/15 border border-accent/30 text-accent mb-1 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-wide text-text-primary uppercase">
              University Training & Placement Cell
            </h2>
            <p className="text-2xs sm:text-xs text-text-muted uppercase tracking-widest font-semibold">
              Central Placement Office · Institutional Career Development Board
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-3xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                OFFICIALLY ISSUED & VERIFIED
              </span>
            </div>
          </div>

          {/* Reference & Date Bar */}
          <div className="flex flex-wrap items-center justify-between text-2xs sm:text-xs text-text-muted border-b border-border/60 pb-3 gap-2">
            <div className="flex items-center gap-1 font-mono">
              <span>Ref No:</span>
              <strong className="text-text-primary">{refCode}</strong>
              <button
                onClick={handleCopyRef}
                className="hover:text-accent p-0.5"
                title="Copy reference code"
              >
                <Copy size={11} />
              </button>
            </div>
            <div>
              <span>Issue Date: </span>
              <strong className="text-text-primary">{issueDate}</strong>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-wide uppercase underline decoration-accent decoration-2 underline-offset-4">
              No Objection Certificate (NOC)
            </h1>
            <p className="text-3xs text-text-muted uppercase tracking-wider mt-1">
              For Campus Placement & Professional Internship Onboarding
            </p>
          </div>

          {/* Body Content */}
          <div className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3.5">
            <p>
              This is to formally certify that <strong>{candidateName}</strong> (University Roll No:{' '}
              <span className="font-mono font-bold text-text-primary">{rollNo}</span>), a bona fide student of the{' '}
              <strong>Department of {dept}</strong> (Batch: {batch}), possessing a cumulative grade point average of{' '}
              <strong>{cgpa} CGPA</strong> with zero outstanding active academic backlogs, has been offered campus placement.
            </p>

            <div className="p-4 rounded-xl bg-bg-elevated/70 border border-border space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-3xs text-text-muted uppercase font-bold block">Company / Recruiter</span>
                  <span className="font-bold text-text-primary">{companyName}</span>
                </div>
                <div>
                  <span className="text-3xs text-text-muted uppercase font-bold block">Job Designation</span>
                  <span className="font-bold text-accent">{jobRole}</span>
                </div>
                <div>
                  <span className="text-3xs text-text-muted uppercase font-bold block">Annual Remuneration (CTC)</span>
                  <span className="font-bold text-emerald-400">{pkg}</span>
                </div>
                <div>
                  <span className="text-3xs text-text-muted uppercase font-bold block">Institutional Clearance</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Approved (1-Offer Compliant)
                  </span>
                </div>
              </div>
            </div>

            <p>
              The Training & Placement Cell of this Institution confirms that it has <strong>No Objection</strong> to the candidate accepting the aforementioned appointment and commencing industrial training/employment as scheduled.
            </p>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-6 border-t border-border/80 flex items-end justify-between gap-4">
            <div className="text-center space-y-1">
              <div className="w-24 h-8 border-b border-border flex items-end justify-center font-mono text-3xs text-text-disabled italic">
                Verified Digitally
              </div>
              <p className="text-2xs font-bold text-text-primary">Dean, Academics</p>
              <p className="text-3xs text-text-muted">University Administration</p>
            </div>

            {/* Official Circular Digital Stamp */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-500/60 p-1 flex flex-col items-center justify-center text-center rotate-[-8deg] bg-emerald-500/5 select-none shadow-sm">
              <ShieldCheck size={18} className="text-emerald-400 mb-0.5" />
              <span className="text-[7px] font-black uppercase text-emerald-400 leading-tight">
                T&P CELL · VERIFIED
              </span>
              <span className="text-[6px] text-text-muted font-mono">{issueDate}</span>
            </div>

            <div className="text-center space-y-1">
              <div className="w-28 h-8 border-b border-border flex items-end justify-center font-mono text-3xs text-text-disabled italic">
                Placement Officer
              </div>
              <p className="text-2xs font-bold text-text-primary">Training & Placement Officer</p>
              <p className="text-3xs text-text-muted">Head of Corporate Relations</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border bg-bg-elevated/50 flex items-center justify-between text-2xs text-text-muted">
          <span>Official document generated by Rize Institutional Placement Hub.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-bg-elevated border border-border text-text-primary hover:bg-bg-overlay font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
