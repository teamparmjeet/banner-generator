import { create } from 'zustand';
import {
  AlignmentGuide,
  BannerDesignState,
  BannerElement,
  CanvasBackground,
  NewBannerElement,
  SavedProject,
} from '../types/editor';
import { BANNER_TEMPLATES } from '../lib/templates';

const LOCAL_STORAGE_KEY = 'bannercraft_current_design';
const LOCAL_STORAGE_PROJECTS_KEY = 'bannercraft_saved_projects';

interface EditorStore {
  currentView: 'home' | 'editor';
  setCurrentView: (view: 'home' | 'editor') => void;
  savedProjects: SavedProject[];
  loadSavedProject: (id: string) => void;
  deleteSavedProject: (id: string) => void;

  design: BannerDesignState;
  selectedElementId: string | null;
  zoom: number; // 0.25 to 2.0
  panOffset: { x: number; y: number };
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  previewMode: boolean;
  activeSidebarTab:
    | 'templates'
    | 'uploads'
    | 'text'
    | 'shapes'
    | 'button'
    | 'overlays'
    | 'background'
    | 'layers';
  alignmentGuides: AlignmentGuide[];
  clipboard: BannerElement | null;
  history: BannerDesignState[];
  historyIndex: number;
  recentColors: string[];

  // Actions
  setDesign: (design: BannerDesignState, pushHistory?: boolean) => void;
  setCanvasSize: (width: number, height: number) => void;
  setDimensions: (width: number, height: number) => void;
  setDesignName: (name: string) => void;
  setBackground: (bg: CanvasBackground) => void;
  addElement: (element: NewBannerElement) => string;
  updateElement: (id: string, updates: Partial<BannerElement>) => void;
  deleteElement: (id?: string) => void;
  duplicateElement: (id?: string) => void;
  selectElement: (id: string | null) => void;
  toggleElementVisibility: (id: string) => void;
  toggleElementLock: (id: string) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  alignElement: (
    id: string,
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ) => void;

  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnapToGrid: () => void;
  setPreviewMode: (enabled: boolean) => void;
  setActiveSidebarTab: (
    tab:
      | 'templates'
      | 'uploads'
      | 'text'
      | 'shapes'
      | 'button'
      | 'overlays'
      | 'background'
      | 'layers'
  ) => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  addRecentColor: (color: string) => void;

  copySelected: () => void;
  pasteClipboard: () => void;
  undo: () => void;
  redo: () => void;
  clearDesign: () => void;
  loadTemplate: (templateId: string) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
}

const initialDesign: BannerDesignState = JSON.parse(
  JSON.stringify(BANNER_TEMPLATES[0].design)
);

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
  savedProjects: (() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
  loadSavedProject: (id) => {
    const proj = get().savedProjects.find((p) => p.id === id);
    if (proj) {
      get().setDesign(JSON.parse(JSON.stringify(proj.design)));
      set({ currentView: 'editor', selectedElementId: null });
    }
  },
  deleteSavedProject: (id) => {
    const updated = get().savedProjects.filter((p) => p.id !== id);
    set({ savedProjects: updated });
    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  design: initialDesign,
  selectedElementId: null,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  showGrid: false,
  showRulers: true,
  snapToGrid: false,
  previewMode: false,
  activeSidebarTab: 'templates',
  alignmentGuides: [],
  clipboard: null,
  history: [JSON.parse(JSON.stringify(initialDesign))],
  historyIndex: 0,
  recentColors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1'],

  setDesign: (design, pushHistory = true) => {
    set((state) => {
      const newDesign = { ...design, updatedAt: Date.now() };
      let newHistory = state.history;
      let newIndex = state.historyIndex;

      if (pushHistory) {
        newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newDesign)));
        if (newHistory.length > 30) newHistory.shift();
        newIndex = newHistory.length - 1;
      }

      return {
        design: newDesign,
        history: newHistory,
        historyIndex: newIndex,
      };
    });
    get().saveToLocalStorage();
  },

  setCanvasSize: (width, height) => {
    const current = get().design;
    const updated: BannerDesignState = {
      ...current,
      width,
      height,
      updatedAt: Date.now(),
    };
    get().setDesign(updated);
  },

  setDimensions: (width, height) => {
    get().setCanvasSize(width, height);
  },

  setDesignName: (name) => {
    const current = get().design;
    set({
      design: { ...current, name, updatedAt: Date.now() },
    });
    get().saveToLocalStorage();
  },

  setBackground: (bg) => {
    const current = get().design;
    get().setDesign({
      ...current,
      background: bg,
      updatedAt: Date.now(),
    });
  },

  addElement: (elementData) => {
    const current = get().design;
    const id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const maxZ = current.elements.reduce((acc, el) => Math.max(acc, el.zIndex || 0), 0);

    const newElement: BannerElement = {
      ...elementData,
      id,
      zIndex: maxZ + 1,
      visible: true,
      locked: false,
      rotation: elementData.rotation || 0,
      opacity: elementData.opacity ?? 1,
    } as BannerElement;

    const updatedElements = [...current.elements, newElement];
    get().setDesign({
      ...current,
      elements: updatedElements,
    });
    set({ selectedElementId: id });
    return id;
  },

  updateElement: (id, updates) => {
    const current = get().design;
    const exists = current.elements.some((el) => el.id === id);
    if (!exists) return;

    const updatedElements = current.elements.map((el) =>
      el.id === id ? ({ ...el, ...updates } as BannerElement) : el
    );

    get().setDesign({
      ...current,
      elements: updatedElements,
    });
  },

  deleteElement: (id) => {
    const targetId = id || get().selectedElementId;
    if (!targetId) return;

    const current = get().design;
    const target = current.elements.find((el) => el.id === targetId);
    if (target?.locked) return; // Locked items cannot be deleted directly

    const updatedElements = current.elements.filter((el) => el.id !== targetId);
    get().setDesign({
      ...current,
      elements: updatedElements,
    });
    set({ selectedElementId: null });
  },

  duplicateElement: (id) => {
    const targetId = id || get().selectedElementId;
    if (!targetId) return;

    const current = get().design;
    const target = current.elements.find((el) => el.id === targetId);
    if (!target) return;

    const newId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const maxZ = current.elements.reduce((acc, el) => Math.max(acc, el.zIndex || 0), 0);

    const duplicated: BannerElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      name: `${target.name} (Copy)`,
      x: target.x + 24,
      y: target.y + 24,
      zIndex: maxZ + 1,
      locked: false,
    };

    get().setDesign({
      ...current,
      elements: [...current.elements, duplicated],
    });
    set({ selectedElementId: newId });
  },

  selectElement: (id) => {
    set({ selectedElementId: id, alignmentGuides: [] });
  },

  toggleElementVisibility: (id) => {
    const current = get().design;
    const updated = current.elements.map((el) =>
      el.id === id ? { ...el, visible: !el.visible } : el
    );
    get().setDesign({ ...current, elements: updated as BannerElement[] });
  },

  toggleElementLock: (id) => {
    const current = get().design;
    const updated = current.elements.map((el) =>
      el.id === id ? { ...el, locked: !el.locked } : el
    );
    get().setDesign({ ...current, elements: updated as BannerElement[] });
  },

  reorderElements: (startIndex, endIndex) => {
    const current = get().design;
    const items = [...current.elements];
    const [moved] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, moved);

    // Re-assign zIndexes smoothly
    const reindexed = items.map((item, idx) => ({
      ...item,
      zIndex: idx + 1,
    }));

    get().setDesign({ ...current, elements: reindexed });
  },

  bringForward: (id) => {
    const current = get().design;
    const index = current.elements.findIndex((el) => el.id === id);
    if (index === -1 || index === current.elements.length - 1) return;
    get().reorderElements(index, index + 1);
  },

  sendBackward: (id) => {
    const current = get().design;
    const index = current.elements.findIndex((el) => el.id === id);
    if (index <= 0) return;
    get().reorderElements(index, index - 1);
  },

  bringToFront: (id) => {
    const current = get().design;
    const index = current.elements.findIndex((el) => el.id === id);
    if (index === -1 || index === current.elements.length - 1) return;
    get().reorderElements(index, current.elements.length - 1);
  },

  sendToBack: (id) => {
    const current = get().design;
    const index = current.elements.findIndex((el) => el.id === id);
    if (index <= 0) return;
    get().reorderElements(index, 0);
  },

  alignElement: (id, alignment) => {
    const current = get().design;
    const el = current.elements.find((item) => item.id === id);
    if (!el || el.locked) return;

    let newX = el.x;
    let newY = el.y;

    switch (alignment) {
      case 'left':
        newX = 0;
        break;
      case 'center':
        newX = Math.round((current.width - el.width) / 2);
        break;
      case 'right':
        newX = current.width - el.width;
        break;
      case 'top':
        newY = 0;
        break;
      case 'middle':
        newY = Math.round((current.height - el.height) / 2);
        break;
      case 'bottom':
        newY = current.height - el.height;
        break;
    }

    get().updateElement(id, { x: newX, y: newY });
  },

  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.2), 3) }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  setPreviewMode: (enabled) => set({ previewMode: enabled, selectedElementId: null }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setAlignmentGuides: (guides) => set({ alignmentGuides: guides }),
  addRecentColor: (color) =>
    set((state) => {
      const filtered = state.recentColors.filter((c) => c.toLowerCase() !== color.toLowerCase());
      return { recentColors: [color, ...filtered].slice(0, 10) };
    }),

  copySelected: () => {
    const { design, selectedElementId } = get();
    if (!selectedElementId) return;
    const target = design.elements.find((el) => el.id === selectedElementId);
    if (target) {
      set({ clipboard: JSON.parse(JSON.stringify(target)) });
    }
  },

  pasteClipboard: () => {
    const { clipboard } = get();
    if (!clipboard) return;
    get().duplicateElement(clipboard.id);
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevDesign = JSON.parse(JSON.stringify(history[prevIndex]));
      set({
        design: prevDesign,
        historyIndex: prevIndex,
        selectedElementId: null,
      });
      get().saveToLocalStorage();
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextDesign = JSON.parse(JSON.stringify(history[nextIndex]));
      set({
        design: nextDesign,
        historyIndex: nextIndex,
        selectedElementId: null,
      });
      get().saveToLocalStorage();
    }
  },

  clearDesign: () => {
    const current = get().design;
    const emptyDesign: BannerDesignState = {
      id: `design_${Date.now()}`,
      name: 'Blank Banner',
      width: current.width,
      height: current.height,
      background: { type: 'solid', color: '#FFFFFF' },
      elements: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    get().setDesign(emptyDesign);
    set({ selectedElementId: null });
  },

  loadTemplate: (templateId) => {
    const template = BANNER_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const clonedDesign: BannerDesignState = JSON.parse(JSON.stringify(template.design));
    clonedDesign.id = `design_${Date.now()}`;
    get().setDesign(clonedDesign);
    set({ selectedElementId: null });
  },

  saveToLocalStorage: () => {
    try {
      const { design } = get();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(design));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  },

  loadFromLocalStorage: () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.width && parsed.height && Array.isArray(parsed.elements)) {
          get().setDesign(parsed, true);
          return true;
        }
      }
    } catch (e) {
      console.warn('LocalStorage restore error', e);
    }
    return false;
  },
}));
