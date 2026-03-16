/**
 * Format seconds to HH:MM:SS
 * @param seconds - Total seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  if (seconds < 0 || !isFinite(seconds)) {
    return '00:00:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(secs).padStart(2, '0'),
  ].join(':');
}

/**
 * Format seconds to MM:SS
 * @param seconds - Total seconds
 * @returns Formatted time string
 */
export function formatTimeShort(seconds: number): string {
  if (seconds < 0 || !isFinite(seconds)) {
    return '00:00';
  }
  
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format timestamp to HH:MM (time of day)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string
 */
export function formatTimestamp(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Format milliseconds to HH:MM:SS
 * @param milliseconds - Total milliseconds
 * @returns Formatted time string
 */
export function formatTimeFromMs(milliseconds: number): string {
  return formatTime(Math.floor(milliseconds / 1000));
}

/**
 * Parse HH:MM:SS to seconds
 * @param timeString - Time string in HH:MM:SS format
 * @returns Total seconds
 */
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  
  return 0;
}
