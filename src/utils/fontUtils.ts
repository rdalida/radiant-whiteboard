export function calculateFontSizeToFit(text: string, width: number, fontFamily = 'sans-serif'): number {
  const testSize = 100;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return testSize;
  const longestLine = text.split('\n').reduce((a, b) => (b.length > a.length ? b : a), '');
  ctx.font = `${testSize}px ${fontFamily}`;
  const textWidth = ctx.measureText(longestLine || ' ').width;
  if (textWidth === 0) return testSize;
  return (testSize * width) / textWidth;
}
