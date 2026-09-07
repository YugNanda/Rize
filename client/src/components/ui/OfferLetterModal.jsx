import { useRef } from 'react';
import { X, Printer, Download, Building2, CheckCircle2, Copy, Award, ShieldCheck, Calendar, MapPin, DollarSign, Briefcase, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import CompanyLogo from './CompanyLogo';

export default function OfferLetterModal({
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
  const offer = application.offerLetter || {};

  const candidateName = user.name || 'Candidate';
  const rollNo = student.rollNo || 'CS2021001';
  const dept = student.department || 'Computer Science & Engineering';
  const batch = student.batch || '2021-2025';
  const cgpa = student.cgpa ? Number(student.cgpa).toFixed(1) : '8.8';
  const email = user.email || student.phone || 'candidate@student.rize.in';
  const phone = student.phone || '+91 98765 43210';

  const companyName = company.name || 'Corporate Recruiter';
  const jobRole = offer.designation || drive.jobRole || drive.title || 'Software Development Engineer';
  const packageLpa = offer.packageLpa || drive.package?.max || drive.package?.min || 14;
  const baseSalary = offer.baseSalaryLpa || Number((packageLpa * 0.85).toFixed(2));
  const bonus = offer.bonusLpa || Number((packageLpa * 0.15).toFixed(2));
  const joiningDate = offer.joiningDate || 'July 15, 2026';
  const location = offer.workLocation || drive.location || 'Bengaluru HQ / Hybrid';
  const refNo = offer.referenceNo || `OFFER/${companyName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()}/2026/${(application._id || '0000').slice(-4).toUpperCase()}`;
  
  const issueDate = new Date(offer.issuedAt || application.updatedAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const validUntilDate = new Date(offer.validUntil || (Date.now() + 14 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refNo);
    toast.success('Offer Reference Number copied to clipboard! 📋');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Print Stylesheet to ensure pristine A4 PDF export */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-offer-letter, #printable-offer-letter * {
            visibility: visible !important;
          }
          #printable-offer-letter {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            background: white !important;
            color: #111827 !important;
            border: none !important;
            box-shadow: none !important;
            font-size: 11pt !important;
            line-height: 1.35 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Toolbar (hidden in print) */}
        <div className="px-3 sm:px-5 py-3 border-b border-border bg-bg-elevated/80 flex items-center justify-between gap-2 sm:gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                Corporate Offer Letter
              </h3>
              <p className="text-3xs text-text-muted truncate hidden sm:block">
                Official Placement Document · {companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-2xs sm:text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer shadow-sm"
              title="Save or download as PDF"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-2xs sm:text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-all cursor-pointer shadow-sm"
              title="Print document"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-bg-surface transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="overflow-y-auto p-3 sm:p-6 flex-1 bg-neutral-900/30">
          <div
            id="printable-offer-letter"
            ref={printRef}
            className="p-6 sm:p-10 bg-white text-neutral-900 rounded-xl border border-neutral-200 shadow-xl space-y-6 select-text text-xs sm:text-sm font-sans relative"
            style={{ minHeight: '840px' }}
          >
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <Briefcase className="w-[450px] h-[450px] text-neutral-900" />
            </div>

            {/* Corporate Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-neutral-900 pb-5">
              <div className="flex items-center gap-3.5">
                <CompanyLogo name={companyName} logoUrl={company.logoUrl} size="lg" className="w-14 h-14 rounded-xl shadow-sm border border-neutral-200" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 uppercase">
                    {companyName}
                  </h1>
                  <p className="text-2xs sm:text-xs text-neutral-500 font-medium">
                    {company.industry || 'Technology Solutions'} · Global Talent & People Operations
                  </p>
                  <p className="text-3xs text-neutral-400">
                    {company.website || 'https://careers.company.com'} · Registered Corporate Campus
                  </p>
                </div>
              </div>

              <div className="text-right sm:self-auto self-start border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 font-mono text-3xs text-neutral-600 space-y-0.5">
                <div className="flex items-center sm:justify-end gap-1 font-bold text-neutral-800">
                  <span>Ref:</span>
                  <span className="text-indigo-600 font-semibold">{refNo}</span>
                  <button
                    onClick={handleCopyRef}
                    className="no-print hover:text-neutral-900 ml-0.5"
                    title="Copy Reference"
                  >
                    <Copy size={10} />
                  </button>
                </div>
                <div>Date of Issue: <strong>{issueDate}</strong></div>
                <div className="text-rose-600 font-medium">Valid Until: {validUntilDate}</div>
              </div>
            </div>

            {/* Candidate Recipient Block */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 sm:p-4 text-xs space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/60 pb-2 mb-2">
                <div>
                  <span className="text-3xs uppercase font-bold text-neutral-400 block tracking-wider">Candidate / Appointee</span>
                  <p className="text-sm sm:text-base font-bold text-neutral-900">{candidateName}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xs uppercase font-bold text-neutral-400 block tracking-wider">University Roll Number</span>
                  <span className="font-mono font-bold text-neutral-800 text-xs">{rollNo}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs text-neutral-600">
                <div>
                  <span className="text-neutral-400 block">Department:</span>
                  <strong className="text-neutral-800">{dept}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Graduation Batch:</span>
                  <strong className="text-neutral-800">{batch}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Cumulative CGPA:</span>
                  <strong className="text-emerald-700">{cgpa} / 10.0</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Email / Contact:</span>
                  <strong className="text-neutral-800 truncate block">{email}</strong>
                </div>
              </div>
            </div>

            {/* Formal Offer Letter Body */}
            <div className="space-y-3 leading-relaxed text-neutral-700">
              <p className="font-bold text-neutral-900">
                Dear {candidateName},
              </p>
              <p>
                We are delighted to extend to you an official Offer of Employment for the position of{' '}
                <strong className="text-neutral-900 font-bold">{jobRole}</strong> at{' '}
                <strong className="text-neutral-900 font-bold">{companyName}</strong>. This offer is extended following your exceptional technical performance and interview evaluations conducted during the University Campus Placement Drive.
              </p>
              <p>
                Your appointment will take effect from your scheduled onboarding date of{' '}
                <strong className="text-neutral-900">{joiningDate}</strong> at our office in{' '}
                <strong className="text-neutral-900">{location}</strong>.
              </p>
            </div>

            {/* Compensation & Package Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-600" />
                Annexure A: Annual Remuneration & Compensation Breakdown
              </h4>

              <div className="border border-neutral-200 rounded-lg overflow-x-auto text-xs">
                <div className="min-w-[460px]">
                  <div className="bg-neutral-100 font-bold text-neutral-800 px-3 py-2 grid grid-cols-3 border-b border-neutral-200">
                  <span>Component</span>
                  <span className="text-center">Monthly Equivalent</span>
                  <span className="text-right">Annual Valuation (INR)</span>
                </div>
                <div className="px-3 py-2 grid grid-cols-3 border-b border-neutral-100 text-neutral-700">
                  <span>Base Fixed Salary (Basic + HRA + Allowances)</span>
                  <span className="text-center font-mono text-neutral-600">₹{Math.round((baseSalary * 100000) / 12).toLocaleString('en-IN')}</span>
                  <span className="text-right font-mono font-bold text-neutral-900">₹{baseSalary.toFixed(2)} LPA</span>
                </div>
                <div className="px-3 py-2 grid grid-cols-3 border-b border-neutral-100 text-neutral-700">
                  <span>Performance Incentive & Joining Bonus</span>
                  <span className="text-center font-mono text-neutral-600">Annual / Milestones</span>
                  <span className="text-right font-mono font-bold text-neutral-900">₹{bonus.toFixed(2)} LPA</span>
                </div>
                <div className="px-3 py-2 grid grid-cols-3 border-b border-neutral-100 text-neutral-700">
                  <span>Comprehensive Medical & Health Benefits</span>
                  <span className="text-center text-neutral-600">₹5,00,000 Group Cover</span>
                  <span className="text-right font-bold text-emerald-700">Company Sponsored</span>
                </div>
                <div className="px-3 py-2.5 bg-neutral-50 grid grid-cols-3 font-bold text-neutral-900 text-xs sm:text-sm">
                  <span>Total Cost to Company (CTC)</span>
                  <span className="text-center font-mono text-emerald-600 font-bold">100% Guaranteed</span>
                  <span className="text-right font-mono text-emerald-700 font-black">₹{packageLpa.toFixed(2)} LPA</span>
                </div>
              </div>
            </div>
            </div>

            {/* Terms of Employment */}
            <div className="space-y-1.5 text-2xs sm:text-xs text-neutral-600 bg-neutral-50/70 p-3.5 rounded-lg border border-neutral-200">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-2xs">
                Key Terms & Institutional Placement Prerequisites
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Institutional Clearance:</strong> This appointment is subject to the candidate clearing all degree requirements with zero backlogs and receiving the official <strong>No Objection Certificate (NOC)</strong> from the University Training & Placement Cell.
                </li>
                <li>
                  <strong>Probation & Confirmation:</strong> You will be on probation for six (6) months from onboarding, upon which full regular confirmation will be formalized based on performance.
                </li>
                <li>
                  <strong>Acceptance:</strong> Please confirm your acceptance within 14 calendar days from date of receipt by signing this appointment order or confirming in the Rize Placement Portal.
                </li>
              </ul>
            </div>

            {/* Signatures & Verification Seal */}
            <div className="pt-6 border-t-2 border-neutral-200 grid grid-cols-3 items-end gap-3 text-center">
              {/* Authorized Corporate Signatory */}
              <div className="space-y-1">
                <div className="h-10 border-b border-neutral-300 flex items-end justify-center text-3xs font-mono text-neutral-500 italic pb-1">
                  [Digitally Authorized HR]
                </div>
                <p className="text-2xs sm:text-xs font-bold text-neutral-900">Head of Talent Acquisition</p>
                <p className="text-3xs text-neutral-500">{companyName}</p>
              </div>

              {/* Official Corporate Digital Seal */}
              <div className="flex flex-col items-center justify-center select-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-emerald-600 p-1 flex flex-col items-center justify-center text-center rotate-[-6deg] bg-emerald-50">
                  <ShieldCheck size={16} className="text-emerald-700" />
                  <span className="text-[6px] sm:text-[7px] font-black uppercase text-emerald-800 leading-tight">
                    OFFICIAL APPOINTMENT
                  </span>
                  <span className="text-[5px] sm:text-[6px] text-neutral-500 font-mono">{issueDate}</span>
                </div>
              </div>

              {/* Candidate Acceptance */}
              <div className="space-y-1">
                <div className="h-10 border-b border-neutral-300 flex items-end justify-center text-3xs font-mono text-neutral-500 italic pb-1">
                  Candidate Acceptance Sign
                </div>
                <p className="text-2xs sm:text-xs font-bold text-neutral-900">{candidateName}</p>
                <p className="text-3xs text-neutral-500">Appointee Acceptance</p>
              </div>
            </div>

            {/* University T&P Cell Endorsement footer */}
            <div className="border-t border-neutral-100 pt-3 flex flex-wrap items-center justify-between text-3xs text-neutral-400">
              <span>Verified through Rize Campus Placement & Internship Management System</span>
              <span className="font-mono">Security Reference: {refNo} · Institutional Copy</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (hidden in print) */}
        <div className="px-3 sm:px-5 py-3 border-t border-border bg-bg-elevated/70 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs text-text-muted shrink-0 no-print">
          <span className="text-3xs sm:text-2xs truncate hidden sm:inline">
            Official PDF can be printed or saved directly via browser dialog.
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Letter</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border text-text-primary hover:bg-bg-overlay font-semibold cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
