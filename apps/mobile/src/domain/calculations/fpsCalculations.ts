import type { ExtractionStrategy } from '@domain/models';
import type { VideoMetadata } from '@domain/adapters';

/**
 * Calculate FPS for uniform sampling strategy
 *
 * Extracts a specific number of frames evenly distributed throughout the video.
 *
 * @param frameCount - Total number of frames to extract
 * @param duration - Video duration in seconds
 * @returns Frames per second needed for uniform sampling
 *
 * @example
 * calculateUniformSamplingFps(100, 10) // 10 FPS (100 frames over 10 seconds)
 * calculateUniformSamplingFps(30, 60) // 0.5 FPS (30 frames over 60 seconds)
 */
export function calculateUniformSamplingFps(frameCount: number, duration: number): number {
  if (duration <= 0) {
    throw new Error('Duration must be greater than 0');
  }

  if (frameCount <= 0) {
    throw new Error('Frame count must be greater than 0');
  }

  // Calculate FPS needed to extract exactly frameCount frames
  return frameCount / duration;
}

/**
 * Calculate FPS for interval-based strategy
 *
 * Extracts one frame every X seconds.
 *
 * @param intervalSeconds - Time interval between frames in seconds
 * @returns Frames per second needed for interval-based extraction
 *
 * @example
 * calculateIntervalBasedFps(2) // 0.5 FPS (one frame every 2 seconds)
 * calculateIntervalBasedFps(0.5) // 2 FPS (one frame every 0.5 seconds)
 */
export function calculateIntervalBasedFps(intervalSeconds: number): number {
  if (intervalSeconds <= 0) {
    throw new Error('Interval must be greater than 0');
  }

  // FPS is the reciprocal of the interval
  return 1 / intervalSeconds;
}

/**
 * Calculate FPS for frame-based strategy
 *
 * Extracts every Nth frame from the video.
 *
 * @param frameInterval - Extract every Nth frame (e.g., 30 = every 30th frame)
 * @param videoFps - Video's native frame rate
 * @returns Frames per second needed for frame-based extraction
 *
 * @example
 * calculateFrameBasedFps(30, 30) // 1 FPS (every 30th frame from 30fps = 1 frame/sec)
 * calculateFrameBasedFps(60, 60) // 1 FPS (every 60th frame from 60fps = 1 frame/sec)
 * calculateFrameBasedFps(15, 30) // 2 FPS (every 15th frame from 30fps = 2 frames/sec)
 */
export function calculateFrameBasedFps(frameInterval: number, videoFps: number): number {
  if (frameInterval <= 0) {
    throw new Error('Frame interval must be greater than 0');
  }

  if (videoFps <= 0) {
    throw new Error('Video FPS must be greater than 0');
  }

  // Extraction FPS = video FPS / frame interval
  return videoFps / frameInterval;
}

/**
 * Calculate extraction FPS based on strategy and video metadata
 *
 * Main dispatcher function that routes to the appropriate calculation based on strategy type.
 *
 * @param strategy - Extraction strategy
 * @param metadata - Video metadata
 * @returns Calculated frames per second for extraction
 *
 * @throws Error if strategy type is unknown or if calculations fail
 *
 * @example
 * const metadata = { duration: 10, frameRate: 30, ... };
 * calculateExtractionFps({ type: 'uniform', frameCount: 100 }, metadata) // 10 FPS
 * calculateExtractionFps({ type: 'interval', intervalSeconds: 2 }, metadata) // 0.5 FPS
 * calculateExtractionFps({ type: 'all-frames' }, metadata) // 30 FPS
 */
export function calculateExtractionFps(
  strategy: ExtractionStrategy,
  metadata: VideoMetadata,
): number {
  switch (strategy.type) {
    case 'uniform':
      return calculateUniformSamplingFps(strategy.frameCount, metadata.duration);

    case 'interval':
      return calculateIntervalBasedFps(strategy.intervalSeconds);

    case 'frame-based':
      return calculateFrameBasedFps(strategy.frameInterval, metadata.frameRate);

    case 'all-frames':
      // Extract at video's native frame rate
      return metadata.frameRate;

    case 'custom-fps':
      // Use user-specified FPS directly
      return strategy.fps;

    default:
      // TypeScript should ensure this is unreachable
      const exhaustiveCheck: never = strategy;
      throw new Error(`Unknown strategy type: ${JSON.stringify(exhaustiveCheck)}`);
  }
}

/**
 * Estimate the number of frames that will be extracted
 *
 * @param fps - Extraction frames per second
 * @param duration - Video duration in seconds
 * @returns Estimated number of frames
 *
 * @example
 * estimateFrameCount(10, 10) // 100 frames
 * estimateFrameCount(0.5, 60) // 30 frames
 */
export function estimateFrameCount(fps: number, duration: number): number {
  if (fps <= 0) {
    throw new Error('FPS must be greater than 0');
  }

  if (duration < 0) {
    throw new Error('Duration cannot be negative');
  }

  // Total frames = FPS × duration
  // Round to nearest integer since we can't extract partial frames
  return Math.round(fps * duration);
}
