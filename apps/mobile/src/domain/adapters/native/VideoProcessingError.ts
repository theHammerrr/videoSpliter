/**
 * Error codes for video processing operations
 */
export enum VideoProcessingErrorCode {
  INVALID_VIDEO_PATH = 'INVALID_VIDEO_PATH',
  INVALID_OUTPUT_DIR = 'INVALID_OUTPUT_DIR',
  FFMPEG_FAILED = 'FFMPEG_FAILED',
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  INSUFFICIENT_STORAGE = 'INSUFFICIENT_STORAGE',
  CANCELLED = 'CANCELLED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Domain error for video processing operations
 */
export class VideoProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: VideoProcessingErrorCode,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'VideoProcessingError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VideoProcessingError);
    }
  }

  /**
   * Check if error is due to cancellation
   */
  get isCancelled(): boolean {
    return this.code === VideoProcessingErrorCode.CANCELLED;
  }

  /**
   * Check if error is recoverable
   */
  get isRecoverable(): boolean {
    return [
      VideoProcessingErrorCode.CANCELLED,
      VideoProcessingErrorCode.INSUFFICIENT_STORAGE,
    ].includes(this.code);
  }
}

/**
 * Type guard for native errors
 */
function isNativeError(error: unknown): error is { code: string; message: string } {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

/**
 * Map native error codes to domain error codes
 */
function mapNativeCodeToDomainCode(nativeCode: string): VideoProcessingErrorCode {
  const mapping: Record<string, VideoProcessingErrorCode> = {
    INVALID_VIDEO_PATH: VideoProcessingErrorCode.INVALID_VIDEO_PATH,
    INVALID_OUTPUT_DIR: VideoProcessingErrorCode.INVALID_OUTPUT_DIR,
    FFMPEG_FAILED: VideoProcessingErrorCode.FFMPEG_FAILED,
    VIDEO_NOT_FOUND: VideoProcessingErrorCode.VIDEO_NOT_FOUND,
    UNSUPPORTED_FORMAT: VideoProcessingErrorCode.UNSUPPORTED_FORMAT,
    INSUFFICIENT_STORAGE: VideoProcessingErrorCode.INSUFFICIENT_STORAGE,
    CANCELLED: VideoProcessingErrorCode.CANCELLED,
  };

  return mapping[nativeCode] || VideoProcessingErrorCode.UNKNOWN;
}

/**
 * Map native errors to domain errors
 * Transforms platform-specific errors into domain errors
 */
export function mapNativeErrorToVideoProcessingError(error: unknown): VideoProcessingError {
  if (error instanceof VideoProcessingError) {
    return error;
  }

  // Handle React Native bridge errors
  if (isNativeError(error)) {
    const code = mapNativeCodeToDomainCode(error.code);
    return new VideoProcessingError(error.message, code, error);
  }

  // Unknown error
  return new VideoProcessingError(
    error instanceof Error ? error.message : 'Unknown error occurred',
    VideoProcessingErrorCode.UNKNOWN,
    error,
  );
}
