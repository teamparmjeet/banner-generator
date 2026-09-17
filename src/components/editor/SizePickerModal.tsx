import React, { useState } from 'react';
import { BANNER_PRESETS } from '../../lib/constants';
import { useEditorStore } from '../../store/editorStore';
import {
  X,
  Youtube,
  Facebook,
  Instagram,
  Smartphone,
  MessageCircle,
  Monitor,
  Layout,
  Columns,
  Square,
  Linkedin,
  Twitter,
  Sliders,
  Check,
} from 'lucide-react';

interface SizePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS: Record<string, React.ElementType> = {
  Youtube,
  Facebook,
  Instagram,
  Smartphone,
  MessageCircle,
  Monitor,
  Layout,
  Columns,
  Square,
  Linkedin,
  Twitter,
};

export const SizePickerModal: React.FC<SizePickerModalProps> = ({ isOpen, onClose }) => {
  const currentDesign = useEditorStore((state) => state.design);
  const setCanvasSize = useEditorStore((state) => state.setCanvasSize);

  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customWidth, setCustomWidth] = useState<number>(currentDesign.width);
  const [customHeight, setCustomHeight] = useState<number>(currentDesign.height);

  if (!isOpen) return null;

  const handleApplyPreset = (width: number, height: number) => {
    setCanvasSize(width, height);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customWidth > 50 && customHeight > 50) {
      setCanvasSize(customWidth, customHeight);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Canvas Dimensions & Presets</h2>
            <p className="text-xs text-neutral-500">
              Current size: {currentDesign.width} × {currentDesign.height} px
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-neutral-100 px-6 bg-neutral-50/50">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Standard Presets ({BANNER_PRESETS.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Custom Size
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'presets' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BANNER_PRESETS.map((preset) => {
                const IconComponent = ICONS[preset.iconName] || Layout;
                const isCurrent =
                  currentDesign.width === preset.width && currentDesign.height === preset.height;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.width, preset.height)}
                    className={`flex items-start gap-3.5 p-3.5 text-left rounded-xl border transition-all hover:scale-[1.01] cursor-pointer ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80 bg-white'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isCurrent ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-neutral-900 truncate">
                          {preset.name}
                        </span>
                        {isCurrent && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </div>
                      <div className="text-[11px] font-mono text-indigo-600 font-medium mt-0.5">
                        {preset.width} × {preset.height} px
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleApplyCustom} className="space-y-5 max-w-md mx-auto py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="6000"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="6000"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
                <span>Aspect Ratio</span>
                <span className="font-mono font-medium text-neutral-800">
                  {(customWidth / (customHeight || 1)).toFixed(2)} : 1
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Apply Custom Size
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
