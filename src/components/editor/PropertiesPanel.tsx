import React, { useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { FontPicker } from './FontPicker';
import { ColorPicker } from './ColorPicker';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Bold,
  Italic,
  Underline,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Sliders,
  Sparkles,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  RotateCw,
} from 'lucide-react';

interface PropertiesPanelProps {
  onOpenSizeModal: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ onOpenSizeModal }) => {
  const design = useEditorStore((state) => state.design);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const updateElement = useEditorStore((state) => state.updateElement);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const duplicateElement = useEditorStore((state) => state.duplicateElement);
  const toggleLock = useEditorStore((state) => state.toggleElementLock);
  const alignElement = useEditorStore((state) => state.alignElement);
  const setBackground = useEditorStore((state) => state.setBackground);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedElement = design.elements.find((el) => el.id === selectedElementId);

  // If nothing is selected, display Canvas Properties
  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-neutral-200 h-full p-4 overflow-y-auto space-y-5 select-none">
        <div>
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Canvas Properties
          </h3>
          <p className="text-xs text-neutral-600 font-semibold mt-0.5">{design.name}</p>
        </div>

        {/* Canvas Dimensions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-600">Size Presets</span>
            <button
              type="button"
              onClick={onOpenSizeModal}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              Change Size
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-[10px] text-neutral-400 block font-semibold">WIDTH</span>
              <span className="font-mono font-bold text-neutral-800">{design.width} px</span>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-[10px] text-neutral-400 block font-semibold">HEIGHT</span>
              <span className="font-mono font-bold text-neutral-800">{design.height} px</span>
            </div>
          </div>
        </div>

        {/* Canvas Background */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <span className="text-xs font-semibold text-neutral-700 block">Backdrop Color</span>
          <ColorPicker
            value={design.background.color || '#FFFFFF'}
            onChange={(color) => setBackground({ type: 'solid', color })}
            showGradients={true}
            onGradientSelect={(grad) =>
              setBackground({
                type: 'gradient',
                color: grad.stops[0].color,
                gradient: { enabled: true, type: 'linear', angle: grad.angle, stops: grad.stops },
              })
            }
          />
        </div>

        <div className="pt-2 border-t border-neutral-100">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            💡 <strong className="text-neutral-700">Quick Tip:</strong> Click any element on the canvas to inspect its fonts, colors, and filters, or double-click text to edit inline.
          </div>
        </div>
      </div>
    );
  }

  // Handle image replacement
  const handleReplaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      updateElement(selectedElement.id, { src });
    };
    reader.readAsDataURL(file);
  };

  // Fit / Fill Canvas helpers
  const handleFitToCanvas = () => {
    const scale = Math.min(design.width / selectedElement.width, design.height / selectedElement.height);
    const newW = Math.round(selectedElement.width * scale);
    const newH = Math.round(selectedElement.height * scale);
    updateElement(selectedElement.id, {
      x: Math.round((design.width - newW) / 2),
      y: Math.round((design.height - newH) / 2),
      width: newW,
      height: newH,
    });
  };

  const handleFillCanvas = () => {
    updateElement(selectedElement.id, {
      x: 0,
      y: 0,
      width: design.width,
      height: design.height,
    });
  };

  return (
    <div className="w-72 bg-white border-l border-neutral-200 h-full p-4 overflow-y-auto space-y-4 select-none">
      {/* Top element header with Quick Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <input
          type="text"
          value={selectedElement.name}
          onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
          className="text-xs font-bold text-neutral-800 bg-transparent hover:bg-neutral-50 focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-neutral-200 truncate focus:outline-none w-36"
        />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => duplicateElement(selectedElement.id)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => toggleLock(selectedElement.id)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            title={selectedElement.locked ? 'Unlock Element' : 'Lock Element'}
          >
            {selectedElement.locked ? (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => deleteElement(selectedElement.id)}
            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alignment Bar */}
      <div>
        <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
          Align on Canvas
        </label>
        <div className="grid grid-cols-6 gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => alignElement(selectedElement.id, 'left')}
            className="p-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900 rounded-lg transition-all flex items-center justify-center cursor-pointer"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignElement(selectedElement.id, 'center')}
            className="p-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900 rounded-lg transition-all flex items-center justify-center cursor-pointer"
            title="Align Center Horizontal"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignElement(selectedElement.id, 'right')}
            className="p-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900 rounded-lg transition-all flex items-center justify-center cursor-pointer"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignElement(selectedElement.id, 'top')}
            className="p-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900 rounded-lg transition-all flex items-center justify-center cursor-pointer"
            title="Align Top"
          >
            <AlignVerticalJustifyStart className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignElement(selectedElement.id, 'middle')}
            className="p-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900 rounded-lg transition-all flex items-center justify-center cursor-pointer"
            title="Align Center Vertical"
          >
            <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignElement(selectedElement.id, 'bottom')}
            className="p-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900 rounded-lg transition-all flex items-center justify-center cursor-pointer"
            title="Align Bottom"
          >
            <AlignVerticalJustifyEnd className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Geometry: X, Y, W, H, Rotation, Opacity */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Geometry & Opacity
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1.5 rounded-lg border border-neutral-200">
            <span className="text-[10px] text-neutral-400 font-mono">W</span>
            <input
              type="number"
              value={selectedElement.width}
              onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 20 })}
              className="w-full bg-transparent font-mono text-neutral-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1.5 rounded-lg border border-neutral-200">
            <span className="text-[10px] text-neutral-400 font-mono">H</span>
            <input
              type="number"
              value={selectedElement.height}
              onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 20 })}
              className="w-full bg-transparent font-mono text-neutral-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1.5 rounded-lg border border-neutral-200">
            <span className="text-[10px] text-neutral-400 font-mono">X</span>
            <input
              type="number"
              value={selectedElement.x}
              onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
              className="w-full bg-transparent font-mono text-neutral-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1.5 rounded-lg border border-neutral-200">
            <span className="text-[10px] text-neutral-400 font-mono">Y</span>
            <input
              type="number"
              value={selectedElement.y}
              onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
              className="w-full bg-transparent font-mono text-neutral-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Rotation & Opacity Sliders */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <div className="flex items-center justify-between text-[11px] text-neutral-600 mb-1">
              <span>Rotation</span>
              <span className="font-mono">{selectedElement.rotation || 0}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedElement.rotation || 0}
              onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] text-neutral-600 mb-1">
              <span>Opacity</span>
              <span className="font-mono">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={selectedElement.opacity ?? 1}
              onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* --- SPECIFIC FOR TEXT --- */}
      {selectedElement.type === 'text' && (
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Typography Options
          </label>

          <FontPicker
            currentFont={selectedElement.fontFamily}
            onSelectFont={(font) => updateElement(selectedElement.id, { fontFamily: font })}
          />

          {/* Size and Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Font Size</label>
              <input
                type="number"
                min="8"
                max="300"
                value={selectedElement.fontSize}
                onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 12 })}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Font Weight</label>
              <select
                value={selectedElement.fontWeight}
                onChange={(e) => updateElement(selectedElement.id, { fontWeight: parseInt(e.target.value) || e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="300">Light (300)</option>
                <option value="400">Regular (400)</option>
                <option value="600">SemiBold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">ExtraBold (800)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>
          </div>

          {/* Text Style Pills: Bold, Italic, Underline, Uppercase */}
          <div className="flex gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
            <button
              type="button"
              onClick={() =>
                updateElement(selectedElement.id, {
                  fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                selectedElement.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'text-neutral-700 hover:bg-neutral-200'
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                updateElement(selectedElement.id, {
                  textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                selectedElement.textDecoration === 'underline' ? 'bg-indigo-600 text-white' : 'text-neutral-700 hover:bg-neutral-200'
              }`}
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                updateElement(selectedElement.id, {
                  textTransform: selectedElement.textTransform === 'uppercase' ? 'none' : 'uppercase',
                })
              }
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                selectedElement.textTransform === 'uppercase' ? 'bg-indigo-600 text-white' : 'text-neutral-700 hover:bg-neutral-200'
              }`}
              title="Uppercase"
            >
              AA
            </button>
          </div>

          {/* Alignment */}
          <div className="grid grid-cols-3 gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                className={`py-1.5 rounded-lg text-xs font-medium capitalize flex items-center justify-center cursor-pointer ${
                  selectedElement.textAlign === align ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {align}
              </button>
            ))}
          </div>

          <ColorPicker
            label="Text Color"
            value={selectedElement.color || '#000000'}
            onChange={(color) => updateElement(selectedElement.id, { color })}
          />

          {/* Spacing & Line Height */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Letter Spacing</label>
              <input
                type="number"
                min="-5"
                max="25"
                value={selectedElement.letterSpacing || 0}
                onChange={(e) => updateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Line Height</label>
              <input
                type="number"
                step="0.1"
                min="0.8"
                max="3"
                value={selectedElement.lineHeight || 1.2}
                onChange={(e) => updateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) || 1.2 })}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Text Shadow */}
          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">Drop Shadow</span>
              <input
                type="checkbox"
                checked={selectedElement.shadow?.enabled || false}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    shadow: {
                      enabled: e.target.checked,
                      color: selectedElement.shadow?.color || 'rgba(0,0,0,0.5)',
                      blur: selectedElement.shadow?.blur || 10,
                      offsetX: 0,
                      offsetY: 4,
                    },
                  })
                }
                className="rounded text-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- SPECIFIC FOR IMAGE --- */}
      {selectedElement.type === 'image' && (
        <div className="space-y-4 pt-3 border-t border-neutral-100">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Image Controls
          </label>

          {/* Fit & Fill Buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleFitToCanvas}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-700 font-semibold transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Fit to Canvas
            </button>
            <button
              type="button"
              onClick={handleFillCanvas}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-700 font-semibold transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Fill Canvas
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Replace Image File...
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleReplaceImage}
              className="sr-only"
            />
          </div>

          {/* Corner Radius & Border */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>Corner Radius</span>
              <span className="font-mono">{selectedElement.borderRadius || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              value={selectedElement.borderRadius || 0}
              onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Image Filters Section */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Image Filters</span>
              <button
                type="button"
                onClick={() =>
                  updateElement(selectedElement.id, {
                    filters: {
                      brightness: 100,
                      contrast: 100,
                      saturation: 100,
                      blur: 0,
                      grayscale: 0,
                      sepia: 0,
                      invert: 0,
                    },
                  })
                }
                className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-600 mb-1">
                <span>Brightness</span>
                <span className="font-mono">{selectedElement.filters?.brightness || 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={selectedElement.filters?.brightness || 100}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    filters: { ...selectedElement.filters, brightness: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-600 mb-1">
                <span>Contrast</span>
                <span className="font-mono">{selectedElement.filters?.contrast || 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={selectedElement.filters?.contrast || 100}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    filters: { ...selectedElement.filters, contrast: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-600 mb-1">
                <span>Saturation</span>
                <span className="font-mono">{selectedElement.filters?.saturation || 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={selectedElement.filters?.saturation || 100}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    filters: { ...selectedElement.filters, saturation: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-600 mb-1">
                <span>Blur</span>
                <span className="font-mono">{selectedElement.filters?.blur || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={selectedElement.filters?.blur || 0}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    filters: { ...selectedElement.filters, blur: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Grayscale */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-600 mb-1">
                <span>Grayscale</span>
                <span className="font-mono">{selectedElement.filters?.grayscale || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedElement.filters?.grayscale || 0}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    filters: { ...selectedElement.filters, grayscale: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- SPECIFIC FOR SHAPE --- */}
      {selectedElement.type === 'shape' && (
        <div className="space-y-4 pt-3 border-t border-neutral-100">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Shape Options
          </label>

          <ColorPicker
            label="Fill Color"
            value={selectedElement.fillColor}
            onChange={(color) => updateElement(selectedElement.id, { fillColor: color })}
          />

          <ColorPicker
            label="Border Color"
            value={selectedElement.borderColor || '#000000'}
            onChange={(color) => updateElement(selectedElement.id, { borderColor: color })}
          />

          <div>
            <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
              <span>Border Width</span>
              <span className="font-mono">{selectedElement.borderWidth || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={selectedElement.borderWidth || 0}
              onChange={(e) => updateElement(selectedElement.id, { borderWidth: parseInt(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {selectedElement.shapeType === 'rounded-rectangle' && (
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                <span>Corner Radius</span>
                <span className="font-mono">{selectedElement.borderRadius || 16}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedElement.borderRadius || 16}
                onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* --- SPECIFIC FOR BUTTON --- */}
      {selectedElement.type === 'button' && (
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Button Properties
          </label>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Button Text</label>
            <input
              type="text"
              value={selectedElement.text}
              onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
            />
          </div>

          <ColorPicker
            label="Background Color"
            value={selectedElement.backgroundColor}
            onChange={(color) => updateElement(selectedElement.id, { backgroundColor: color })}
          />

          <ColorPicker
            label="Text Color"
            value={selectedElement.textColor}
            onChange={(color) => updateElement(selectedElement.id, { textColor: color })}
          />

          <div>
            <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
              <span>Border Radius</span>
              <span className="font-mono">{selectedElement.borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={selectedElement.borderRadius}
              onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Optional Link / Clickable URL for any element */}
      <div className="pt-3 border-t border-neutral-100 space-y-1.5">
        <label className="block text-xs font-bold text-neutral-700 flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
          Clickable Link URL
        </label>
        <input
          type="url"
          placeholder="https://example.com/promo"
          value={selectedElement.url || ''}
          onChange={(e) => updateElement(selectedElement.id, { url: e.target.value })}
          className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
        />
        <p className="text-[10px] text-neutral-400">
          Target link saved into design JSON and Clickable HTML Banner export.
        </p>
      </div>
    </div>
  );
};
