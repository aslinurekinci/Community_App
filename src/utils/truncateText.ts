export function truncateText(text: string, maxLines = 2, charsPerLine = 55): string {
  const maxChars = maxLines * charsPerLine;
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars).trimEnd()}...`;
}
