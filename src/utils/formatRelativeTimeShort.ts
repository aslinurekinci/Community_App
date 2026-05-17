const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTimeShort(date: Date | number): string {
  const then = typeof date === 'number' ? date : date.getTime();
  const diff = Date.now() - then;

  if (diff < MINUTE) {
    return 'şimdi';
  }
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} dk`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} sa`;
  }
  if (diff < DAY * 2) {
    return 'Dün';
  }
  const days = Math.floor(diff / DAY);
  return `${days} gün`;
}
