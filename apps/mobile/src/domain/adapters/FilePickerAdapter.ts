/**
 * Video File
 *
 * Represents a video file selected from the device gallery or camera.
 */
export interface VideoFile {
  /**
   * File URI (usually file:// protocol on mobile)
   *
   * @example "file:///path/to/video.mp4"
   */
  uri: string;

  /**
   * Original filename
   *
   * @example "VID_20231215_120530.mp4"
   */
  fileName: string;

  /**
   * File size in bytes
   *
   * @example 15728640 (15 MB)
   */
  fileSize: number;

  /**
   * MIME type (if available from picker)
   *
   * @example "video/mp4"
   */
  type?: string;

  /**
   * Video duration in seconds (if available from picker)
   *
   * @example 60.5 (60.5 seconds)
   */
  duration?: number;
}

/**
 * File Picker Adapter
 *
 * Abstraction over platform-specific file/media picking.
 * Allows testing and decouples domain logic from native picker APIs.
 *
 * @example
 * const adapter = new NativeFilePickerAdapter();
 * const video = await adapter.pickVideo();
 *
 * if (video) {
 *   console.log(`Selected: ${video.fileName} (${video.fileSize} bytes)`);
 * } else {
 *   console.log('User cancelled selection');
 * }
 */
export interface FilePickerAdapter {
  /**
   * Pick a video from device gallery/photo library
   *
   * Shows the system video picker UI. Returns null if user cancels.
   *
   * @returns Selected video file, or null if cancelled
   *
   * @example
   * const video = await adapter.pickVideo();
   * if (video) {
   *   // User selected a video
   *   console.log(`Selected: ${video.fileName}`);
   * } else {
   *   // User cancelled
   * }
   */
  pickVideo(): Promise<VideoFile | null>;

  /**
   * Record a video using device camera
   *
   * Shows the system camera UI for video recording.
   * Returns null if user cancels.
   *
   * @returns Recorded video file, or null if cancelled
   *
   * @example
   * const video = await adapter.pickVideoFromCamera();
   * if (video) {
   *   // User recorded a video
   *   console.log(`Recorded: ${video.fileName}`);
   * } else {
   *   // User cancelled
   * }
   */
  pickVideoFromCamera(): Promise<VideoFile | null>;
}
