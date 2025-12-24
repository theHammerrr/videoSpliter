/**
 * Extraction strategy types for frame extraction
 *
 * Defines different ways to sample frames from a video:
 * - uniform: Extract N frames evenly distributed
 * - interval: Extract one frame every X seconds
 * - frame-based: Extract every Nth frame
 * - all-frames: Extract every single frame
 * - custom-fps: Extract at specific FPS
 */

/**
 * Uniform Sampling Strategy
 *
 * Extracts a specific number of frames evenly distributed throughout the video.
 *
 * @example
 * // Extract exactly 100 frames from a 10-second video
 * { type: 'uniform', frameCount: 100 }
 * // Result: 1 frame every 0.1 seconds (10 FPS)
 */
export interface UniformSamplingStrategy {
  readonly type: 'uniform';
  /** Total number of frames to extract */
  readonly frameCount: number;
}

/**
 * Interval-Based Strategy
 *
 * Extracts one frame every X seconds.
 *
 * @example
 * // Extract one frame every 2 seconds
 * { type: 'interval', intervalSeconds: 2 }
 * // Result: 0.5 FPS
 */
export interface IntervalBasedStrategy {
  readonly type: 'interval';
  /** Time interval in seconds between frames */
  readonly intervalSeconds: number;
}

/**
 * Frame-Based Strategy
 *
 * Extracts every Nth frame from the video.
 * Requires video metadata to calculate extraction FPS.
 *
 * @example
 * // Extract every 30th frame from a 30fps video
 * { type: 'frame-based', frameInterval: 30 }
 * // Result: 1 FPS (one frame per second)
 */
export interface FrameBasedStrategy {
  readonly type: 'frame-based';
  /** Extract every Nth frame (e.g., 30 = every 30th frame) */
  readonly frameInterval: number;
}

/**
 * All Frames Strategy
 *
 * Extracts every single frame from the video at its native frame rate.
 *
 * @example
 * // Extract all frames from a 30fps video
 * { type: 'all-frames' }
 * // Result: 30 FPS (all frames)
 */
export interface AllFramesStrategy {
  readonly type: 'all-frames';
}

/**
 * Custom Frame Rate Strategy
 *
 * Extracts frames at a user-specified FPS.
 *
 * @example
 * // Extract at 5 frames per second
 * { type: 'custom-fps', fps: 5 }
 * // Result: 5 FPS
 */
export interface CustomFrameRateStrategy {
  readonly type: 'custom-fps';
  /** Frames per second to extract */
  readonly fps: number;
}

/**
 * Extraction Strategy (Discriminated Union)
 *
 * Represents all possible frame extraction strategies.
 * Use the `type` field to discriminate between strategies.
 */
export type ExtractionStrategy =
  | UniformSamplingStrategy
  | IntervalBasedStrategy
  | FrameBasedStrategy
  | AllFramesStrategy
  | CustomFrameRateStrategy;

/**
 * Type guard to check if a strategy is UniformSamplingStrategy
 */
export function isUniformSampling(
  strategy: ExtractionStrategy,
): strategy is UniformSamplingStrategy {
  return strategy.type === 'uniform';
}

/**
 * Type guard to check if a strategy is IntervalBasedStrategy
 */
export function isIntervalBased(strategy: ExtractionStrategy): strategy is IntervalBasedStrategy {
  return strategy.type === 'interval';
}

/**
 * Type guard to check if a strategy is FrameBasedStrategy
 */
export function isFrameBased(strategy: ExtractionStrategy): strategy is FrameBasedStrategy {
  return strategy.type === 'frame-based';
}

/**
 * Type guard to check if a strategy is AllFramesStrategy
 */
export function isAllFrames(strategy: ExtractionStrategy): strategy is AllFramesStrategy {
  return strategy.type === 'all-frames';
}

/**
 * Type guard to check if a strategy is CustomFrameRateStrategy
 */
export function isCustomFrameRate(
  strategy: ExtractionStrategy,
): strategy is CustomFrameRateStrategy {
  return strategy.type === 'custom-fps';
}
