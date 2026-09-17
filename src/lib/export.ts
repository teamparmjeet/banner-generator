import { BannerDesignState, BannerElement } from '../types/editor';

/**
 * Draws the entire banner design onto an HTMLCanvasElement with high fidelity
 */
export async function renderDesignToCanvas(
  design: BannerDesignState,
  options: {
    scaleMultiplier?: number;
    format?: 'png' | 'jpeg';
    quality?: number;
  } = {}
): Promise<HTMLCanvasElement> {
  const scale = options.scaleMultiplier || 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(design.width * scale);
  canvas.height = Math.round(design.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  // Ensure all web fonts are loaded before painting
  try {
    if (document.fonts) {
      await document.fonts.ready;
    }
  } catch (e) {
    console.warn('Font loading check error', e);
  }

  ctx.scale(scale, scale);

  // 1. Render Background
  const bg = design.background;
  if (bg.type === 'transparent') {
    ctx.clearRect(0, 0, design.width, design.height);
  } else if (bg.type === 'solid') {
    ctx.fillStyle = bg.color || '#FFFFFF';
    ctx.fillRect(0, 0, design.width, design.height);
  } else if (bg.type === 'gradient' && bg.gradient && bg.gradient.stops.length > 0) {
    const angleRad = ((bg.gradient.angle || 0) * Math.PI) / 180;
    const cx = design.width / 2;
    const cy = design.height / 2;
    const length = Math.sqrt(design.width * design.width + design.height * design.height) / 2;
    const x0 = cx - Math.cos(angleRad) * length;
    const y0 = cy - Math.sin(angleRad) * length;
    const x1 = cx + Math.cos(angleRad) * length;
    const y1 = cy + Math.sin(angleRad) * length;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    bg.gradient.stops.forEach((stop) => {
      grad.addColorStop(Math.min(Math.max(stop.offset, 0), 1), stop.color);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, design.width, design.height);
  } else if (bg.type === 'image' && bg.imageSrc) {
    await renderBackgroundImage(ctx, bg.imageSrc, design.width, design.height, bg.imageOpacity ?? 1);
  } else {
    ctx.fillStyle = bg.color || '#FFFFFF';
    ctx.fillRect(0, 0, design.width, design.height);
  }

  // 2. Sort visible elements by zIndex
  const sortedElements = [...design.elements]
    .filter((el) => el.visible !== false)
    .sort((a, b) => a.zIndex - b.zIndex);

  // 3. Render each element
  for (const element of sortedElements) {
    ctx.save();
    try {
      await renderElement(ctx, element);
    } catch (err) {
      console.error(`Error rendering element ${element.id}:`, err);
    }
    ctx.restore();
  }

  return canvas;
}

async function renderBackgroundImage(
  ctx: CanvasRenderingContext2D,
  src: string,
  width: number,
  height: number,
  opacity: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = src;
  });
}

async function renderElement(ctx: CanvasRenderingContext2D, el: BannerElement): Promise<void> {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;

  // Global transform
  ctx.translate(cx, cy);
  if (el.rotation) {
    ctx.rotate((el.rotation * Math.PI) / 180);
  }
  ctx.translate(-cx, -cy);
  ctx.globalAlpha = el.opacity ?? 1;

  if (el.type === 'image') {
    await renderImageElement(ctx, el);
  } else if (el.type === 'text') {
    renderTextElement(ctx, el);
  } else if (el.type === 'shape') {
    renderShapeElement(ctx, el);
  } else if (el.type === 'button') {
    renderButtonElement(ctx, el);
  } else if (el.type === 'overlay') {
    renderOverlayElement(ctx, el);
  } else if (el.type === 'badge') {
    renderBadgeElement(ctx, el);
  }
}

async function renderImageElement(ctx: CanvasRenderingContext2D, el: any): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();

      // Shadow
      if (el.shadow && el.shadow.enabled) {
        ctx.shadowColor = el.shadow.color;
        ctx.shadowBlur = el.shadow.blur;
        ctx.shadowOffsetX = el.shadow.offsetX;
        ctx.shadowOffsetY = el.shadow.offsetY;
      }

      // Filter
      if (el.filters) {
        const f = el.filters;
        ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) invert(${f.invert}%)`;
      }

      // Border radius clipping
      if (el.borderRadius && el.borderRadius > 0) {
        ctx.beginPath();
        drawRoundedRectPath(ctx, el.x, el.y, el.width, el.height, el.borderRadius);
        ctx.clip();
      }

      // Draw image
      ctx.drawImage(img, el.x, el.y, el.width, el.height);

      // Border stroke
      if (el.borderWidth && el.borderWidth > 0 && el.borderColor) {
        ctx.filter = 'none';
        ctx.strokeStyle = el.borderColor;
        ctx.lineWidth = el.borderWidth;
        if (el.borderRadius && el.borderRadius > 0) {
          ctx.beginPath();
          drawRoundedRectPath(ctx, el.x, el.y, el.width, el.height, el.borderRadius);
          ctx.stroke();
        } else {
          ctx.strokeRect(el.x, el.y, el.width, el.height);
        }
      }

      ctx.restore();
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = el.src;
  });
}

function renderTextElement(ctx: CanvasRenderingContext2D, el: any) {
  ctx.save();

  // Shadow
  if (el.shadow && el.shadow.enabled) {
    ctx.shadowColor = el.shadow.color;
    ctx.shadowBlur = el.shadow.blur;
    ctx.shadowOffsetX = el.shadow.offsetX;
    ctx.shadowOffsetY = el.shadow.offsetY;
  }

  // Background Box
  if (el.backgroundColor) {
    const pad = el.backgroundPadding || 6;
    const rad = el.backgroundRadius || 4;
    ctx.fillStyle = el.backgroundColor;
    ctx.beginPath();
    drawRoundedRectPath(ctx, el.x - pad, el.y - pad, el.width + pad * 2, el.height + pad * 2, rad);
    ctx.fill();
  }

  const fontStyle = el.fontStyle === 'italic' ? 'italic ' : '';
  const fontWeight = el.fontWeight || 400;
  const fontSize = el.fontSize || 24;
  const fontFamily = el.fontFamily || 'Inter, sans-serif';

  ctx.font = `${fontStyle}${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  let textToRender = el.text;
  if (el.textTransform === 'uppercase') {
    textToRender = textToRender.toUpperCase();
  } else if (el.textTransform === 'lowercase') {
    textToRender = textToRender.toLowerCase();
  } else if (el.textTransform === 'capitalize') {
    textToRender = textToRender.replace(/\b\w/g, (c: string) => c.toUpperCase());
  }

  // Multi-line support
  const lines = textToRender.split('\n');
  const lineHeight = fontSize * (el.lineHeight || 1.2);

  lines.forEach((line: string, index: number) => {
    const yPos = el.y + index * lineHeight;
    let xPos = el.x;

    if (el.textAlign === 'center') {
      ctx.textAlign = 'center';
      xPos = el.x + el.width / 2;
    } else if (el.textAlign === 'right') {
      ctx.textAlign = 'right';
      xPos = el.x + el.width;
    } else {
      ctx.textAlign = 'left';
      xPos = el.x;
    }

    // Stroke
    if (el.strokeWidth && el.strokeWidth > 0 && el.strokeColor) {
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.strokeText(line, xPos, yPos);
    }

    // Fill
    ctx.fillStyle = el.color || '#000000';
    ctx.fillText(line, xPos, yPos);

    // Underline
    if (el.textDecoration === 'underline') {
      const metrics = ctx.measureText(line);
      const textWidth = metrics.width;
      let startX = xPos;
      if (el.textAlign === 'center') startX = xPos - textWidth / 2;
      if (el.textAlign === 'right') startX = xPos - textWidth;
      ctx.fillRect(startX, yPos + fontSize + 2, textWidth, Math.max(1, fontSize / 14));
    }
  });

  ctx.restore();
}

function renderShapeElement(ctx: CanvasRenderingContext2D, el: any) {
  ctx.save();

  if (el.shadow && el.shadow.enabled) {
    ctx.shadowColor = el.shadow.color;
    ctx.shadowBlur = el.shadow.blur;
    ctx.shadowOffsetX = el.shadow.offsetX;
    ctx.shadowOffsetY = el.shadow.offsetY;
  }

  ctx.fillStyle = el.fillColor || '#3B82F6';
  ctx.strokeStyle = el.borderColor || 'transparent';
  ctx.lineWidth = el.borderWidth || 0;

  ctx.beginPath();
  switch (el.shapeType) {
    case 'rectangle':
      ctx.rect(el.x, el.y, el.width, el.height);
      break;
    case 'rounded-rectangle':
      drawRoundedRectPath(ctx, el.x, el.y, el.width, el.height, el.borderRadius || 16);
      break;
    case 'circle': {
      const rx = el.width / 2;
      const ry = el.height / 2;
      ctx.ellipse(el.x + rx, el.y + ry, rx, ry, 0, 0, Math.PI * 2);
      break;
    }
    case 'triangle':
      ctx.moveTo(el.x + el.width / 2, el.y);
      ctx.lineTo(el.x + el.width, el.y + el.height);
      ctx.lineTo(el.x, el.y + el.height);
      ctx.closePath();
      break;
    case 'line':
      ctx.moveTo(el.x, el.y + el.height / 2);
      ctx.lineTo(el.x + el.width, el.y + el.height / 2);
      break;
    case 'star': {
      drawStar(ctx, el.x + el.width / 2, el.y + el.height / 2, 5, el.width / 2, el.width / 4);
      break;
    }
    case 'arrow':
      drawArrow(ctx, el.x, el.y, el.width, el.height);
      break;
    default:
      ctx.rect(el.x, el.y, el.width, el.height);
  }

  if (el.shapeType !== 'line') {
    ctx.fill();
  }
  if (el.borderWidth && el.borderWidth > 0) {
    ctx.stroke();
  }

  ctx.restore();
}

function renderButtonElement(ctx: CanvasRenderingContext2D, el: any) {
  ctx.save();

  if (el.shadow && el.shadow.enabled) {
    ctx.shadowColor = el.shadow.color;
    ctx.shadowBlur = el.shadow.blur;
    ctx.shadowOffsetX = el.shadow.offsetX;
    ctx.shadowOffsetY = el.shadow.offsetY;
  }

  // Background
  ctx.fillStyle = el.backgroundColor || '#2563EB';
  ctx.beginPath();
  drawRoundedRectPath(ctx, el.x, el.y, el.width, el.height, el.borderRadius ?? 8);
  ctx.fill();

  // Border
  if (el.borderWidth && el.borderWidth > 0 && el.borderColor) {
    ctx.strokeStyle = el.borderColor;
    ctx.lineWidth = el.borderWidth;
    ctx.stroke();
  }

  // Text
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = el.textColor || '#FFFFFF';
  ctx.font = `${el.fontWeight || 600} ${el.fontSize || 16}px ${el.fontFamily || 'Inter, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.text || 'BUTTON', el.x + el.width / 2, el.y + el.height / 2);

  ctx.restore();
}

function renderOverlayElement(ctx: CanvasRenderingContext2D, el: any) {
  ctx.save();
  ctx.globalAlpha = el.opacity ?? 0.7;

  if (el.overlayType === 'black') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  } else if (el.overlayType === 'white') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  } else if (el.overlayType === 'linear-gradient-lr') {
    const grad = ctx.createLinearGradient(el.x, el.y, el.x + el.width, el.y);
    grad.addColorStop(0, el.color1 || 'rgba(0,0,0,0.85)');
    grad.addColorStop(1, el.color2 || 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
  } else {
    // linear-gradient-tb or custom
    const grad = ctx.createLinearGradient(el.x, el.y, el.x, el.y + el.height);
    grad.addColorStop(0, el.color1 || 'rgba(0,0,0,0.85)');
    grad.addColorStop(1, el.color2 || 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
  }

  ctx.fillRect(el.x, el.y, el.width, el.height);
  ctx.restore();
}

function renderBadgeElement(ctx: CanvasRenderingContext2D, el: any) {
  ctx.save();
  ctx.fillStyle = el.backgroundColor || '#4F46E5';
  ctx.beginPath();
  drawRoundedRectPath(ctx, el.x, el.y, el.width, el.height, el.badgeStyle === 'pill' ? el.height / 2 : 6);
  ctx.fill();

  ctx.fillStyle = el.textColor || '#FFFFFF';
  ctx.font = `${el.fontWeight || 700} ${el.fontSize || 13}px ${el.fontFamily || 'Inter, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.text, el.x + el.width / 2, el.y + el.height / 2);

  ctx.restore();
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const headW = w * 0.4;
  const stemH = h * 0.4;
  const stemY = y + (h - stemH) / 2;

  ctx.moveTo(x, stemY);
  ctx.lineTo(x + w - headW, stemY);
  ctx.lineTo(x + w - headW, y);
  ctx.lineTo(x + w, y + h / 2);
  ctx.lineTo(x + w - headW, y + h);
  ctx.lineTo(x + w - headW, stemY + stemH);
  ctx.lineTo(x, stemY + stemH);
  ctx.closePath();
}

/**
 * Downloads canvas as PNG or JPG file
 */
export async function downloadBannerImage(
  design: BannerDesignState,
  format: 'png' | 'jpeg',
  qualityMultiplier: number = 1,
  filename: string = 'banner'
): Promise<void> {
  const canvas = await renderDesignToCanvas(design, { scaleMultiplier: qualityMultiplier });
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dataUrl = canvas.toDataURL(mimeType, 0.95);

  const link = document.createElement('a');
  link.download = `${filename || 'banner'}.${format === 'jpeg' ? 'jpg' : 'png'}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates downloadable standalone HTML clickable banner package
 */
export async function downloadClickableHtmlBanner(
  design: BannerDesignState,
  filename: string = 'clickable-banner'
): Promise<void> {
  const canvas = await renderDesignToCanvas(design, { scaleMultiplier: 1 });
  const bgDataUrl = canvas.toDataURL('image/png');

  // Find clickable elements
  const clickableElements = design.elements.filter((el) => el.url && el.url.trim().length > 0 && el.visible !== false);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${design.name || 'Banner'}</title>
  <style>
    body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #111; }
    .banner-container {
      position: relative;
      width: ${design.width}px;
      height: ${design.height}px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .banner-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
    }
    .click-target {
      position: absolute;
      display: block;
      cursor: pointer;
      text-decoration: none;
      z-index: 10;
      transition: outline 0.15s ease;
    }
    .click-target:hover {
      outline: 2px solid rgba(59, 130, 246, 0.8);
    }
  </style>
</head>
<body>
  <div class="banner-container">
    <img src="${bgDataUrl}" class="banner-bg" alt="${design.name || 'Banner'}" />
    ${clickableElements
      .map(
        (el) =>
          `<a href="${el.url}" target="_blank" rel="noopener noreferrer" class="click-target" style="left:${el.x}px; top:${el.y}px; width:${el.width}px; height:${el.height}px;" title="${el.name} (${el.url})"></a>`
      )
      .join('\n    ')}
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}.html`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
