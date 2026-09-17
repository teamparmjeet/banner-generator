import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import {
  renderDesignToCanvas,
  downloadBannerImage,
  downloadClickableHtmlBanner,
} from '../../lib/export';
import {
  X,
  Download,
  FileCode,
  FileJson,
  Upload,
  CheckCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const design = useEditorStore((state) => state.design);
  const setDesign = useEditorStore((state) => state.setDesign);

  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [qualityScale, setQualityScale] = useState<number>(1);
  const [includeBackground, setIncludeBackground] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadImage = async () => {
    setExporting(true);
    setSuccessMessage(null);
    try {
      // Temporarily toggle background transparency if user requested transparent PNG
      const exportDesign = {
        ...design,
        background:
          format === 'png' && !includeBackground
            ? { ...design.background, type: 'transparent' as const }
            : design.background,
      };

      await downloadBannerImage(
        exportDesign,
        format,
        qualityScale,
        design.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'banner'
      );

      triggerConfetti();
      setSuccessMessage(`Successfully downloaded ${format.toUpperCase()}!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to generate banner image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadHtml = async () => {
    setExporting(true);
    try {
      await downloadClickableHtmlBanner(
        design,
        `${design.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'banner'}-web-banner`
      );
      triggerConfetti();
      setSuccessMessage('Successfully exported Clickable HTML Banner package!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      console.error('HTML export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(design, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${design.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'banner'}-template.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMessage('Exported Design JSON template file!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.width && parsed.height && Array.isArray(parsed.elements)) {
          setDesign(parsed);
          triggerConfetti();
          setSuccessMessage('Successfully imported design template!');
          setTimeout(() => {
            setSuccessMessage(null);
            onClose();
          }, 1500);
        } else {
          alert('Invalid design template format.');
        }
      } catch (err) {
        alert('Could not parse design file.');
      }
    };
    reader.readAsText(file);
  };

  const finalWidth = Math.round(design.width * qualityScale);
  const finalHeight = Math.round(design.height * qualityScale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Download Banner</h2>
              <p className="text-xs text-neutral-500">
                High-resolution export with exact canvas dimensions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Format selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                  format === 'png'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-bold text-sm text-neutral-900">PNG Image</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Lossless sharpness & optional transparency
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                  format === 'jpeg'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-bold text-sm text-neutral-900">JPEG Image</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Compact file size for web & social ads
                </div>
              </button>
            </div>
          </div>

          {/* Resolution Multiplier */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Export Resolution
              </label>
              <span className="text-xs font-mono text-indigo-600 font-semibold">
                {finalWidth} × {finalHeight} px
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '0.5× Fast', mult: 0.5 },
                { label: '1× Standard', mult: 1 },
                { label: '2× Retina HD', mult: 2 },
                { label: '3× Ultra 4K', mult: 3 },
              ].map((item) => (
                <button
                  key={item.mult}
                  type="button"
                  onClick={() => setQualityScale(item.mult)}
                  className={`py-2 px-2 text-center rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    qualityScale === item.mult
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transparent PNG option */}
          {format === 'png' && (
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 cursor-pointer">
              <input
                type="checkbox"
                checked={!includeBackground}
                onChange={(e) => setIncludeBackground(!e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-neutral-300 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-neutral-800">Transparent Background</span>
                <p className="text-[11px] text-neutral-400">
                  Exclude solid/canvas backdrop for floating stickers & overlays
                </p>
              </div>
            </label>
          )}

          {/* Primary Download Button */}
          <button
            type="button"
            disabled={exporting}
            onClick={handleDownloadImage}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Rendering High-Res Banner...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download {format.toUpperCase()} ({finalWidth} × {finalHeight})
              </>
            )}
          </button>

          {/* Advanced / Developer formats */}
          <div className="pt-4 border-t border-neutral-100 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Additional Formats & Templates
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handleDownloadHtml}
                disabled={exporting}
                className="flex items-center justify-center gap-1.5 p-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-700 font-medium transition-colors cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>Clickable HTML Banner</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center justify-center gap-1.5 p-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-700 font-medium transition-colors cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-amber-600" />
                <span>Export JSON Design</span>
              </button>
            </div>

            <label className="flex items-center justify-center gap-1.5 p-2 border border-dashed border-neutral-300 rounded-xl hover:bg-neutral-50 text-neutral-600 text-xs font-medium cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-neutral-400" />
              <span>Import Saved Design JSON...</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="sr-only" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
