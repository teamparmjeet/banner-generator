import React, { useState } from 'react';
import { PRESET_COLORS, GRADIENT_PRESETS } from '../../lib/constants';
import { useEditorStore } from '../../store/editorStore';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  showGradients?: boolean;
  onGradientSelect?: (preset: (typeof GRADIENT_PRESETS)[0]) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  showGradients = false,
  onGradientSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const recentColors = useEditorStore((state) => state.recentColors);
  const addRecentColor = useEditorStore((state) => state.addRecentColor);

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
    addRecentColor(newColor);
  };

  return (
    <div className="relative">
      {label && <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-lg border border-neutral-300 shadow-xs flex items-center justify-center p-0.5 transition-transform hover:scale-105 active:scale-95 bg-white cursor-pointer"
          title="Choose Color"
        >
          <span
            className="w-full h-full rounded-md shadow-inner block"
            style={{ backgroundColor: value || '#000000' }}
          />
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={value || '#000000'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-mono border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
          />
        </div>

        <label
          className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
          title="Native EyeDropper / Color Wheel"
        >
          <Pipette className="w-4 h-4" />
          <input
            type="color"
            value={value?.startsWith('#') && value.length === 7 ? value : '#3b82f6'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 w-64 space-y-3">
            <div>
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                Swatches
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      handleColorChange(c);
                      setIsOpen(false);
                    }}
                    className="w-8 h-8 rounded-md border border-neutral-200/80 transition-all hover:scale-110 active:scale-95 cursor-pointer relative"
                    style={{ backgroundColor: c }}
                  >
                    {value?.toLowerCase() === c.toLowerCase() && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white drop-shadow-sm font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {recentColors.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Recent Colors
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        handleColorChange(c);
                        setIsOpen(false);
                      }}
                      className="w-6 h-6 rounded-md border border-neutral-200 transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}

            {showGradients && onGradientSelect && (
              <div className="pt-2 border-t border-neutral-100">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Gradient Presets
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {GRADIENT_PRESETS.map((grad) => (
                    <button
                      key={grad.name}
                      type="button"
                      onClick={() => {
                        onGradientSelect(grad);
                        setIsOpen(false);
                      }}
                      className="h-7 rounded-md border border-neutral-200 transition-all hover:scale-105 cursor-pointer"
                      style={{
                        background: `linear-gradient(${grad.angle}deg, ${grad.stops[0].color}, ${grad.stops[1].color})`,
                      }}
                      title={grad.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
