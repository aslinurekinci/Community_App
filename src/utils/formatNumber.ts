export function formatCount(value: number): string {
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}k`;
  }
  return String(value);
}
