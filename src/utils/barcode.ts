// ISO/IEC 15417 Code 128 Encoding Patterns (0 - 106)
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

const START_B = 104;
const STOP = 106;

export interface Code128BarBlock {
  start: number;
  width: number;
}

/**
 * Encodes ASCII string into ISO/IEC 15417 Code 128 boolean module array and bar blocks
 */
export function encodeCode128(text: string): {
  modules: boolean[];
  width: number;
  text: string;
  barBlocks: Code128BarBlock[];
} {
  const cleanText = (text || 'SAMPLE-001').trim();
  const patternIndices: number[] = [START_B];
  let checkSum = START_B;

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    let symbolVal = charCode - 32;
    if (symbolVal < 0 || symbolVal > 94) {
      symbolVal = 0; // fallback to space
    }
    patternIndices.push(symbolVal);
    checkSum += symbolVal * (i + 1);
  }

  const checkSumIndex = checkSum % 103;
  patternIndices.push(checkSumIndex);
  patternIndices.push(STOP);

  // Convert patterns to boolean modules
  const modules: boolean[] = [];
  // Quiet zone at start (10 modules)
  for (let q = 0; q < 10; q++) modules.push(false);

  for (const idx of patternIndices) {
    const patternStr = CODE128_PATTERNS[idx];
    if (!patternStr) continue;

    let isBar = true;
    for (let p = 0; p < patternStr.length; p++) {
      const width = parseInt(patternStr[p], 10);
      for (let w = 0; w < width; w++) {
        modules.push(isBar);
      }
      isBar = !isBar;
    }
  }

  // Quiet zone at end (10 modules)
  for (let q = 0; q < 10; q++) modules.push(false);

  // Calculate bar blocks
  const barBlocks: Code128BarBlock[] = [];
  let currentStart: number | null = null;

  for (let i = 0; i < modules.length; i++) {
    if (modules[i]) {
      if (currentStart === null) {
        currentStart = i;
      }
    } else {
      if (currentStart !== null) {
        barBlocks.push({ start: currentStart, width: i - currentStart });
        currentStart = null;
      }
    }
  }
  if (currentStart !== null) {
    barBlocks.push({ start: currentStart, width: modules.length - currentStart });
  }

  return {
    modules,
    width: modules.length,
    text: cleanText,
    barBlocks
  };
}

/**
 * Generate full SVG string for Code 128 barcode
 */
export function generateCode128SvgString(
  text: string,
  height = 42,
  barWidth = 1.5,
  showText = true,
  darkColor = '#000000',
  lightColor = '#FFFFFF'
): string {
  const encoded = encodeCode128(text);
  const totalSvgWidth = encoded.width * barWidth;
  const barHeight = showText ? height - 14 : height;

  const rects = encoded.barBlocks
    .map(b => `<rect x="${b.start * barWidth}" y="0" width="${b.width * barWidth}" height="${barHeight}" fill="${darkColor}" />`)
    .join('');

  const textElem = showText
    ? `<text x="${totalSvgWidth / 2}" y="${height - 2}" text-anchor="middle" fill="${darkColor}" font-size="10" font-family="'Courier New', monospace" font-weight="bold" letter-spacing="1.5">*${encoded.text}*</text>`
    : '';

  return `<svg width="${totalSvgWidth}" height="${height}" viewBox="0 0 ${totalSvgWidth} ${height}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="${totalSvgWidth}" height="${height}" fill="${lightColor}" />${rects}${textElem}</svg>`;
}

/**
 * Convert Code 128 to PNG Data URL using HTML Canvas
 */
export async function generateCode128PngDataUrl(
  text: string,
  height = 50,
  barWidth = 2,
  showText = true
): Promise<string> {
  const encoded = encodeCode128(text);
  const canvas = document.createElement('canvas');
  const totalWidth = encoded.width * barWidth;
  canvas.width = totalWidth;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, totalWidth, height);

  const barHeight = showText ? height - 16 : height;
  ctx.fillStyle = '#000000';

  for (const block of encoded.barBlocks) {
    ctx.fillRect(block.start * barWidth, 0, block.width * barWidth, barHeight);
  }

  if (showText) {
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`*${encoded.text}*`, totalWidth / 2, height - 3);
  }

  return canvas.toDataURL('image/png');
}
