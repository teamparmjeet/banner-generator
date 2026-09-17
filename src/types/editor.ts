export type ElementType = 'text' | 'image' | 'shape' | 'button' | 'overlay' | 'badge';

export type ShapeType =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'star'
  | 'arrow'
  | 'polygon';

export type OverlayType =
  | 'black'
  | 'white'
  | 'linear-gradient-tb'
  | 'linear-gradient-lr'
  | 'radial-gradient'
  | 'custom-gradient';

export interface GradientStop {
  color: string;
  offset: number; // 0 to 1
}

export interface GradientConfig {
  enabled: boolean;
  type: 'linear' | 'radial';
  angle: number; // degrees (0 to 360)
  stops: GradientStop[];
}

export interface ShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface ImageFilters {
  brightness: number; // 0 - 200 (100 is normal)
  contrast: number; // 0 - 200 (100 is normal)
  saturation: number; // 0 - 200 (100 is normal)
  blur: number; // 0 - 20px
  grayscale: number; // 0 - 100%
  sepia: number; // 0 - 100%
  invert: number; // 0 - 100%
}

export interface BaseElement {
  id: string;
  name: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  opacity: number; // 0 to 1
  zIndex: number;
  visible: boolean;
  locked: boolean;
  url?: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string; // 300, 400, 600, 700, 900, 'bold', 'normal'
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number; // px
  lineHeight: number; // multiplier (e.g. 1.2)
  gradient?: GradientConfig;
  shadow?: ShadowConfig;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundRadius?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  originalWidth: number;
  originalHeight: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters: ImageFilters;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadow?: ShadowConfig;
  objectFit: 'contain' | 'cover' | 'fill';
  isLogo?: boolean;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fillColor: string;
  gradient?: GradientConfig;
  borderColor: string;
  borderWidth: number;
  borderRadius?: number; // for rectangles
  shadow?: ShadowConfig;
}

export interface ButtonElement extends BaseElement {
  type: 'button';
  text: string;
  textColor: string;
  backgroundColor: string;
  gradient?: GradientConfig;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  paddingX: number;
  paddingY: number;
  shadow?: ShadowConfig;
  hasIcon?: boolean;
  iconPosition?: 'left' | 'right';
  linkUrl?: string;
}

export interface OverlayElement extends BaseElement {
  type: 'overlay';
  overlayType: OverlayType;
  color1: string;
  color2: string;
  direction?: 'to-bottom' | 'to-right' | 'to-bottom-right' | 'radial';
  gradientStops: GradientStop[];
}

export interface BadgeElement extends BaseElement {
  type: 'badge';
  text: string;
  badgeStyle: 'pill' | 'ribbon' | 'tag' | 'circle';
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: number | string;
  fontFamily: string;
}

export type BannerElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | ButtonElement
  | OverlayElement
  | BadgeElement;

export type NewBannerElement =
  | Omit<TextElement, 'id' | 'zIndex'>
  | Omit<ImageElement, 'id' | 'zIndex'>
  | Omit<ShapeElement, 'id' | 'zIndex'>
  | Omit<ButtonElement, 'id' | 'zIndex'>
  | Omit<OverlayElement, 'id' | 'zIndex'>
  | Omit<BadgeElement, 'id' | 'zIndex'>;

export interface SavedProject {
  id: string;
  name: string;
  design: BannerDesignState;
  updatedAt: string;
}

export interface CanvasBackground {
  type: 'solid' | 'gradient' | 'image' | 'transparent';
  color: string;
  gradient?: GradientConfig;
  imageSrc?: string;
  imageOpacity?: number;
}

export interface BannerPreset {
  id: string;
  name: string;
  category: 'social' | 'video' | 'web' | 'marketing';
  width: number;
  height: number;
  description: string;
  iconName: string;
}

export interface BannerDesignState {
  id: string;
  name: string;
  width: number;
  height: number;
  background: CanvasBackground;
  elements: BannerElement[];
  createdAt: number;
  updatedAt: number;
}

export interface BannerTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  previewThumbnail?: string;
  design: BannerDesignState;
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
}
