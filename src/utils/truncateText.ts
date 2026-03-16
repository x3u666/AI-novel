/**
 * Truncate text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  // If maxLength is very small, just return truncated text
  if (maxLength <= suffix.length) {
    return text.slice(0, maxLength);
  }
  
  // Truncate and add suffix
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Truncate text at word boundary
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text at word boundary
 */
export function truncateAtWord(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.5) {
    return truncated.slice(0, lastSpace).trim() + suffix;
  }
  
  return truncated.trim() + suffix;
}
