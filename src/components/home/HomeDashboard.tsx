import React, { useState } from 'react';
import { BANNER_TEMPLATES } from '../../lib/templates';
import { BANNER_PRESETS } from '../../lib/constants';
import { useEditorStore } from '../../store/editorStore';
import {
  Sparkles,
  Plus,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle,
  Layout,
  Upload,
  Clock,
  Trash2,
  Copy,
} from 'lucide-react';

interface HomeDashboardProps {
  onStartScratch: () => void;
  onOpenSizeModal: () => void;
  onOpenEditor: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartScratch,
  onOpenSizeModal,
  onOpenEditor,
}) => {
  const loadTemplate = useEditorStore((state) => state.loadTemplate);
  const setDimensions = useEditorStore((state) => state.setDimensions);
  const setDesignName = useEditorStore((state) => state.setDesignName);
  const design = useEditorStore((state) => state.design);
  const savedProjects = useEditorStore((state) => state.savedProjects);
  const loadSavedProject = useEditorStore((state) => state.loadSavedProject);
  const deleteSavedProject = useEditorStore((state) => state.deleteSavedProject);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Social Media',
    'Banner Ads',
    'Business Promotion',
    'Restaurant Offer',
    'Real Estate',
    'Sale / Discount',
    'YouTube',
    'Education',
  ];

  const filteredTemplates = BANNER_TEMPLATES.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleSelectTemplate = (id: string) => {
    loadTemplate(id);
    onOpenEditor();
  };

  const handleSelectPreset = (preset: typeof BANNER_PRESETS[0]) => {
    setDimensions(preset.width, preset.height);
    setDesignName(`New ${preset.name}`);
    onOpenEditor();
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm">
            BC
          </div>
          <div>
            <h1 className="text-base font-extrabold text-neutral-900 tracking-tight leading-none">
              BannerCraft
            </h1>
            <span className="text-[11px] text-neutral-500 font-medium">
              Professional Banner & Graphic Designer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {design.elements.length > 0 && (
            <button
              type="button"
              onClick={onOpenEditor}
              className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Resume Active Editor</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStartScratch}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Banner</span>
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Create high-converting banners in minutes
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Upload your images, customize typography, apply professional gradient overlays, and
            export pixel-perfect banners for Facebook, LinkedIn, Google Display Ads, YouTube, and
            e-commerce.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onStartScratch}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start from Scratch</span>
            </button>
            <button
              type="button"
              onClick={onOpenSizeModal}
              className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-sm rounded-xl border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Custom Dimensions</span>
            </button>
          </div>
        </div>

        {/* Quick Size Presets row */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
              Popular Banner Formats
            </h3>
            <button
              type="button"
              onClick={onOpenSizeModal}
              className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              View all formats →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {BANNER_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="p-3 bg-white border border-neutral-200 hover:border-indigo-500 rounded-xl hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 block">
                    {preset.category}
                  </span>
                  <div className="text-xs font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                    {preset.name}
                  </div>
                </div>
                <div className="mt-3 font-mono text-[11px] text-neutral-400">
                  {preset.width} × {preset.height} px
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* My Saved Designs (if any) */}
        {savedProjects.length > 0 && (
          <section className="space-y-3 pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Your Saved Projects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all group"
                >
                  <div
                    onClick={() => {
                      loadSavedProject(proj.id);
                      onOpenEditor();
                    }}
                    className="h-28 bg-neutral-900 cursor-pointer flex items-center justify-center p-4 text-center"
                    style={{
                      background:
                        proj.design.background.type === 'gradient' &&
                        proj.design.background.gradient
                          ? `linear-gradient(${proj.design.background.gradient.angle}deg, ${proj.design.background.gradient.stops[0]?.color || '#000'}, ${proj.design.background.gradient.stops[1]?.color || '#333'})`
                          : proj.design.background.color || '#1e1b4b',
                    }}
                  >
                    <span className="text-white text-xs font-bold line-clamp-1">
                      {proj.name}
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-800 truncate">{proj.name}</div>
                      <div className="text-[10px] text-neutral-400">
                        {proj.design.width} × {proj.design.height} px •{' '}
                        {new Date(proj.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteSavedProject(proj.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete saved banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Template Gallery */}
        <section className="space-y-4 pt-4 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Professional Banner Templates</h3>
              <p className="text-xs text-neutral-500">
                Fully customizable. Click any template to edit in the canvas.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="bg-white border border-neutral-200 hover:border-indigo-500 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all group cursor-pointer flex flex-col"
              >
                {/* Visual Banner Preview Card */}
                <div
                  className="h-44 relative overflow-hidden flex items-center justify-center p-6 text-center select-none"
                  style={{
                    background:
                      template.design.background.type === 'gradient' &&
                      template.design.background.gradient
                        ? `linear-gradient(${template.design.background.gradient.angle}deg, ${template.design.background.gradient.stops[0]?.color || '#000'}, ${template.design.background.gradient.stops[1]?.color || '#333'})`
                        : template.design.background.color || '#1e1b4b',
                  }}
                >
                  {/* Subtle inner elements mockup */}
                  <div className="space-y-1.5 max-w-xs drop-shadow-md">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                      {template.category}
                    </span>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight line-clamp-2">
                      {template.title}
                    </h4>
                    <p className="text-xs text-white/80 line-clamp-1">{template.description}</p>
                  </div>

                  <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-white text-neutral-950 text-xs font-bold rounded-xl shadow-lg transform -translate-y-1 group-hover:translate-y-0 transition-transform">
                      Customize in Editor →
                    </span>
                  </div>
                </div>

                {/* Footer details */}
                <div className="p-4 flex items-center justify-between border-t border-neutral-100 bg-white">
                  <div>
                    <h5 className="text-sm font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                      {template.title}
                    </h5>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {template.design.width} × {template.design.height} px
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Use
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
