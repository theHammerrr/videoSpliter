import type { ExtractionStrategy } from './ExtractionStrategy';

/**
 * Frame Extraction Request
 *
 * Domain model representing a user's request to extract frames from a video.
 * This is the input to the FrameExtractionService.
 */
export interface FrameExtractionRequest {
  /**
   * Absolute path to the video file
   *
   * @example
   * '/storage/emulated/0/DCIM/video.mp4'
   */
  readonly videoPath: string;

  /**
   * Absolute path to the output directory for extracted frames
   *
   * @example
   * '/storage/emulated/0/VideoSpliter/frames'
   */
  readonly outputDirectory: string;

  /**
   * Extraction strategy defining how frames should be sampled
   *
   * @example
   * { type: 'uniform', frameCount: 100 }
   * { type: 'interval', intervalSeconds: 2 }
   * { type: 'all-frames' }
   */
  readonly strategy: ExtractionStrategy;

  /**
   * Quality parameter for JPEG compression (1-31)
   *
   * Lower values = higher quality and larger file size
   * Higher values = lower quality and smaller file size
   *
   * @default 2
   *
   * @example
   * 1-2: High quality (~500KB per frame)
   * 5-10: Medium quality (~200KB per frame)
   * 15-31: Low quality (~50KB per frame)
   */
  readonly quality?: number;
}
