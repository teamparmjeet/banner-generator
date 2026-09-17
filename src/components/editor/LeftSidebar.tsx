import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BANNER_TEMPLATES } from '../../lib/templates';
import { SAMPLE_PHOTOS, SAMPLE_LOGOS, GRADIENT_PRESETS } from '../../lib/constants';
import { ColorPicker } from './ColorPicker';
import {
  LayoutTemplate,
  Upload,
  Type,
  Shapes,
  MousePointerClick,
  Layers,
  Sparkles,
  Palette,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  MoveRight,
  ShieldAlert,
} from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const activeTab = useEditorStore((state) => state.activeSidebarTab);
  const setActiveTab = useEditorStore((state) => state.setActiveSidebarTab);
  const design = useEditorStore((state) => state.design);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);

  const addElement = useEditorStore((state) => state.addElement);
  const setBackground = useEditorStore((state) => state.setBackground);
  const loadTemplate = useEditorStore((state) => state.loadTemplate);
  const selectElement = useEditorStore((state) => state.selectElement);
  const toggleVisibility = useEditorStore((state) => state.toggleElementVisibility);
  const toggleLock = useEditorStore((state) => state.toggleElementLock);
  const bringForward = useEditorStore((state) => state.bringForward);
  const sendBackward = useEditorStore((state) => state.sendBackward);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const duplicateElement = useEditorStore((state) => state.duplicateElement);

  // Filter states
  const [templateCategory, setTemplateCategory] = useState<string>('All');
  const [isDragOverUpload, setIsDragOverUpload] = useState<boolean>(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Calculate nice centered size
        let w = img.width;
        let h = img.height;
        const maxW = isLogo ? 200 : design.width * 0.6;
        const maxH = isLogo ? 120 : design.height * 0.6;

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        addElement({
          type: 'image',
          name: isLogo ? 'Uploaded Logo' : 'Uploaded Image',
          src,
          originalWidth: img.width,
          originalHeight: img.height,
          x: Math.round((design.width - w) / 2),
          y: Math.round((design.height - h) / 2),
          width: w,
          height: h,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          objectFit: 'cover',
          borderRadius: isLogo ? 0 : 12,
          borderWidth: 0,
          borderColor: '#000000',
          filters: {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: 0,
            sepia: 0,
            invert: 0,
          },
          isLogo,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleAddSampleImage = (url: string, name: string) => {
    const w = Math.round(design.width * 0.6);
    const h = Math.round(design.height * 0.6);
    addElement({
      type: 'image',
      name,
      src: url,
      originalWidth: 1200,
      originalHeight: 800,
      x: Math.round((design.width - w) / 2),
      y: Math.round((design.height - h) / 2),
      width: w,
      height: h,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      objectFit: 'cover',
      borderRadius: 16,
      borderWidth: 0,
      borderColor: '#000000',
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        invert: 0,
      },
    });
  };

  const handleAddSampleLogo = (dataUrl: string, name: string) => {
    addElement({
      type: 'image',
      name: `Logo: ${name}`,
      src: dataUrl,
      originalWidth: 100,
      originalHeight: 100,
      x: 60,
      y: 60,
      width: 90,
      height: 90,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      objectFit: 'contain',
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#000000',
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        invert: 0,
      },
      isLogo: true,
    });
  };

  interface SidebarTabItem {
    id: 'templates' | 'uploads' | 'text' | 'shapes' | 'button' | 'overlays' | 'background' | 'layers';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const tabs: SidebarTabItem[] = [
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'uploads', label: 'Uploads', icon: Upload },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'shapes', label: 'Shapes', icon: Shapes },
    { id: 'button', label: 'Buttons', icon: MousePointerClick },
    { id: 'overlays', label: 'Overlays', icon: Sparkles },
    { id: 'background', label: 'Background', icon: Palette },
    { id: 'layers', label: 'Layers', icon: Layers, badge: design.elements.length },
  ];

  return (
    <div className="flex h-full bg-white border-r border-neutral-200 z-20">
      {/* Primary vertical tab icons column */}
      <div className="w-18 bg-neutral-50/80 border-r border-neutral-200 flex flex-col items-center py-3 gap-1 shrink-0 select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-sm border border-neutral-200 font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Drawer / Panel Content */}
      <div className="w-76 h-full overflow-y-auto p-4 select-none bg-white">
        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Templates</h3>
              <p className="text-xs text-neutral-500">Pick a professional starting banner</p>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              {['All', 'Business', 'Offer', 'Sale', 'Tech', 'Education'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    templateCategory === cat
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {BANNER_TEMPLATES.filter(
                (t) => templateCategory === 'All' || t.category.includes(templateCategory)
              ).map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => loadTemplate(tmpl.id)}
                  className="group p-2.5 border border-neutral-200 hover:border-indigo-500 rounded-xl hover:shadow-md transition-all cursor-pointer bg-neutral-50/50 hover:bg-indigo-50/20"
                >
                  <div className="h-28 rounded-lg overflow-hidden relative border border-neutral-200 bg-neutral-900 flex items-center justify-center">
                    {/* Simulated miniature preview */}
                    <div
                      style={{
                        background:
                          tmpl.design.background.type === 'gradient' &&
                          tmpl.design.background.gradient
                            ? `linear-gradient(${tmpl.design.background.gradient.angle}deg, ${tmpl.design.background.gradient.stops[0].color}, ${tmpl.design.background.gradient.stops[1]?.color || '#000'})`
                            : tmpl.design.background.color || '#1e1b4b',
                      }}
                      className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
                    >
                      <span className="text-white text-xs font-black tracking-wider line-clamp-1 uppercase">
                        {tmpl.title}
                      </span>
                      <span className="text-[10px] text-white/70 mt-1 line-clamp-1">
                        {tmpl.description}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-800">{tmpl.title}</div>
                      <div className="text-[10px] text-neutral-400">
                        {tmpl.design.width} × {tmpl.design.height} px
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Load →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOADS TAB */}
        {activeTab === 'uploads' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Upload Image / Logo</h3>
              <p className="text-xs text-neutral-500">Add your photos, products, or brand logos</p>
            </div>

            {/* Dropzone */}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverUpload(true);
              }}
              onDragLeave={() => setIsDragOverUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverUpload(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const fakeEvent = { target: { files: [file] } } as any;
                  handleFileUpload(fakeEvent, false);
                }
              }}
              className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                isDragOverUpload
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-neutral-300 hover:border-indigo-400 bg-neutral-50 hover:bg-neutral-100/60'
              }`}
            >
              <div className="p-3 bg-white rounded-full shadow-xs text-indigo-600 mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-800">Click or drag image</span>
              <span className="text-[11px] text-neutral-400 mt-0.5">JPG, PNG, WEBP</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={(e) => handleFileUpload(e, false)}
                className="sr-only"
              />
            </label>

            {/* Logo Upload specific */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-700">Brand Logo</span>
                <label className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer">
                  + Upload Logo
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/webp"
                    onChange={(e) => handleFileUpload(e, true)}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_LOGOS.map((logo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSampleLogo(logo.dataUrl, logo.name)}
                    className="p-2 border border-neutral-200 rounded-lg hover:border-indigo-500 hover:bg-neutral-50 flex items-center justify-center transition-all cursor-pointer aspect-square"
                    title={`Add ${logo.name}`}
                  >
                    <img src={logo.dataUrl} alt={logo.name} className="w-7 h-7 object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Sample Photos Gallery */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-700 block mb-2">Sample Photos</span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_PHOTOS.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => handleAddSampleImage(photo.url, photo.name)}
                    className="group relative h-20 rounded-lg overflow-hidden border border-neutral-200 cursor-pointer"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <span className="text-[10px] text-white font-medium truncate">
                        {photo.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Add Typography</h3>
              <p className="text-xs text-neutral-500">Click to add editable text directly on canvas</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Heading',
                    text: 'GRAND OPENING',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 72,
                    fontWeight: 800,
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    color: '#0F172A',
                    textAlign: 'center',
                    letterSpacing: 2,
                    lineHeight: 1.1,
                    x: Math.round((design.width - 550) / 2),
                    y: Math.round(design.height * 0.25),
                    width: 550,
                    height: 90,
                    rotation: 0,
                    opacity: 1,
                    visible: true,
                    locked: false,
                  })
                }
                className="w-full p-3 border border-neutral-200 hover:border-indigo-500 rounded-xl text-left bg-neutral-50/60 hover:bg-indigo-50/20 transition-all cursor-pointer"
              >
                <div className="text-2xl font-black text-neutral-900 tracking-tight leading-none">
                  Add a Heading
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Huge bold display title</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Subheading',
                    text: 'Exclusive Collection Available Now',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 32,
                    fontWeight: 600,
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    textTransform: 'none',
                    color: '#334155',
                    textAlign: 'center',
                    letterSpacing: 1,
                    lineHeight: 1.3,
                    x: Math.round((design.width - 500) / 2),
                    y: Math.round(design.height * 0.4),
                    width: 500,
                    height: 50,
                    rotation: 0,
                    opacity: 1,
                    visible: true,
                    locked: false,
                  })
                }
                className="w-full p-3 border border-neutral-200 hover:border-indigo-500 rounded-xl text-left bg-neutral-50/60 hover:bg-indigo-50/20 transition-all cursor-pointer"
              >
                <div className="text-lg font-bold text-neutral-800 leading-snug">
                  Add a Subheading
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Section header or tagline</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Paragraph',
                    text: 'Describe your product, service, or event in detail with clear persuasive copy.',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 18,
                    fontWeight: 400,
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    textTransform: 'none',
                    color: '#475569',
                    textAlign: 'center',
                    letterSpacing: 0,
                    lineHeight: 1.5,
                    x: Math.round((design.width - 450) / 2),
                    y: Math.round(design.height * 0.52),
                    width: 450,
                    height: 60,
                    rotation: 0,
                    opacity: 1,
                    visible: true,
                    locked: false,
                  })
                }
                className="w-full p-3 border border-neutral-200 hover:border-indigo-500 rounded-xl text-left bg-neutral-50/60 hover:bg-indigo-50/20 transition-all cursor-pointer"
              >
                <div className="text-sm font-normal text-neutral-700 leading-relaxed">
                  Add body text / paragraph
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Multi-line descriptive copy</div>
              </button>
            </div>

            {/* Styled Text Presets */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-700 block mb-2">Preset Badges & Text</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    addElement({
                      type: 'badge',
                      name: 'Sale Tag',
                      text: '🔥 50% OFF TODAY',
                      badgeStyle: 'pill',
                      backgroundColor: '#EF4444',
                      textColor: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 800,
                      fontFamily: "'Inter', sans-serif",
                      x: 80,
                      y: 80,
                      width: 170,
                      height: 36,
                      rotation: 0,
                      opacity: 1,
                      visible: true,
                      locked: false,
                    })
                  }
                  className="p-2.5 rounded-lg border border-neutral-200 text-center text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                >
                  🔥 50% OFF TODAY
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addElement({
                      type: 'badge',
                      name: 'New Badge',
                      text: '✨ NEW ARRIVAL',
                      badgeStyle: 'pill',
                      backgroundColor: '#6366F1',
                      textColor: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif",
                      x: 80,
                      y: 80,
                      width: 150,
                      height: 36,
                      rotation: 0,
                      opacity: 1,
                      visible: true,
                      locked: false,
                    })
                  }
                  className="p-2.5 rounded-lg border border-neutral-200 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  ✨ NEW ARRIVAL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHAPES TAB */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Geometric Shapes</h3>
              <p className="text-xs text-neutral-500">Decorative accents, banners, and backdrops</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { type: 'rectangle', label: 'Rectangle', icon: Square },
                { type: 'rounded-rectangle', label: 'Rounded Rect', icon: Square },
                { type: 'circle', label: 'Circle', icon: Circle },
                { type: 'triangle', label: 'Triangle', icon: Triangle },
                { type: 'arrow', label: 'Arrow', icon: MoveRight },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.type}
                    type="button"
                    onClick={() =>
                      addElement({
                        type: 'shape',
                        name: s.label,
                        shapeType: s.type as any,
                        fillColor: '#3B82F6',
                        borderColor: '#2563EB',
                        borderWidth: 0,
                        borderRadius: s.type === 'rounded-rectangle' ? 16 : 0,
                        x: Math.round((design.width - 200) / 2),
                        y: Math.round((design.height - 150) / 2),
                        width: 200,
                        height: 150,
                        rotation: 0,
                        opacity: 1,
                        visible: true,
                        locked: false,
                      })
                    }
                    className="p-3 border border-neutral-200 hover:border-indigo-500 rounded-xl bg-neutral-50 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Icon className="w-6 h-6 text-neutral-700" />
                    <span className="text-[10px] font-medium text-neutral-600">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* BUTTON TAB */}
        {activeTab === 'button' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Call to Action Buttons</h3>
              <p className="text-xs text-neutral-500">High-converting click targets with customizable URLs</p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  label: 'Indigo Solid',
                  bg: '#4F46E5',
                  text: '#FFFFFF',
                  border: '#6366F1',
                  btnText: 'SHOP NOW →',
                },
                {
                  label: 'Sunset Amber',
                  bg: '#F59E0B',
                  text: '#0F172A',
                  border: '#FDE68A',
                  btnText: 'GET STARTED FREE',
                },
                {
                  label: 'Emerald Green',
                  bg: '#10B981',
                  text: '#FFFFFF',
                  border: '#34D399',
                  btnText: 'CLAIM OFFER NOW',
                },
                {
                  label: 'Dark Luxury',
                  bg: '#0F172A',
                  text: '#FFFFFF',
                  border: '#334155',
                  btnText: 'EXPLORE CATALOG',
                },
              ].map((style, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    addElement({
                      type: 'button',
                      name: 'CTA Button',
                      text: style.btnText,
                      textColor: style.text,
                      backgroundColor: style.bg,
                      borderColor: style.border,
                      borderWidth: 2,
                      borderRadius: 12,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      paddingX: 30,
                      paddingY: 15,
                      url: 'https://example.com',
                      x: Math.round((design.width - 260) / 2),
                      y: Math.round(design.height * 0.7),
                      width: 260,
                      height: 56,
                      rotation: 0,
                      opacity: 1,
                      visible: true,
                      locked: false,
                      shadow: {
                        enabled: true,
                        color: 'rgba(0,0,0,0.25)',
                        blur: 15,
                        offsetX: 0,
                        offsetY: 6,
                      },
                    })
                  }
                  className="w-full p-3 rounded-xl border border-neutral-200 hover:border-neutral-400 text-center font-bold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-between"
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  <span className="truncate">{style.btnText}</span>
                  <Plus className="w-4 h-4 shrink-0 opacity-70" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* OVERLAYS TAB */}
        {activeTab === 'overlays' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Contrast Overlays</h3>
              <p className="text-xs text-neutral-500">Improve text readability over busy background images</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  addElement({
                    type: 'overlay',
                    name: 'Dark Left-to-Right Fade',
                    overlayType: 'linear-gradient-lr',
                    color1: 'rgba(15, 23, 42, 0.95)',
                    color2: 'rgba(15, 23, 42, 0.1)',
                    gradientStops: [
                      { color: 'rgba(15, 23, 42, 0.95)', offset: 0 },
                      { color: 'rgba(15, 23, 42, 0.1)', offset: 1 },
                    ],
                    x: 0,
                    y: 0,
                    width: design.width,
                    height: design.height,
                    rotation: 0,
                    opacity: 0.9,
                    visible: true,
                    locked: true,
                  })
                }
                className="w-full p-3 border border-neutral-200 hover:border-indigo-500 rounded-xl text-left bg-gradient-to-r from-neutral-900 to-transparent text-white cursor-pointer"
              >
                <div className="text-xs font-bold">Left-to-Right Dark Gradient</div>
                <div className="text-[10px] text-neutral-300">Perfect for left-aligned headlines</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  addElement({
                    type: 'overlay',
                    name: 'Top-to-Bottom Fade',
                    overlayType: 'linear-gradient-tb',
                    color1: 'rgba(0, 0, 0, 0.85)',
                    color2: 'rgba(0, 0, 0, 0)',
                    gradientStops: [
                      { color: 'rgba(0, 0, 0, 0.85)', offset: 0 },
                      { color: 'rgba(0, 0, 0, 0)', offset: 1 },
                    ],
                    x: 0,
                    y: 0,
                    width: design.width,
                    height: design.height,
                    rotation: 0,
                    opacity: 0.85,
                    visible: true,
                    locked: true,
                  })
                }
                className="w-full p-3 border border-neutral-200 hover:border-indigo-500 rounded-xl text-left bg-gradient-to-b from-neutral-900 to-transparent text-white cursor-pointer"
              >
                <div className="text-xs font-bold">Top-to-Bottom Fade</div>
                <div className="text-[10px] text-neutral-300">Creates contrast for top text</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  addElement({
                    type: 'overlay',
                    name: 'Solid Dark Wash',
                    overlayType: 'black',
                    color1: 'rgba(0, 0, 0, 0.6)',
                    color2: 'rgba(0, 0, 0, 0.6)',
                    gradientStops: [],
                    x: 0,
                    y: 0,
                    width: design.width,
                    height: design.height,
                    rotation: 0,
                    opacity: 0.6,
                    visible: true,
                    locked: true,
                  })
                }
                className="w-full p-3 border border-neutral-200 hover:border-indigo-500 rounded-xl text-left bg-neutral-900/80 text-white cursor-pointer"
              >
                <div className="text-xs font-bold">Solid Dark Dimmer (60%)</div>
                <div className="text-[10px] text-neutral-300">Even backdrop dimming</div>
              </button>
            </div>
          </div>
        )}

        {/* BACKGROUND TAB */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Canvas Backdrop</h3>
              <p className="text-xs text-neutral-500">Solid color, gradient, or transparent canvas</p>
            </div>

            <ColorPicker
              label="Solid Background Color"
              value={design.background.color || '#FFFFFF'}
              onChange={(color) => setBackground({ type: 'solid', color })}
            />

            {/* Gradient Presets */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Gradient Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_PRESETS.map((grad) => (
                  <button
                    key={grad.name}
                    type="button"
                    onClick={() =>
                      setBackground({
                        type: 'gradient',
                        color: grad.stops[0].color,
                        gradient: {
                          enabled: true,
                          type: 'linear',
                          angle: grad.angle,
                          stops: grad.stops,
                        },
                      })
                    }
                    className="p-2.5 rounded-xl border border-neutral-200 text-white font-bold text-xs text-left shadow-xs transition-transform hover:scale-[1.02] cursor-pointer"
                    style={{
                      background: `linear-gradient(${grad.angle}deg, ${grad.stops[0].color}, ${grad.stops[1].color})`,
                    }}
                  >
                    <span className="drop-shadow-sm">{grad.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBackground({ type: 'transparent', color: 'transparent' })}
              className="w-full py-2.5 px-3 border border-dashed border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              🏁 Set Transparent Canvas (PNG)
            </button>
          </div>
        )}

        {/* LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Layers</h3>
                <p className="text-xs text-neutral-500">{design.elements.length} elements</p>
              </div>
            </div>

            {design.elements.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-neutral-200">
                No elements on canvas. Add text, shapes, or images.
              </div>
            ) : (
              <div className="space-y-1.5">
                {[...design.elements]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((el) => {
                    const isSelected = el.id === selectedElementId;
                    return (
                      <div
                        key={el.id}
                        onClick={() => selectElement(el.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="p-1 rounded bg-neutral-100 text-neutral-600 shrink-0">
                            {el.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                            {el.type === 'text' && <Type className="w-3.5 h-3.5" />}
                            {el.type === 'shape' && <Shapes className="w-3.5 h-3.5" />}
                            {el.type === 'button' && <MousePointerClick className="w-3.5 h-3.5" />}
                            {el.type === 'overlay' && <Sparkles className="w-3.5 h-3.5" />}
                            {el.type === 'badge' && <ShieldAlert className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-medium text-neutral-800 truncate">
                            {el.name}
                          </span>
                        </div>

                        {/* Layer quick controls */}
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              bringForward(el.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                            title="Bring Forward"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sendBackward(el.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                            title="Send Backward"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisibility(el.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                            title={el.visible ? 'Hide' : 'Show'}
                          >
                            {el.visible ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-neutral-300" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLock(el.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                            title={el.locked ? 'Unlock' : 'Lock'}
                          >
                            {el.locked ? (
                              <Lock className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(el.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
