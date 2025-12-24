/**
 * Video processing adapter interface
 * Handles video frame extraction and metadata retrieval
 */

/**
 * Configuration for frame extraction
 */
export interface FrameExtractionConfig {
  /** Absolute path to input video file */
  videoPath: string;

  /** Directory where frames will be saved */
  outputDirectory: string;

  /**
   * Frame rate for extraction (frames per second)
   * If undefined, extracts all frames
   */
  frameRate?: number;

  /**
   * Quality setting (1-31, lower is better)
   * Default: 2 (high quality)
   */
  quality?: number;
}

/**
 * Result from frame extraction
 */
export interface FrameExtractionResult {
  /** Array of absolute paths to extracted frame images */
  outputPaths: string[];

  /** Total number of frames extracted */
  frameCount: number;

  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Video metadata
 */
export interface VideoMetadata {
  /** Duration in seconds */
  duration: number;

  /** Video width in pixels */
  width: number;

  /** Video height in pixels */
  height: number;

  /** Frame rate (fps) */
  frameRate: number;

  /** Video codec name */
  codec: string;

  /** Bitrate in bits per second */
  bitrate: number;
}

/**
 * Video processing adapter interface
 * Provides video frame extraction and metadata retrieval capabilities
 */
export interface VideoProcessingAdapter {
  /**
   * Extract frames from a video file
   * @param config - Frame extraction configuration
   * @returns Result containing output paths and metadata
   * @throws VideoProcessingError on failure
   */
  extractFrames(config: FrameExtractionConfig): Promise<FrameExtractionResult>;

  /**
   * Get metadata from a video file
   * @param videoPath - Absolute path to video file
   * @returns Video metadata
   * @throws VideoProcessingError on failure
   */
  getVideoMetadata(videoPath: string): Promise<VideoMetadata>;

  /**
   * Cancel ongoing video processing operation
   */
  cancelOperation(): Promise<void>;
}
