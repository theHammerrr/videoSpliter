import type { ExtractionStrategy } from './ExtractionStrategy';
import type { FrameInfo } from './FrameInfo';

/**
 * Extraction Result
 *
 * Domain model representing the result of a frame extraction operation.
 * Contains detailed information about extracted frames and execution metrics.
 */
export interface ExtractionResult {
  /**
   * Array of extracted frames with metadata
   *
   * Each frame includes its number, timestamp, and file path.
   */
  readonly frames: readonly FrameInfo[];

  /**
   * Total number of frames extracted
   *
   * Should match frames.length
   */
  readonly totalFrames: number;

  /**
   * Actual storage size consumed in megabytes
   *
   * Calculated from the actual file sizes of extracted frames.
   */
  readonly actualStorageMB: number;

  /**
   * Actual processing time in milliseconds
   *
   * Time taken to extract all frames.
   */
  readonly processingTimeMs: number;

  /**
   * The extraction strategy that was used
   *
   * Preserved from the original request for reference.
   */
  readonly strategy: ExtractionStrategy;
}
