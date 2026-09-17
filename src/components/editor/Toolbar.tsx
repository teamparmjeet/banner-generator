import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Magnet,
  Eye,
  Download,
  Save,
  Trash2,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  Layers,
  ArrowLeft,
} from 'lucide-react';

interface ToolbarProps {
  onOpenSizeModal: () => void;
  onOpenExportModal: () => void;
  onNavigateHome: () => void;
  isInspectorOpen?: boolean;
  onToggleInspector?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpenSizeModal,
  onOpenExportModal,
  onNavigateHome,
  isInspectorOpen = true,
  onToggleInspector,
}) => {
  const design = useEditorStore((state) => state.design);
  const setDesignName = useEditorStore((state) => state.setDesignName);
  const zoom = useEditorStore((state) => state.zoom);
  const setZoom = useEditorStore((state) => state.setZoom);
  const showGrid = useEditorStore((state) => state.showGrid);
  const toggleGrid = useEditorStore((state) => state.toggleGrid);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const toggleSnapToGrid = useEditorStore((state) => state.toggleSnapToGrid);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const historyIndex = useEditorStore((state) => state.historyIndex);
  const history = useEditorStore((state) => state.history);
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);
  const clearDesign = useEditorStore((state) => state.clearDesign);
  const saveToLocalStorage = useEditorStore((state) => state.saveToLocalStorage);

  const [savedPing, setSavedPing] = useState(false);
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);

  const handleManualSave = () => {
    saveToLocalStorage();
    setSavedPing(true);
    setTimeout(() => setSavedPing(false), 2000);
  };

  const handleClearWithConfirm = () => {
    if (window.confirm('Are you sure you want to clear the canvas? All elements will be removed.')) {
      clearDesign();
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <header className="h-14 bg-white border-b border-neutral-200 px-4 flex items-center justify-between z-30 select-none">
      {/* Left side: Brand Logo + Banner Title + Dimensions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
          title="Back to Templates & Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
            BC
          </div>
          <span className="font-extrabold text-sm tracking-tight text-neutral-900 hidden sm:inline">
            BannerCraft
          </span>
        </button>

        <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

        {/* Editable Name */}
        <input
          type="text"
          value={design.name}
          onChange={(e) => setDesignName(e.target.value)}
          className="text-xs font-semibold text-neutral-800 hover:bg-neutral-50 focus:bg-white px-2 py-1 rounded border border-transparent focus:border-neutral-300 focus:outline-none max-w-44 sm:max-w-56 truncate"
          title="Click to rename design"
        />

        {/* Size Badge */}
        <button
          type="button"
          onClick={onOpenSizeModal}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg text-xs font-medium text-neutral-700 transition-colors cursor-pointer"
          title="Change Banner Canvas Size"
        >
          <span className="font-mono text-[11px] font-semibold text-indigo-700">
            {design.width} × {design.height} px
          </span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </button>
      </div>

      {/* Middle Controls: Undo, Redo, Zoom, Grid, Snap */}
      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <button
          type="button"
          disabled={!canUndo}
          onClick={undo}
          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={redo}
          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-neutral-200 mx-1 hidden sm:block" />

        {/* Zoom controls */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setZoomDropdownOpen(!zoomDropdownOpen)}
            className="px-2 py-1 text-xs font-mono font-semibold text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {zoomDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setZoomDropdownOpen(false)} />
              <div className="absolute top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-50 w-32 text-xs">
                {[0.25, 0.5, 0.75, 1, 1.5, 2].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => {
                      setZoom(z);
                      setZoomDropdownOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 font-mono"
                  >
                    {Math.round(z * 100)}%
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-neutral-200 mx-1 hidden sm:block" />

        {/* Grid & Magnet Snap */}
        <button
          type="button"
          onClick={toggleGrid}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer hidden md:flex ${
            showGrid ? 'bg-indigo-50 text-indigo-600' : 'text-neutral-500 hover:bg-neutral-100'
          }`}
          title="Toggle Canvas Grid"
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleSnapToGrid}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer hidden md:flex ${
            snapToGrid ? 'bg-indigo-50 text-indigo-600' : 'text-neutral-500 hover:bg-neutral-100'
          }`}
          title="Toggle Snap to Grid"
        >
          <Magnet className="w-4 h-4" />
        </button>
      </div>

      {/* Right side: Preview, Autosaved, Download */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClearWithConfirm}
          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer hidden lg:flex"
          title="Clear Entire Canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleManualSave}
          className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer relative"
          title="Save Design"
        >
          <Save className="w-4 h-4" />
          {savedPing && (
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
              Saved!
            </span>
          )}
        </button>

        {onToggleInspector && (
          <button
            type="button"
            onClick={onToggleInspector}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isInspectorOpen
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80'
            }`}
            title={isInspectorOpen ? 'Hide Right Inspector Panel' : 'Show Right Inspector Panel'}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Inspector</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setPreviewMode(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4 text-neutral-500" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <button
          type="button"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </header>
  );
};
