import { BannerPreset } from '../types/editor';

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: 'youtube-thumb',
    name: 'YouTube Thumbnail',
    category: 'video',
    width: 1280,
    height: 720,
    description: '16:9 ratio, optimized for video clicks & high engagement',
    iconName: 'Youtube',
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    category: 'social',
    width: 1200,
    height: 630,
    description: 'Optimal feed landscape post',
    iconName: 'Facebook',
  },
  {
    id: 'facebook-cover',
    name: 'Facebook Cover',
    category: 'social',
    width: 820,
    height: 312,
    description: 'Page and profile header cover',
    iconName: 'Image',
  },
  {
    id: 'instagram-post',
    name: 'Instagram Post (Square)',
    category: 'social',
    width: 1080,
    height: 1080,
    description: 'Classic 1:1 square feed visual',
    iconName: 'Instagram',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    category: 'social',
    width: 1080,
    height: 1920,
    description: '9:16 vertical full screen for stories and reels',
    iconName: 'Smartphone',
  },
  {
    id: 'whatsapp-status',
    name: 'WhatsApp Status',
    category: 'social',
    width: 1080,
    height: 1920,
    description: '9:16 mobile status banner',
    iconName: 'MessageCircle',
  },
  {
    id: 'youtube-banner',
    name: 'YouTube Channel Banner',
    category: 'video',
    width: 2560,
    height: 1440,
    description: 'High-res channel banner for desktop and TV',
    iconName: 'Monitor',
  },
  {
    id: 'website-hero',
    name: 'Website Hero Banner',
    category: 'web',
    width: 1920,
    height: 800,
    description: 'Homepage primary widescreen header',
    iconName: 'Layout',
  },
  {
    id: 'website-ad-leaderboard',
    name: 'Website Ad (Leaderboard)',
    category: 'web',
    width: 728,
    height: 90,
    description: 'Standard desktop top banner ad',
    iconName: 'Columns',
  },
  {
    id: 'website-ad-mpu',
    name: 'Website Ad (Medium Rectangle)',
    category: 'web',
    width: 300,
    height: 250,
    description: 'Standard sidebar inline web ad',
    iconName: 'Square',
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    category: 'social',
    width: 1200,
    height: 627,
    description: 'Professional landscape graphic',
    iconName: 'Linkedin',
  },
  {
    id: 'twitter-post',
    name: 'Twitter / X Post',
    category: 'social',
    width: 1200,
    height: 675,
    description: 'High click-through feed media card',
    iconName: 'Twitter',
  },
];

export const AVAILABLE_FONTS = [
  { name: 'Inter', family: "'Inter', sans-serif", category: 'Sans-Serif' },
  { name: 'Poppins', family: "'Poppins', sans-serif", category: 'Modern' },
  { name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'Geometric' },
  { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'Display' },
  { name: 'Oswald', family: "'Oswald', sans-serif", category: 'Impact' },
  { name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Luxury Serif' },
  { name: 'Roboto', family: "'Roboto', sans-serif", category: 'Clean' },
  { name: 'DM Sans', family: "'DM Sans', sans-serif", category: 'Contemporary' },
  { name: 'Raleway', family: "'Raleway', sans-serif", category: 'Elegant' },
  { name: 'Lora', family: "'Lora', serif", category: 'Editorial Serif' },
  { name: 'Merriweather', family: "'Merriweather', serif", category: 'Classic Serif' },
  { name: 'Nunito', family: "'Nunito', sans-serif", category: 'Friendly' },
  { name: 'Open Sans', family: "'Open Sans', sans-serif", category: 'Neutral' },
  { name: 'Lato', family: "'Lato', sans-serif", category: 'Corporate' },
  { name: 'Ubuntu', family: "'Ubuntu', sans-serif", category: 'Tech' },
];

export const PRESET_COLORS = [
  '#000000',
  '#FFFFFF',
  '#F43F5E', // Rose
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#1E293B', // Slate 800
  '#334155', // Slate 700
  '#64748B', // Slate 500
  '#CBD5E1', // Slate 300
];

export const GRADIENT_PRESETS = [
  { name: 'Sunset Glow', stops: [{ color: '#F97316', offset: 0 }, { color: '#E11D48', offset: 1 }], angle: 135 },
  { name: 'Oceanic Blue', stops: [{ color: '#06B6D4', offset: 0 }, { color: '#3B82F6', offset: 1 }], angle: 135 },
  { name: 'Neon Cyber', stops: [{ color: '#8B5CF6', offset: 0 }, { color: '#EC4899', offset: 1 }], angle: 90 },
  { name: 'Emerald Luxe', stops: [{ color: '#059669', offset: 0 }, { color: '#10B981', offset: 1 }], angle: 180 },
  { name: 'Midnight Charcoal', stops: [{ color: '#0F172A', offset: 0 }, { color: '#334155', offset: 1 }], angle: 180 },
  { name: 'Golden Luxury', stops: [{ color: '#F59E0B', offset: 0 }, { color: '#B45309', offset: 1 }], angle: 45 },
  { name: 'Deep Space', stops: [{ color: '#1E1B4B', offset: 0 }, { color: '#4338CA', offset: 1 }], angle: 135 },
  { name: 'Vibrant Peach', stops: [{ color: '#FB7185', offset: 0 }, { color: '#F43F5E', offset: 1 }], angle: 90 },
];

export const SAMPLE_PHOTOS = [
  {
    name: 'Modern Architecture',
    category: 'Real Estate',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Gourmet Burger Offer',
    category: 'Food',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Minimalist Workspace',
    category: 'Business',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Fitness Training',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Urban Fashion Lifestyle',
    category: 'Shopping',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Tech Gadget Launch',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80',
  },
];

// Clean vector logos encoded as SVG Data URIs for instant zero-dependency testing
export const SAMPLE_LOGOS = [
  {
    name: 'Apex Modern Geometric',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" stroke="%233B82F6" stroke-width="8"/><polygon points="50,22 75,70 25,70" fill="%233B82F6"/></svg>`,
  },
  {
    name: 'Vortex Tech Wing',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M20 30 C 40 10, 60 10, 80 30 C 60 50, 40 50, 20 70 C 40 90, 60 90, 80 70" stroke="%23EC4899" stroke-width="8" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'Shield Security & Trust',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M50 15 L80 25 C80 60, 50 85, 50 85 C50 85, 20 60, 20 25 Z" fill="%2310B981" stroke="%23047857" stroke-width="4"/><path d="M40 50 L48 58 L62 42" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    name: 'Crown Elite Luxury',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><polygon points="20,70 80,70 85,40 65,55 50,30 35,55 15,40" fill="%23F59E0B"/><circle cx="50" cy="24" r="6" fill="%23F59E0B"/><circle cx="85" cy="34" r="5" fill="%23F59E0B"/><circle cx="15" cy="34" r="5" fill="%23F59E0B"/></svg>`,
  }
];
