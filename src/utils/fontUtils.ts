// Cache for font measurements to improve performance
const fontMeasurementCache = new Map<string, number>();

export function calculateFontSizeToFit(
  text: string, 
  width: number, 
  options: {
    fontFamily?: string;
    isBold?: boolean;
    isItalic?: boolean;
    padding?: number;
  } = {}
): number {
  const { 
    fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    isBold = false,
    isItalic = false,
    padding = 16 // Account for padding in the text container
  } = options;
  
  // Create a cache key
  const cacheKey = `${text}|${width}|${fontFamily}|${isBold}|${isItalic}|${padding}`;
  if (fontMeasurementCache.has(cacheKey)) {
    return fontMeasurementCache.get(cacheKey)!;
  }
  
  const testSize = 100;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return testSize;
  
  // Get the longest line to measure
  const lines = text.split('\n');
  const longestLine = lines.reduce((a, b) => (b.length > a.length ? b : a), '');
  
  // If text is empty, return a reasonable default
  if (!longestLine.trim()) {
    const result = Math.min(32, width / 4);
    fontMeasurementCache.set(cacheKey, result);
    return result;
  }
  
  // Build the font string with proper formatting
  const fontWeight = isBold ? 'bold' : 'normal';
  const fontStyle = isItalic ? 'italic' : 'normal';
  ctx.font = `${fontStyle} ${fontWeight} ${testSize}px ${fontFamily}`;
  
  // Measure the text width
  const textMetrics = ctx.measureText(longestLine);
  const textWidth = textMetrics.width;
  if (textWidth === 0) return testSize;
  
  // Calculate the font size, accounting for padding and a safety margin
  const availableWidth = width - padding;
  const calculatedSize = (testSize * availableWidth) / textWidth;
  
  // Apply some constraints to keep font sizes reasonable
  const minSize = 8;
  const maxSize = Math.min(200, width / 2); // Don't let font be too big relative to container
  
  const result = Math.max(minSize, Math.min(maxSize, calculatedSize));
  
  // Cache the result (limit cache size to prevent memory leaks)
  if (fontMeasurementCache.size > 1000) {
    const entries = Array.from(fontMeasurementCache.keys());
    if (entries.length > 0) {
      fontMeasurementCache.delete(entries[0]);
    }
  }
  fontMeasurementCache.set(cacheKey, result);
  
  return result;
}
