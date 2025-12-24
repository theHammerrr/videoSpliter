import type { ExtractionStrategy } from './ExtractionStrategy';

/**
 * Frame Extraction Plan
 *
 * Represents a calculated extraction plan with all parameters resolved and estimates computed.
 * Created from a FrameExtractionRequest after fetching video metadata and performing calculations.
 */
export interface FrameExtractionPlan {
  // Request parameters
  /**
   * Absolute path to the video file
   */
  readonly videoPath: string;

  /**
   * Absolute path to the output directory
   */
  readonly outputDirectory: string;

  /**
   * Extraction strategy from the original request
   */
  readonly strategy: ExtractionStrategy;

  /**
   * Quality parameter for JPEG compression (1-31)
   */
  readonly quality: number;

  // Calculated extraction parameters
  /**
   * Calculated frames per second for extraction
   *
   * This is derived from the strategy and video metadata.
   *
   * @example
   * Uniform strategy (100 frames, 10s video): 10 FPS
   * Interval strategy (every 2 seconds): 0.5 FPS
   * Frame-based (every 30th frame, 30fps video): 1 FPS
   */
  readonly extractionFps: number;

  /**
   * Estimated number of frames that will be extracted
   *
   * Calculated as: extractionFps * videoDuration
   */
  readonly estimatedFrameCount: number;

  /**
   * Estimated total storage size in megabytes
   *
   * Based on resolution, frame count, and quality settings.
   */
  readonly estimatedStorageMB: number;

  /**
   * Estimated processing duration in milliseconds
   *
   * Rough estimate based on frame count and typical extraction speed.
   */
  readonly estimatedDurationMs: number;

  // Video metadata
  /**
   * Video duration in seconds
   */
  readonly videoDuration: number;

  /**
   * Video frame rate (FPS)
   */
  readonly videoFps: number;

  /**
   * Video resolution
   */
  readonly videoResolution: {
    readonly width: number;
    readonly height: number;
  };
}
