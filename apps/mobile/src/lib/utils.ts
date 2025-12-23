/**
 * Utility functions for the VideoSpliter app
 */

/**
 * Simple example utility function
 * @param value - The value to check
 * @returns true if the value is defined and not null
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Format a duration in milliseconds to MM:SS format
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted string in MM:SS format
 */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
