import type { FrameInfo } from '@domain/models';

/**
 * Calculate timestamp for a specific frame
 *
 * Given a frame number and extraction FPS, calculates when in the video
 * that frame was extracted from.
 *
 * @param frameNumber - Frame index (0-indexed)
 * @param fps - Extraction frames per second
 * @returns Timestamp in seconds
 *
 * @example
 * calculateFrameTimestamp(0, 10) // 0.0 (first frame at start)
 * calculateFrameTimestamp(10, 10) // 1.0 (10th frame at 1 second when extracting at 10 FPS)
 * calculateFrameTimestamp(5, 0.5) // 10.0 (5th frame at 10 seconds when extracting at 0.5 FPS)
 */
export function calculateFrameTimestamp(frameNumber: number, fps: number): number {
  if (frameNumber < 0) {
    throw new Error('Frame number cannot be negative');
  }

  if (fps <= 0) {
    throw new Error('FPS must be greater than 0');
  }

  // Timestamp = frame number / FPS
  // This gives the time position in the video
  return frameNumber / fps;
}

/**
 * Generate FrameInfo array from output paths and extraction FPS
 *
 * Transforms the adapter result (array of file paths) into domain FrameInfo objects
 * with calculated timestamps and frame numbers.
 *
 * @param outputPaths - Array of file paths from adapter
 * @param fps - Extraction frames per second used
 * @returns Array of FrameInfo objects
 *
 * @example
 * const paths = ['/path/frame_0001.jpg', '/path/frame_0002.jpg'];
 * const frames = generateFrameInfos(paths, 10);
 * // Result:
 * // [
 * //   { frameNumber: 0, timestamp: 0.0, path: '/path/frame_0001.jpg' },
 * //   { frameNumber: 1, timestamp: 0.1, path: '/path/frame_0002.jpg' }
 * // ]
 */
export function generateFrameInfos(outputPaths: readonly string[], fps: number): FrameInfo[] {
  if (fps <= 0) {
    throw new Error('FPS must be greater than 0');
  }

  return outputPaths.map((path, index) => ({
    frameNumber: index,
    timestamp: calculateFrameTimestamp(index, fps),
    path,
  }));
}

/**
 * Calculate actual storage size from file paths (in MB)
 *
 * Note: This is a placeholder that returns 0.
 * In a real implementation, this would read file sizes from the filesystem.
 * For now, we rely on estimates since this is pure domain logic without IO.
 *
 * @param _paths - Array of file paths
 * @returns Storage size in megabytes (always 0 for now)
 */
export function calculateActualStorageSize(_paths: readonly string[]): number {
  // Placeholder: In a real implementation, this would:
  // 1. Read each file size from filesystem
  // 2. Sum all file sizes
  // 3. Convert to MB
  //
  // However, this requires filesystem access which breaks the
  // pure domain logic constraint. We'll leave this as 0 for now
  // and compute it in the adapter or service layer if needed.
  return 0;
}
