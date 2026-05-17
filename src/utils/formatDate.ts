const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(date: Date | number): string {
  const then = typeof date === 'number' ? date : date.getTime();
  const diff = Date.now() - then;

  if (diff < HOUR) {
    const minutes = Math.max(1, Math.floor(diff / MINUTE));
    return `${minutes} dakika önce`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} saat önce`;
  }
  if (diff < DAY * 2) {
    return 'Dün';
  }
  const days = Math.floor(diff / DAY);
  if (days < 7) {
    return `${days} gün önce`;
  }
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(then);
}
