/**
 * Format a date as DD.MM.YYYY HH:MM
 * @param date - Date object or timestamp
 * @returns Formatted date string
 */
export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Format a date as DD.MM.YYYY
 * @param date - Date object or timestamp
 * @returns Formatted date string
 */
export function formatDateShort(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}.${month}.${year}`;
}

/**
 * Format a date as HH:MM
 * @param date - Date object or timestamp
 * @returns Formatted time string
 */
export function formatTimeShort(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}
