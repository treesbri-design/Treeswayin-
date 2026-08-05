export interface CardTheme {
  id: string;
  name: string;
  gradientCss: string;
  bgColors: [string, string];
  textColor: string;
  accentColor: string;
  subTextColor: string;
  borderColor: string;
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'navy-gold',
    name: 'Royal Navy',
    gradientCss: 'from-[#1E3A8A] via-[#1E293B] to-[#0F172A]',
    bgColors: ['#1E3A8A', '#0F172A'],
    textColor: '#FFFFFF',
    accentColor: '#D4AF37',
    subTextColor: '#93C5FD',
    borderColor: '#3B82F6'
  },
  {
    id: 'sunset',
    name: 'Heavenly Sunset',
    gradientCss: 'from-[#831843] via-[#701A75] to-[#4C1D95]',
    bgColors: ['#831843', '#4C1D95'],
    textColor: '#FFFFFF',
    accentColor: '#FDE047',
    subTextColor: '#F472B6',
    borderColor: '#EC4899'
  },
  {
    id: 'emerald',
    name: 'Deep Emerald',
    gradientCss: 'from-[#064E3B] via-[#047857] to-[#022C22]',
    bgColors: ['#064E3B', '#022C22'],
    textColor: '#FFFFFF',
    accentColor: '#FACC15',
    subTextColor: '#6EE7B7',
    borderColor: '#10B981'
  },
  {
    id: 'midnight',
    name: 'Midnight Grace',
    gradientCss: 'from-[#0B132B] via-[#1C2541] to-[#0B0F19]',
    bgColors: ['#0B132B', '#0B0F19'],
    textColor: '#F8FAFC',
    accentColor: '#E2E8F0',
    subTextColor: '#94A3B8',
    borderColor: '#64748B'
  },
  {
    id: 'warm-amber',
    name: 'Golden Glow',
    gradientCss: 'from-[#78350F] via-[#B45309] to-[#451A03]',
    bgColors: ['#78350F', '#451A03'],
    textColor: '#FFFBEB',
    accentColor: '#FDE047',
    subTextColor: '#FCD34D',
    borderColor: '#F59E0B'
  },
  {
    id: 'parchment',
    name: 'Classic Parchment',
    gradientCss: 'from-[#FDFBF7] via-[#F5EFE6] to-[#E8DEC8]',
    bgColors: ['#FDFBF7', '#E8DEC8'],
    textColor: '#292524',
    accentColor: '#B45309',
    subTextColor: '#78350F',
    borderColor: '#D97706'
  }
];

/**
 * Generate a high-resolution 1080x1080 image card on HTML5 Canvas
 */
export function generateVerseCardCanvas(
  verseText: string,
  reference: string,
  theme: CardTheme
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Draw Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, theme.bgColors[0]);
  grad.addColorStop(1, theme.bgColors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Decorative Outer Border
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.4;
  const padding = 50;
  ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

  // Inner border
  ctx.lineWidth = 1;
  ctx.strokeRect(padding + 12, padding + 12, width - (padding + 12) * 2, height - (padding + 12) * 2);
  ctx.globalAlpha = 1.0;

  // 3. Top Cross Icon
  ctx.fillStyle = theme.accentColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText('✝', width / 2, 160);

  // 4. Wrap Verse Text
  let fontSize = 44;
  if (verseText.length > 250) fontSize = 34;
  else if (verseText.length > 150) fontSize = 38;

  ctx.font = `italic ${fontSize}px Georgia, serif`;
  ctx.fillStyle = theme.textColor;

  const maxWidth = width - 240;
  const words = `"${verseText}"`.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  // Center vertically
  const lineHeight = fontSize * 1.45;
  const totalTextHeight = lines.length * lineHeight;
  let startY = (height / 2) - (totalTextHeight / 2) - 30;

  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + (index * lineHeight));
  });

  // 5. Divider Line
  const dividerY = startY + (lines.length * lineHeight) + 40;
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 100, dividerY);
  ctx.lineTo(width / 2 + 100, dividerY);
  ctx.stroke();

  // 6. Scripture Reference
  ctx.fillStyle = theme.accentColor;
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText(reference, width / 2, dividerY + 60);

  // 7. Watermark
  ctx.fillStyle = theme.subTextColor;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('FaithPath AI • Bible Study & Daily Prayer', width / 2, height - 100);

  return canvas;
}

/**
 * Attempt native sharing of generated verse image file via Web Share API
 */
export async function shareVerseCardImage(
  verseText: string,
  reference: string,
  theme: CardTheme
): Promise<boolean> {
  try {
    const canvas = generateVerseCardCanvas(verseText, reference, theme);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        const cleanFilename = `FaithPath_Verse_${reference.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        const file = new File([blob], cleanFilename, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: reference,
              text: `"${verseText}" — ${reference}`
            });
            resolve(true);
            return;
          } catch (e) {
            // Native share dismissed or error
          }
        }
        resolve(false);
      }, 'image/png');
    });
  } catch (e) {
    return false;
  }
}

/**
 * Trigger immediate browser file download of the card as PNG
 */
export function downloadVerseCardImage(
  verseText: string,
  reference: string,
  theme: CardTheme
) {
  const canvas = generateVerseCardCanvas(verseText, reference, theme);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  const cleanFilename = `FaithPath_Verse_${reference.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  link.download = cleanFilename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
