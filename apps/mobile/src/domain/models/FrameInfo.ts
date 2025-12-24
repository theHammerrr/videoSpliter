/**
 * Frame Information
 *
 * Metadata about an individual extracted frame.
 */
export interface FrameInfo {
  /**
   * Frame number in the extraction sequence (0-indexed)
   *
   * @example
   * First extracted frame: 0
   * Second extracted frame: 1
   */
  readonly frameNumber: number;

  /**
   * Timestamp in the video (seconds)
   *
   * Represents the time position in the original video where this frame was extracted.
   *
   * @example
   * Frame at 5.5 seconds: 5.5
   * Frame at 1 minute 30 seconds: 90.0
   */
  readonly timestamp: number;

  /**
   * Absolute file path to the extracted frame image
   *
   * @example
   * '/storage/emulated/0/VideoSpliter/frames/frame_0001.jpg'
   */
  readonly path: string;
}
