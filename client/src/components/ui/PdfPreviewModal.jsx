import { useState } from 'react';
import { X, Download, ExternalLink, FileText, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

export default function PdfPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  title = 'Resume Preview',
  candidateName = '',
}) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !pdfUrl) return null;

  const backendOrigin = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const fullUrl = pdfUrl.startsWith('http')
    ? pdfUrl
    : `${backendOrigin}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;

  const handleZoomIn = () => setZoom(z => Math.min(160, z + 15));
  const handleZoomOut = () => setZoom(z => Math.max(70, z - 15));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-bg-surface border border-border rounded-2xl w-full shadow-2xl flex flex-col overflow-hidden transition-all ${
          isFullscreen ? 'fixed inset-2 z-50' : 'max-w-4xl h-[90vh]'
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-border bg-bg-elevated/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-text-primary truncate">
                {title} {candidateName ? `— ${candidateName}` : ''}
              </h3>
              <p className="text-3xs text-text-muted truncate">
                Official PDF Document · Verified by University Portal
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-bg-surface px-2 py-1 rounded-lg border border-border text-xs text-text-muted">
              <button
                onClick={handleZoomOut}
                className="hover:text-text-primary p-0.5"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-3xs font-mono w-9 text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="hover:text-text-primary p-0.5"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {/* External Link */}
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
              title="Open in new window"
            >
              <ExternalLink size={15} />
            </a>

            {/* Download */}
            <a
              href={fullUrl}
              download
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
              title="Download PDF"
            >
              <Download size={15} />
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-bg-surface transition-colors ml-1"
              title="Close viewer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body: PDF Container */}
        <div className="flex-1 bg-neutral-900/90 relative overflow-auto flex items-center justify-center p-2 sm:p-4">
          <div
            className="w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <iframe
              src={`${fullUrl}#toolbar=0&navpanes=0`}
              title="PDF Viewer"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
