import type { VideoFile } from '@domain/adapters/FilePickerAdapter';
import type { ValidationResult, ValidationError } from '@domain/models';

/**
 * Supported video file extensions
 *
 * Common video formats that FFmpeg can process.
 */
export const SUPPORTED_VIDEO_EXTENSIONS = [
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.m4v',
  '.3gp',
  '.webm',
  '.flv',
  '.wmv',
  '.mpeg',
  '.mpg',
] as const;

/**
 * Supported video MIME types
 *
 * MIME types that indicate valid video files.
 */
export const SUPPORTED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/3gpp',
  'video/webm',
  'video/x-flv',
  'video/x-ms-wmv',
  'video/mpeg',
] as const;

/**
 * Validation error codes for video files
 */
export const VIDEO_VALIDATION_ERROR_CODES = {
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  INVALID_MIME_TYPE: 'INVALID_MIME_TYPE',
  LARGE_FILE_WARNING: 'LARGE_FILE_WARNING',
  MISSING_URI: 'MISSING_URI',
  MISSING_FILENAME: 'MISSING_FILENAME',
} as const;

/**
 * Large file threshold (500 MB in bytes)
 *
 * Files larger than this will trigger a warning.
 */
const LARGE_FILE_THRESHOLD_BYTES = 500 * 1024 * 1024;

/**
 * Validate a video file
 *
 * Checks file extension, MIME type, and file size.
 * Returns validation errors if file is invalid or warnings for large files.
 *
 * @param file - Video file to validate
 * @returns Validation result
 *
 * @example
 * const validation = validateVideoFile(videoFile);
 * if (!validation.valid) {
 *   validation.errors.forEach(error => {
 *     console.error(error.message);
 *   });
 * }
 */
export function validateVideoFile(file: VideoFile): ValidationResult {
  const errors: ValidationError[] = [];

  // Check for required fields
  if (!file.uri || file.uri.trim() === '') {
    errors.push({
      field: 'uri',
      message: 'Video URI is missing',
      code: VIDEO_VALIDATION_ERROR_CODES.MISSING_URI,
    });
  }

  if (!file.fileName || file.fileName.trim() === '') {
    errors.push({
      field: 'fileName',
      message: 'Video file name is missing',
      code: VIDEO_VALIDATION_ERROR_CODES.MISSING_FILENAME,
    });
  }

  // Skip further validation if required fields are missing
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Check file extension
  const hasValidExtension = SUPPORTED_VIDEO_EXTENSIONS.some(ext =>
    file.fileName.toLowerCase().endsWith(ext),
  );

  if (!hasValidExtension) {
    errors.push({
      field: 'fileName',
      message: `Unsupported video format. Please select one of: ${SUPPORTED_VIDEO_EXTENSIONS.join(
        ', ',
      )}`,
      code: VIDEO_VALIDATION_ERROR_CODES.UNSUPPORTED_FORMAT,
    });
  }

  // Check MIME type if available
  if (file.type) {
    const hasValidMimeType = SUPPORTED_MIME_TYPES.includes(
      file.type as (typeof SUPPORTED_MIME_TYPES)[number],
    );

    if (!hasValidMimeType) {
      errors.push({
        field: 'type',
        message: `Invalid video MIME type: ${
          file.type
        }. Expected one of: ${SUPPORTED_MIME_TYPES.join(', ')}`,
        code: VIDEO_VALIDATION_ERROR_CODES.INVALID_MIME_TYPE,
      });
    }
  }

  // Check file size (warning for large files)
  if (file.fileSize > LARGE_FILE_THRESHOLD_BYTES) {
    const sizeMB = Math.round(file.fileSize / (1024 * 1024));
    errors.push({
      field: 'fileSize',
      message: `Large video file (${sizeMB} MB) may take longer to process and use significant storage.`,
      code: VIDEO_VALIDATION_ERROR_CODES.LARGE_FILE_WARNING,
    });
  }

  // Return result
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Check if a validation error is a warning (not blocking)
 *
 * Some validation errors are warnings that don't prevent processing.
 *
 * @param error - Validation error to check
 * @returns True if error is a warning
 *
 * @example
 * const errors = validation.errors.filter(e => !isWarning(e));
 * if (errors.length === 0) {
 *   // Only warnings, can proceed
 * }
 */
export function isWarning(error: ValidationError): boolean {
  return error.code === VIDEO_VALIDATION_ERROR_CODES.LARGE_FILE_WARNING;
}
