import type { PermissionAdapter } from '@domain/adapters/PermissionAdapter';
import { PermissionType, PermissionStatus } from '@domain/adapters/PermissionAdapter';
import type { FilePickerAdapter, VideoFile } from '@domain/adapters/FilePickerAdapter';
import type { ValidationResult } from '@domain/models';
import { validateVideoFile, isWarning } from '@domain/validation/videoValidator';

/**
 * Video Import Error Codes
 */
export enum VideoImportErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PERMISSION_BLOCKED = 'PERMISSION_BLOCKED',
  PERMISSION_UNAVAILABLE = 'PERMISSION_UNAVAILABLE',
  USER_CANCELLED = 'USER_CANCELLED',
  INVALID_VIDEO = 'INVALID_VIDEO',
  PICKER_ERROR = 'PICKER_ERROR',
}

/**
 * Video Import Error
 *
 * Custom error class for video import operations.
 */
export class VideoImportError extends Error {
  constructor(
    message: string,
    public readonly code: VideoImportErrorCode,
    public readonly validationResult?: ValidationResult,
  ) {
    super(message);
    this.name = 'VideoImportError';
  }
}

/**
 * Video Import Service
 *
 * Orchestrates video import workflow:
 * 1. Check/request permissions
 * 2. Launch file picker or camera
 * 3. Validate selected video
 * 4. Return video file
 *
 * This service provides the business logic layer for video import.
 *
 * @example
 * const service = new VideoImportService(
 *   new NativePermissionAdapter(),
 *   new NativeFilePickerAdapter()
 * );
 *
 * try {
 *   const video = await service.importVideoFromGallery();
 *   console.log(`Imported: ${video.fileName}`);
 * } catch (error) {
 *   if (error instanceof VideoImportError) {
 *     if (error.code === VideoImportErrorCode.PERMISSION_BLOCKED) {
 *       // Show "Open Settings" UI
 *     }
 *   }
 * }
 */
export class VideoImportService {
  /**
   * Create a new video import service
   *
   * @param permissionAdapter - Permission adapter implementation
   * @param filePickerAdapter - File picker adapter implementation
   */
  constructor(
    private readonly permissionAdapter: PermissionAdapter,
    private readonly filePickerAdapter: FilePickerAdapter,
  ) {}

  /**
   * Import a video from device gallery
   *
   * Complete workflow:
   * 1. Check photo library permission
   * 2. Request permission if needed
   * 3. Handle permission errors
   * 4. Launch gallery picker
   * 5. Validate selected video
   * 6. Return video file
   *
   * @returns Video file
   * @throws VideoImportError if permission denied, blocked, or video invalid
   *
   * @example
   * try {
   *   const video = await service.importVideoFromGallery();
   *   console.log(`Selected: ${video.fileName}`);
   * } catch (error) {
   *   if (error.code === VideoImportErrorCode.USER_CANCELLED) {
   *     // User cancelled, no need to show error
   *   }
   * }
   */
  async importVideoFromGallery(): Promise<VideoFile> {
    // Step 1: Ensure permission is granted
    await this.ensurePermission('PHOTO_LIBRARY');

    // Step 2: Launch picker
    const video = await this.launchPicker();

    // Step 3: Validate video
    this.validateVideo(video);

    return video;
  }

  /**
   * Import a video from device camera
   *
   * Complete workflow:
   * 1. Check camera permission
   * 2. Request permission if needed
   * 3. Handle permission errors
   * 4. Launch camera
   * 5. Validate recorded video
   * 6. Return video file
   *
   * @returns Video file
   * @throws VideoImportError if permission denied, blocked, or video invalid
   *
   * @example
   * try {
   *   const video = await service.importVideoFromCamera();
   *   console.log(`Recorded: ${video.fileName}`);
   * } catch (error) {
   *   if (error.code === VideoImportErrorCode.PERMISSION_BLOCKED) {
   *     // Show "Open Settings" UI
   *   }
   * }
   */
  async importVideoFromCamera(): Promise<VideoFile> {
    // Step 1: Ensure permission is granted
    await this.ensurePermission('CAMERA');

    // Step 2: Launch camera
    const video = await this.launchCamera();

    // Step 3: Validate video
    this.validateVideo(video);

    return video;
  }

  /**
   * Validate a video file
   *
   * @param file - Video file to validate
   * @throws VideoImportError if validation fails
   *
   * @example
   * try {
   *   service.validateVideo(videoFile);
   *   // Video is valid
   * } catch (error) {
   *   if (error.validationResult) {
   *     error.validationResult.errors.forEach(e => console.error(e.message));
   *   }
   * }
   */
  validateVideo(file: VideoFile): void {
    const validation = validateVideoFile(file);

    if (!validation.valid) {
      // Filter out warnings - only fail on actual errors
      const errors = validation.errors.filter(e => !isWarning(e));

      if (errors.length > 0) {
        throw new VideoImportError(
          `Invalid video file: ${errors.map(e => e.message).join(', ')}`,
          VideoImportErrorCode.INVALID_VIDEO,
          { valid: false, errors },
        );
      }
    }
  }

  /**
   * Open device settings
   *
   * Useful when permission is blocked and user needs to enable manually.
   *
   * @example
   * await service.openSettings();
   */
  async openSettings(): Promise<void> {
    await this.permissionAdapter.openSettings();
  }

  /**
   * Ensure permission is granted, requesting if needed
   *
   * @private
   * @throws VideoImportError if permission denied or blocked
   */
  private async ensurePermission(permissionType: 'PHOTO_LIBRARY' | 'CAMERA'): Promise<void> {
    const permission =
      permissionType === 'PHOTO_LIBRARY' ? PermissionType.PHOTO_LIBRARY : PermissionType.CAMERA;

    // Check current status
    let status = await this.permissionAdapter.check(permission);

    // If denied, request permission
    if (status === PermissionStatus.DENIED) {
      status = await this.permissionAdapter.request(permission);
    }

    // Handle different statuses
    switch (status) {
      case PermissionStatus.GRANTED:
        // Permission granted, continue
        return;

      case PermissionStatus.DENIED:
        throw new VideoImportError(
          `${permissionType === 'PHOTO_LIBRARY' ? 'Photo library' : 'Camera'} permission denied`,
          VideoImportErrorCode.PERMISSION_DENIED,
        );

      case PermissionStatus.BLOCKED:
        throw new VideoImportError(
          `${
            permissionType === 'PHOTO_LIBRARY' ? 'Photo library' : 'Camera'
          } permission blocked. Please enable in device settings.`,
          VideoImportErrorCode.PERMISSION_BLOCKED,
        );

      case PermissionStatus.UNAVAILABLE:
        throw new VideoImportError(
          `${
            permissionType === 'PHOTO_LIBRARY' ? 'Photo library' : 'Camera'
          } permission unavailable on this device`,
          VideoImportErrorCode.PERMISSION_UNAVAILABLE,
        );
    }
  }

  /**
   * Launch gallery picker
   *
   * @private
   * @throws VideoImportError if user cancels or picker fails
   */
  private async launchPicker(): Promise<VideoFile> {
    try {
      const video = await this.filePickerAdapter.pickVideo();

      if (!video) {
        throw new VideoImportError(
          'Video selection cancelled',
          VideoImportErrorCode.USER_CANCELLED,
        );
      }

      return video;
    } catch (error) {
      // Re-throw VideoImportError as-is
      if (error instanceof VideoImportError) {
        throw error;
      }

      // Wrap other errors
      throw new VideoImportError(
        `Failed to pick video: ${error instanceof Error ? error.message : String(error)}`,
        VideoImportErrorCode.PICKER_ERROR,
      );
    }
  }

  /**
   * Launch camera
   *
   * @private
   * @throws VideoImportError if user cancels or camera fails
   */
  private async launchCamera(): Promise<VideoFile> {
    try {
      const video = await this.filePickerAdapter.pickVideoFromCamera();

      if (!video) {
        throw new VideoImportError(
          'Video recording cancelled',
          VideoImportErrorCode.USER_CANCELLED,
        );
      }

      return video;
    } catch (error) {
      // Re-throw VideoImportError as-is
      if (error instanceof VideoImportError) {
        throw error;
      }

      // Wrap other errors
      throw new VideoImportError(
        `Failed to record video: ${error instanceof Error ? error.message : String(error)}`,
        VideoImportErrorCode.PICKER_ERROR,
      );
    }
  }
}
