import React, { useState, useEffect, useCallback } from 'react';
import { useEditorStore } from './store/editorStore';
import { Toolbar } from './components/editor/Toolbar';
import { LeftSidebar } from './components/editor/LeftSidebar';
import { CanvasEditor } from './components/editor/CanvasEditor';
import { PropertiesPanel } from './components/editor/PropertiesPanel';
import { SizePickerModal } from './components/editor/SizePickerModal';
import { ExportModal } from './components/editor/ExportModal';
import { PreviewMode } from './components/editor/PreviewMode';
import { HomeDashboard } from './components/home/HomeDashboard';
import {
  SlidersHorizontal,
  Layers,
  Sparkles,
  Maximize2,
  X,
  ChevronRight,
  Eye,
  ArrowLeft,
} from 'lucide-react';

export default function App() {
  const currentView = useEditorStore((state) => state.currentView);
  const setCurrentView = useEditorStore((state) => state.setCurrentView);
  const previewMode = useEditorStore((state) => state.previewMode);
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const selectElement = useEditorStore((state) => state.selectElement);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const duplicateElement = useEditorStore((state) => state.duplicateElement);
  const updateElement = useEditorStore((state) => state.updateElement);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const design = useEditorStore((state) => state.design);
  const setDimensions = useEditorStore((state) => state.setDimensions);
  const setDesignName = useEditorStore((state) => state.setDesignName);
  const clearDesign = useEditorStore((state) => state.clearDesign);

  // Modals state
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // Auto-open inspector whenever an element is selected
  useEffect(() => {
    if (selectedElementId) {
      setIsInspectorOpen(true);
    }
  }, [selectedElementId]);

  // Mobile drawer states
  const [mobileTab, setMobileTab] = useState<'tools' | 'properties' | null>(null);

  // Global Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Duplicate: Ctrl+D / Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedElementId) {
          e.preventDefault();
          duplicateElement(selectedElementId);
        }
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
        return;
      }

      // Escape: Deselect or exit preview
      if (e.key === 'Escape') {
        if (previewMode) {
          setPreviewMode(false);
        } else if (selectedElementId) {
          selectElement(null);
        }
        return;
      }

      // Arrow Keys: Nudge element position
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElementId) {
          e.preventDefault();
          const el = design.elements.find((item) => item.id === selectedElementId);
          if (el && !el.locked) {
            const step = e.shiftKey ? 10 : 1;
            let dx = 0;
            let dy = 0;
            if (e.key === 'ArrowUp') dy = -step;
            if (e.key === 'ArrowDown') dy = step;
            if (e.key === 'ArrowLeft') dx = -step;
            if (e.key === 'ArrowRight') dx = step;

            updateElement(selectedElementId, {
              x: el.x + dx,
              y: el.y + dy,
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElementId,
    previewMode,
    undo,
    redo,
    duplicateElement,
    deleteElement,
    selectElement,
    setPreviewMode,
    design.elements,
    updateElement,
  ]);

  const handleStartFromScratch = () => {
    clearDesign();
    setDimensions(1200, 630);
    setDesignName('New Social Banner');
    setCurrentView('editor');
  };

  return (
    <div
      className={`flex flex-col w-screen bg-neutral-100 font-sans text-neutral-900 antialiased ${
        currentView === 'home'
          ? 'min-h-screen h-auto overflow-y-auto overflow-x-hidden'
          : 'h-screen overflow-hidden'
      }`}
    >
      {currentView === 'home' ? (
        <HomeDashboard
          onStartScratch={handleStartFromScratch}
          onOpenSizeModal={() => setIsSizeModalOpen(true)}
          onOpenEditor={() => setCurrentView('editor')}
        />
      ) : (
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Top Application Toolbar */}
          <Toolbar
            onOpenSizeModal={() => setIsSizeModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onNavigateHome={() => setCurrentView('home')}
            isInspectorOpen={isInspectorOpen}
            onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
          />

          {/* Main 3-Column Studio Workspace */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Sidebar: Tools, Templates, Uploads, Text, Shapes, Layers */}
            <div className="hidden md:flex h-full shrink-0">
              <LeftSidebar />
            </div>

            {/* Central Canvas Viewport */}
            <div className="flex-1 h-full relative overflow-hidden flex flex-col">
              <CanvasEditor />
            </div>

            {/* Right Contextual Properties Panel */}
            {isInspectorOpen && (
              <div className="hidden md:flex h-full shrink-0 z-20 transition-all border-l border-neutral-200">
                <PropertiesPanel onOpenSizeModal={() => setIsSizeModalOpen(true)} />
              </div>
            )}
          </div>

          {/* Mobile bottom navigation bar for small screens */}
          <div className="md:hidden h-14 bg-white border-t border-neutral-200 px-4 flex items-center justify-around z-30 shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab(mobileTab === 'tools' ? null : 'tools')}
              className={`flex flex-col items-center justify-center gap-1 text-xs cursor-pointer ${
                mobileTab === 'tools' ? 'text-indigo-600 font-bold' : 'text-neutral-500'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Tools</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab(mobileTab === 'properties' ? null : 'properties')}
              className={`flex flex-col items-center justify-center gap-1 text-xs cursor-pointer ${
                mobileTab === 'properties' ? 'text-indigo-600 font-bold' : 'text-neutral-500'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Inspector</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1 text-xs text-indigo-600 font-bold cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>

          {/* Mobile Bottom Sheets / Slide-overs */}
          {mobileTab && (
            <div className="md:hidden fixed inset-x-0 bottom-14 top-20 z-40 bg-white border-t border-neutral-200 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-neutral-50">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  {mobileTab === 'tools' ? 'Tools & Elements' : 'Properties & Alignment'}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileTab(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {mobileTab === 'tools' ? (
                  <LeftSidebar />
                ) : (
                  <PropertiesPanel onOpenSizeModal={() => setIsSizeModalOpen(true)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Presentation Preview Mode */}
      {previewMode && (
        <PreviewMode onOpenExportModal={() => setIsExportModalOpen(true)} />
      )}

      {/* Modals */}
      <SizePickerModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
