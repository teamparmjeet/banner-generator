import React, { useState, useMemo } from 'react';
import { AVAILABLE_FONTS } from '../../lib/constants';
import { Search, ChevronDown, Check } from 'lucide-react';

interface FontPickerProps {
  currentFont: string;
  onSelectFont: (fontFamily: string) => void;
}

export const FontPicker: React.FC<FontPickerProps> = ({ currentFont, onSelectFont }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set(AVAILABLE_FONTS.map((f) => f.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredFonts = useMemo(() => {
    return AVAILABLE_FONTS.filter((f) => {
      const matchQuery = f.name.toLowerCase().includes(query.toLowerCase());
      const matchCategory = selectedCategory === 'All' || f.category === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [query, selectedCategory]);

  const activeFontObj = AVAILABLE_FONTS.find(
    (f) => f.family.toLowerCase() === currentFont.toLowerCase() || currentFont.includes(f.name)
  ) || AVAILABLE_FONTS[0];

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-neutral-600 mb-1">Font Family</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium bg-white border border-neutral-300 rounded-lg hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-neutral-800 transition-colors cursor-pointer"
      >
        <span style={{ fontFamily: activeFontObj.family }} className="text-sm truncate">
          {activeFontObj.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-2 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-2xl z-50 p-2 w-72 max-w-[calc(100vw-2rem)]">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Google fonts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1.5 mb-1.5 scrollbar-none text-[10px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-neutral-50 pr-0.5">
              {filteredFonts.length === 0 ? (
                <div className="p-3 text-center text-xs text-neutral-400">No fonts found</div>
              ) : (
                filteredFonts.map((f) => {
                  const isSelected =
                    f.family.toLowerCase() === currentFont.toLowerCase() ||
                    currentFont.includes(f.name);
                  return (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => {
                        onSelectFont(f.family);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-indigo-50/60 rounded-lg transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-neutral-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span style={{ fontFamily: f.family }} className="text-base">
                          {f.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-sans">{f.category}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
