import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BannerElement, AlignmentGuide } from '../../types/editor';

export const CanvasEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const design = useEditorStore((state) => state.design);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const zoom = useEditorStore((state) => state.zoom);
  const setZoom = useEditorStore((state) => state.setZoom);
  const showGrid = useEditorStore((state) => state.showGrid);
  const showRulers = useEditorStore((state) => state.showRulers);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const previewMode = useEditorStore((state) => state.previewMode);
  const alignmentGuides = useEditorStore((state) => state.alignmentGuides);

  const selectElement = useEditorStore((state) => state.selectElement);
  const updateElement = useEditorStore((state) => state.updateElement);
  const setAlignmentGuides = useEditorStore((state) => state.setAlignmentGuides);

  // Inline editing state for text
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextVal, setEditingTextVal] = useState<string>('');

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Resizing state
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    x: number;
    y: number;
    w: number;
    h: number;
  }>({ mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 });

  // Rotating state
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [rotateCenter, setRotateCenter] = useState<{ cx: number; cy: number }>({ cx: 0, cy: 0 });

  // Fit to screen on initial mount or size change
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const padding = 60;
      const scaleX = (clientWidth - padding) / design.width;
      const scaleY = (clientHeight - padding) / design.height;
      const fitZoom = Math.min(scaleX, scaleY, 1);
      setZoom(Math.max(0.15, Number(fitZoom.toFixed(2))));
    }
  }, [design.width, design.height, setZoom]);

  const selectedElement = design.elements.find((el) => el.id === selectedElementId);

  // Snapping calculations
  const calculateSnapping = useCallback(
    (targetX: number, targetY: number, width: number, height: number): { x: number; y: number; guides: AlignmentGuide[] } => {
      let x = targetX;
      let y = targetY;
      const guides: AlignmentGuide[] = [];
      const threshold = 7;

      if (snapToGrid) {
        const gridSize = 20;
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
        return { x, y, guides };
      }

      const canvasCenterX = design.width / 2;
      const canvasCenterY = design.height / 2;

      const elementCenterX = x + width / 2;
      const elementCenterY = y + height / 2;

      // Snap to canvas center X
      if (Math.abs(elementCenterX - canvasCenterX) < threshold) {
        x = canvasCenterX - width / 2;
        guides.push({ type: 'vertical', position: canvasCenterX });
      }
      // Snap to canvas center Y
      if (Math.abs(elementCenterY - canvasCenterY) < threshold) {
        y = canvasCenterY - height / 2;
        guides.push({ type: 'horizontal', position: canvasCenterY });
      }

      // Snap to left edge
      if (Math.abs(x) < threshold) {
        x = 0;
        guides.push({ type: 'vertical', position: 0 });
      }
      // Snap to right edge
      if (Math.abs(x + width - design.width) < threshold) {
        x = design.width - width;
        guides.push({ type: 'vertical', position: design.width });
      }
      // Snap to top edge
      if (Math.abs(y) < threshold) {
        y = 0;
        guides.push({ type: 'horizontal', position: 0 });
      }
      // Snap to bottom edge
      if (Math.abs(y + height - design.height) < threshold) {
        y = design.height - height;
        guides.push({ type: 'horizontal', position: design.height });
      }

      return { x, y, guides };
    },
    [design.width, design.height, snapToGrid]
  );

  // Mouse Down on an element to start moving
  const handleElementMouseDown = (e: React.MouseEvent, el: BannerElement) => {
    if (previewMode || el.locked) return;
    e.stopPropagation();

    selectElement(el.id);

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStartPos({ x: el.x, y: el.y });
  };

  // Mouse Down on a resize handle
  const handleResizeHandleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked) return;

    setResizingHandle(handle);
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: selectedElement.x,
      y: selectedElement.y,
      w: selectedElement.width,
      h: selectedElement.height,
    });
  };

  // Mouse Down on rotation handle
  const handleRotateHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.left + (selectedElement.x + selectedElement.width / 2) * zoom;
    const cy = rect.top + (selectedElement.y + selectedElement.height / 2) * zoom;

    setIsRotating(true);
    setRotateCenter({ cx, cy });
  };

  // Global mouse move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedElement && !selectedElement.locked) {
        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;

        let rawX = elementStartPos.x + dx;
        let rawY = elementStartPos.y + dy;

        const snapped = calculateSnapping(rawX, rawY, selectedElement.width, selectedElement.height);
        updateElement(selectedElement.id, { x: Math.round(snapped.x), y: Math.round(snapped.y) });
        setAlignmentGuides(snapped.guides);
      } else if (resizingHandle && selectedElement && !selectedElement.locked) {
        const dx = (e.clientX - resizeStart.mouseX) / zoom;
        const dy = (e.clientY - resizeStart.mouseY) / zoom;

        let newX = resizeStart.x;
        let newY = resizeStart.y;
        let newW = resizeStart.w;
        let newH = resizeStart.h;
        const minSize = 20;

        if (resizingHandle.includes('e')) {
          newW = Math.max(minSize, resizeStart.w + dx);
        }
        if (resizingHandle.includes('w')) {
          const possibleW = resizeStart.w - dx;
          if (possibleW >= minSize) {
            newW = possibleW;
            newX = resizeStart.x + dx;
          }
        }
        if (resizingHandle.includes('s')) {
          newH = Math.max(minSize, resizeStart.h + dy);
        }
        if (resizingHandle.includes('n')) {
          const possibleH = resizeStart.h - dy;
          if (possibleH >= minSize) {
            newH = possibleH;
            newY = resizeStart.y + dy;
          }
        }

        // If aspect ratio is locked for images/logos when dragging corner handles
        if (
          (selectedElement.type === 'image' || selectedElement.type === 'badge') &&
          ['nw', 'ne', 'se', 'sw'].includes(resizingHandle)
        ) {
          const ratio = resizeStart.w / (resizeStart.h || 1);
          newH = newW / ratio;
        }

        updateElement(selectedElement.id, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      } else if (isRotating && selectedElement) {
        const rad = Math.atan2(e.clientY - rotateCenter.cy, e.clientX - rotateCenter.cx);
        let deg = (rad * 180) / Math.PI + 90;
        if (deg < 0) deg += 360;

        // Snap to 0, 90, 180, 270 if close
        const snapThreshold = 3;
        [0, 90, 180, 270, 360].forEach((snapAngle) => {
          if (Math.abs(deg - snapAngle) < snapThreshold) {
            deg = snapAngle === 360 ? 0 : snapAngle;
          }
        });

        updateElement(selectedElement.id, { rotation: Math.round(deg) });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setAlignmentGuides([]);
      }
      if (resizingHandle) {
        setResizingHandle(null);
      }
      if (isRotating) {
        setIsRotating(false);
      }
    };

    if (isDragging || resizingHandle || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    resizingHandle,
    isRotating,
    dragStart,
    elementStartPos,
    resizeStart,
    rotateCenter,
    selectedElement,
    zoom,
    calculateSnapping,
    updateElement,
    setAlignmentGuides,
  ]);

  // Double click text to edit inline
  const handleTextDoubleClick = (e: React.MouseEvent, el: any) => {
    e.stopPropagation();
    if (previewMode || el.locked) return;
    setEditingTextId(el.id);
    setEditingTextVal(el.text);
  };

  const handleTextEditCommit = () => {
    if (editingTextId) {
      updateElement(editingTextId, { text: editingTextVal });
      setEditingTextId(null);
    }
  };

  // Background styling
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
    <div
      ref={containerRef}
      onClick={(e) => {
        // Only deselect if clicking directly on the gray workspace background
        if (e.target === containerRef.current) {
          selectElement(null);
        }
      }}
      className="relative flex-1 h-full w-full overflow-auto bg-neutral-100 flex items-center justify-center p-8 select-none"
      style={{
        backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Visual Canvas Scaled Container */}
      <div
        style={{
          width: design.width * zoom,
          height: design.height * zoom,
          position: 'relative',
        }}
      >
        <div
          ref={canvasRef}
          id="banner-canvas-surface"
          onClick={(e) => {
            // Only deselect if clicked directly on the canvas surface backdrop, not on any element
            if (e.target === canvasRef.current) {
              selectElement(null);
            }
          }}
          style={{
            width: design.width,
            height: design.height,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            ...getCanvasBackgroundStyle(),
          }}
          className="relative shadow-2xl rounded-xs overflow-hidden transition-shadow"
        >
          {/* Optional Grid Overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-40"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(99, 102, 241, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          )}

          {/* Alignment Snapping Guide Lines */}
          {alignmentGuides.map((guide, idx) =>
            guide.type === 'vertical' ? (
              <div
                key={`v-${idx}`}
                className="absolute top-0 bottom-0 pointer-events-none z-50 bg-indigo-500"
                style={{
                  left: guide.position,
                  width: '1px',
                  boxShadow: '0 0 4px #6366f1',
                }}
              />
            ) : (
              <div
                key={`h-${idx}`}
                className="absolute left-0 right-0 pointer-events-none z-50 bg-indigo-500"
                style={{
                  top: guide.position,
                  height: '1px',
                  boxShadow: '0 0 4px #6366f1',
                }}
              />
            )
          )}

          {/* Render Elements by zIndex */}
          {[...design.elements]
            .filter((el) => el.visible !== false)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => {
              const isSelected = !previewMode && el.id === selectedElementId;
              const isEditingText = editingTextId === el.id;

              return (
                <div
                  key={el.id}
                  id={`canvas-element-${el.id}`}
                  onMouseDown={(e) => handleElementMouseDown(e, el)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!previewMode) {
                      selectElement(el.id);
                    }
                  }}
                  onDoubleClick={(e) => el.type === 'text' && handleTextDoubleClick(e, el)}
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
                    cursor: previewMode ? 'default' : el.locked ? 'not-allowed' : 'move',
                  }}
                  className={`group ${isSelected ? 'ring-2 ring-indigo-600 ring-offset-1' : ''}`}
                >
                  {/* Element-specific content */}
                  {el.type === 'image' && (
                    <img
                      src={el.src}
                      alt={el.name}
                      draggable={false}
                      className="w-full h-full pointer-events-none select-none block"
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

                  {el.type === 'text' && (
                    <div
                      className="w-full h-full relative"
                      style={{
                        backgroundColor: el.backgroundColor,
                        padding: el.backgroundPadding ? `${el.backgroundPadding}px` : undefined,
                        borderRadius: el.backgroundRadius ? `${el.backgroundRadius}px` : undefined,
                      }}
                    >
                      {isEditingText ? (
                        <textarea
                          autoFocus
                          value={editingTextVal}
                          onChange={(e) => setEditingTextVal(e.target.value)}
                          onBlur={handleTextEditCommit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleTextEditCommit();
                            }
                          }}
                          style={{
                            fontFamily: el.fontFamily,
                            fontSize: `${el.fontSize}px`,
                            fontWeight: el.fontWeight,
                            fontStyle: el.fontStyle,
                            textTransform: el.textTransform,
                            textAlign: el.textAlign,
                            color: el.color,
                            lineHeight: el.lineHeight || 1.2,
                            letterSpacing: `${el.letterSpacing || 0}px`,
                          }}
                          className="w-full h-full bg-white/90 border border-indigo-500 rounded p-1 resize-none focus:outline-none"
                        />
                      ) : (
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
                      )}
                    </div>
                  )}

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
                      className="w-full h-full flex items-center justify-center transition-transform"
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

                  {/* Interactive Bounding Box & 8 Resize Handles + Rotation Handle */}
                  {isSelected && !el.locked && (
                    <>
                      {/* Rotation Handle Pin */}
                      <div
                        onMouseDown={handleRotateHandleMouseDown}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-md cursor-grab active:cursor-grabbing hover:scale-125 transition-transform z-30"
                        title="Rotate element"
                      />
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-indigo-600 pointer-events-none z-20" />

                      {/* 8 Resize Handles */}
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'nw')}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs shadow-xs cursor-nwse-resize z-30"
                      />
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'n')}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs shadow-xs cursor-ns-resize z-30"
                      />
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'ne')}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs shadow-xs cursor-nesw-resize z-30"
                      />
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'e')}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs shadow-xs cursor-ew-resize z-30"
                      />
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'se')}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs shadow-xs cursor-nwse-resize z-30"
                      />
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 's')}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs shadow-xs cursor-ns-resize z-30"
                      />
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'sw')}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs shadow-xs cursor-nesw-resize z-30"
                      />
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'w')}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs shadow-xs cursor-ew-resize z-30"
                      />
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
