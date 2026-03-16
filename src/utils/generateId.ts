import { randomUUID } from 'crypto';

/**
 * Generate a unique ID
 * Uses crypto.randomUUID if available, otherwise falls back to timestamp-based ID
 * @returns Unique string ID
 */
export function generateId(): string {
  // In browser/client environment, use crypto.randomUUID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for server-side or older environments
  return randomUUID();
}

/**
 * Generate a short unique ID
 * Useful for non-critical identifiers
 * @returns Short unique string ID
 */
export function generateShortId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${randomPart}`;
}

/**
 * Generate a prefixed unique ID
 * @param prefix - Prefix for the ID
 * @returns Prefixed unique string ID
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}_${generateId()}`;
}
