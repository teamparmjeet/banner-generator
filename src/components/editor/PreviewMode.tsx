import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ArrowLeft, Download, X, Layers, Image as ImageIcon, Sparkles } from 'lucide-react';
import { renderDesignToCanvas } from '../../lib/export';

interface PreviewModeProps {
  onOpenExportModal: () => void;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({ onOpenExportModal }) => {
  const design = useEditorStore((state) => state.design);
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);

  const [previewTab, setPreviewTab] = useState<'live' | 'canvas'>('live');
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [isRenderingCanvas, setIsRenderingCanvas] = useState(false);
  const [fitScale, setFitScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPreviewMode]);

  // Calculate responsive fit scale
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const padding = 64;
      const availW = Math.max(clientWidth - padding, 200);
      const availH = Math.max(clientHeight - padding, 200);

      const scaleX = availW / design.width;
      const scaleY = availH / design.height;
      const calculatedScale = Math.min(scaleX, scaleY, 1.2);
      setFitScale(calculatedScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [design.width, design.height]);

  // Render canvas snapshot for the "canvas" view tab
  useEffect(() => {
    if (previewTab === 'canvas') {
      setIsRenderingCanvas(true);
      renderDesignToCanvas(design, { scaleMultiplier: 2 })
        .then((canvas) => {
          setCanvasUrl(canvas.toDataURL('image/png'));
        })
        .catch((err) => {
          console.warn('Preview canvas render error:', err);
        })
        .finally(() => {
          setIsRenderingCanvas(false);
        });
    }
  }, [previewTab, design]);

  // Canvas background styling helper
  const getCanvasBackgroundStyle = () => {
    const bg = design.background;
    if (bg.type === 'transparent') {
      return {
        backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        backgroundColor: '#ffffff',
      };
    }
    if (bg.type === 'solid') {
      return { backgroundColor: bg.color || '#FFFFFF' };
    }
    if (bg.type === 'gradient' && bg.gradient) {
      const stopsStr = bg.gradient.stops
        .map((s) => `${s.color} ${Math.round(s.offset * 100)}%`)
        .join(', ');
      return {
        backgroundImage: `linear-gradient(${bg.gradient.angle || 0}deg, ${stopsStr})`,
      };
    }
    if (bg.type === 'image' && bg.imageSrc) {
      return {
        backgroundImage: `url(${bg.imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: '#FFFFFF' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col select-none animate-in fade-in duration-200">
      {/* Top Floating Control Bar */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Preview</span>
          </button>

          <div className="h-4 w-px bg-neutral-800 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-200">{design.name}</span>
            <span className="text-[11px] text-neutral-400 font-mono bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700">
              {design.width} × {design.height} px
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              Scale: {Math.round(fitScale * 100)}%
            </span>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-neutral-800 p-1 rounded-lg border border-neutral-700 text-xs font-medium">
          <button
            type="button"
            onClick={() => setPreviewTab('live')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              previewTab === 'live'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Interactive</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              previewTab === 'canvas'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Retina Render</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Banner</span>
            <span className="sm:hidden">Export</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Centered Preview Canvas Presentation */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-8 bg-neutral-950 relative"
      >
        {previewTab === 'canvas' ? (
          <div className="flex flex-col items-center justify-center">
            {isRenderingCanvas ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400 py-12">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Generating Retina Canvas Preview...</span>
              </div>
            ) : canvasUrl ? (
              <div
                style={{
                  width: design.width * fitScale,
                  height: design.height * fitScale,
                }}
                className="relative shadow-2xl rounded-xs overflow-hidden border border-neutral-800"
              >
                <img
                  src={canvasUrl}
                  alt={design.name}
                  className="w-full h-full object-contain block"
                />
              </div>
            ) : null}
          </div>
        ) : (
          /* Live Interactive Scaled Container */
          <div
            style={{
              width: design.width * fitScale,
              height: design.height * fitScale,
              position: 'relative',
            }}
            className="shadow-2xl rounded-xs overflow-hidden transition-all duration-150"
          >
            <div
              style={{
                width: design.width,
                height: design.height,
                transform: `scale(${fitScale})`,
                transformOrigin: 'top left',
                ...getCanvasBackgroundStyle(),
              }}
              className="relative shadow-2xl overflow-hidden"
            >
              {/* Render Elements in exact zIndex order */}
              {[...design.elements]
                .filter((el) => el.visible !== false)
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((el) => {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                        transformOrigin: 'center center',
                        opacity: el.opacity ?? 1,
                        zIndex: el.zIndex,
                      }}
                    >
                      {/* Image Element */}
                      {el.type === 'image' && (
                        <img
                          src={el.src}
                          alt={el.name}
                          draggable={false}
                          className="w-full h-full select-none block pointer-events-none"
                          style={{
                            objectFit: el.objectFit || 'cover',
                            borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                            border:
                              el.borderWidth && el.borderWidth > 0
                                ? `${el.borderWidth}px solid ${el.borderColor || '#000000'}`
                                : undefined,
                            boxShadow:
                              el.shadow && el.shadow.enabled
                                ? `${el.shadow.offsetX}px ${el.shadow.offsetY}px ${el.shadow.blur}px ${el.shadow.color}`
                                : undefined,
                            filter: el.filters
                              ? `brightness(${el.filters.brightness}%) contrast(${el.filters.contrast}%) saturate(${el.filters.saturation}%) blur(${el.filters.blur}px) grayscale(${el.filters.grayscale}%) sepia(${el.filters.sepia}%) invert(${el.filters.invert}%)`
                              : undefined,
                          }}
                        />
                      )}

                      {/* Text Element */}
                      {el.type === 'text' && (
                        <div
                          className="w-full h-full relative"
                          style={{
                            backgroundColor: el.backgroundColor,
                            padding: el.backgroundPadding ? `${el.backgroundPadding}px` : undefined,
                            borderRadius: el.backgroundRadius ? `${el.backgroundRadius}px` : undefined,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: el.fontFamily,
                              fontSize: `${el.fontSize}px`,
                              fontWeight: el.fontWeight,
                              fontStyle: el.fontStyle,
                              textDecoration: el.textDecoration,
                              textTransform: el.textTransform,
                              textAlign: el.textAlign,
                              color: el.color,
                              lineHeight: el.lineHeight || 1.2,
                              letterSpacing: `${el.letterSpacing || 0}px`,
                              textShadow:
                                el.shadow && el.shadow.enabled
                                  ? `${el.shadow.offsetX}px ${el.shadow.offsetY}px ${el.shadow.blur}px ${el.shadow.color}`
                                  : undefined,
                              WebkitTextStroke:
                                el.strokeWidth && el.strokeWidth > 0
                                  ? `${el.strokeWidth}px ${el.strokeColor || '#000000'}`
                                  : undefined,
                            }}
                            className="w-full h-full whitespace-pre-wrap select-none break-words"
                          >
                            {el.text}
                          </div>
                        </div>
                      )}

                      {/* Shape Element */}
                      {el.type === 'shape' && (
                        <svg
                          viewBox={`0 0 ${el.width} ${el.height}`}
                          className="w-full h-full overflow-visible pointer-events-none"
                          style={{
                            filter:
                              el.shadow && el.shadow.enabled
                                ? `drop-shadow(${el.shadow.offsetX}px ${el.shadow.offsetY}px ${el.shadow.blur}px ${el.shadow.color})`
                                : undefined,
                          }}
                        >
                          {el.shapeType === 'rectangle' && (
                            <rect
                              x={0}
                              y={0}
                              width={el.width}
                              height={el.height}
                              fill={el.fillColor}
                              stroke={el.borderColor}
                              strokeWidth={el.borderWidth || 0}
                            />
                          )}
                          {el.shapeType === 'rounded-rectangle' && (
                            <rect
                              x={0}
                              y={0}
                              width={el.width}
                              height={el.height}
                              rx={el.borderRadius || 16}
                              fill={el.fillColor}
                              stroke={el.borderColor}
                              strokeWidth={el.borderWidth || 0}
                            />
                          )}
                          {el.shapeType === 'circle' && (
                            <ellipse
                              cx={el.width / 2}
                              cy={el.height / 2}
                              rx={el.width / 2}
                              ry={el.height / 2}
                              fill={el.fillColor}
                              stroke={el.borderColor}
                              strokeWidth={el.borderWidth || 0}
                            />
                          )}
                          {el.shapeType === 'triangle' && (
                            <polygon
                              points={`${el.width / 2},0 ${el.width},${el.height} 0,${el.height}`}
                              fill={el.fillColor}
                              stroke={el.borderColor}
                              strokeWidth={el.borderWidth || 0}
                            />
                          )}
                          {el.shapeType === 'line' && (
                            <line
                              x1={0}
                              y1={el.height / 2}
                              x2={el.width}
                              y2={el.height / 2}
                              stroke={el.fillColor || el.borderColor}
                              strokeWidth={Math.max(el.borderWidth || 2, 2)}
                            />
                          )}
                          {el.shapeType === 'arrow' && (
                            <polygon
                              points={`0,${el.height * 0.3} ${el.width * 0.6},${el.height * 0.3} ${el.width * 0.6},0 ${el.width},${el.height / 2} ${el.width * 0.6},${el.height} ${el.width * 0.6},${el.height * 0.7} 0,${el.height * 0.7}`}
                              fill={el.fillColor}
                              stroke={el.borderColor}
                              strokeWidth={el.borderWidth || 0}
                            />
                          )}
                        </svg>
                      )}

                      {/* Button Element */}
                      {el.type === 'button' && (
                        <div
                          style={{
                            backgroundColor: el.backgroundColor,
                            borderRadius: `${el.borderRadius ?? 8}px`,
                            border:
                              el.borderWidth && el.borderWidth > 0
                                ? `${el.borderWidth}px solid ${el.borderColor || '#FFFFFF'}`
                                : undefined,
                            boxShadow:
                              el.shadow && el.shadow.enabled
                                ? `${el.shadow.offsetX}px ${el.shadow.offsetY}px ${el.shadow.blur}px ${el.shadow.color}`
                                : undefined,
                          }}
                          className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => {
                            if (el.linkUrl) {
                              window.open(el.linkUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          title={el.linkUrl ? `Click to open: ${el.linkUrl}` : undefined}
                        >
                          <span
                            style={{
                              color: el.textColor,
                              fontFamily: el.fontFamily,
                              fontSize: `${el.fontSize}px`,
                              fontWeight: el.fontWeight,
                            }}
                            className="select-none tracking-wide truncate px-2"
                          >
                            {el.text}
                          </span>
                        </div>
                      )}

                      {/* Overlay Element */}
                      {el.type === 'overlay' && (
                        <div
                          className="w-full h-full pointer-events-none"
                          style={{
                            background:
                              el.overlayType === 'black'
                                ? 'rgba(0,0,0,0.7)'
                                : el.overlayType === 'white'
                                ? 'rgba(255,255,255,0.7)'
                                : el.overlayType === 'linear-gradient-lr'
                                ? `linear-gradient(to right, ${el.color1 || 'rgba(0,0,0,0.9)'}, ${el.color2 || 'rgba(0,0,0,0)'})`
                                : `linear-gradient(to bottom, ${el.color1 || 'rgba(0,0,0,0.9)'}, ${el.color2 || 'rgba(0,0,0,0)'})`,
                          }}
                        />
                      )}

                      {/* Badge Element */}
                      {el.type === 'badge' && (
                        <div
                          style={{
                            backgroundColor: el.backgroundColor,
                            color: el.textColor,
                            fontFamily: el.fontFamily,
                            fontSize: `${el.fontSize}px`,
                            fontWeight: el.fontWeight,
                            borderRadius: el.badgeStyle === 'pill' ? '9999px' : '6px',
                          }}
                          className="w-full h-full flex items-center justify-center shadow-xs select-none px-2"
                        >
                          {el.text}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Footer bar with quick hint */}
      <div className="h-9 px-6 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            {design.elements.length} active layers
          </span>
          <span>•</span>
          <span>Target: {design.width} × {design.height} px</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Press <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-mono text-[10px]">ESC</kbd> to return to editor</span>
        </div>
      </div>
    </div>
  );
};
