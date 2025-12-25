import { validateVideoFile, isWarning, VIDEO_VALIDATION_ERROR_CODES } from '../videoValidator';
import type { VideoFile } from '@domain/adapters/FilePickerAdapter';

describe('videoValidator', () => {
  const createValidVideo = (overrides?: Partial<VideoFile>): VideoFile => ({
    uri: 'file:///path/to/video.mp4',
    fileName: 'test-video.mp4',
    fileSize: 10 * 1024 * 1024, // 10 MB
    type: 'video/mp4',
    duration: 60,
    ...overrides,
  });

  describe('validateVideoFile', () => {
    it('should pass for valid MP4 video', () => {
      const video = createValidVideo();
      const result = validateVideoFile(video);

      expect(result.valid).toBe(true);
    });

    it('should pass for valid MOV video', () => {
      const video = createValidVideo({
        fileName: 'test-video.mov',
        type: 'video/quicktime',
      });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(true);
    });

    it('should pass for valid AVI video', () => {
      const video = createValidVideo({
        fileName: 'test-video.avi',
        type: 'video/x-msvideo',
      });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(true);
    });

    it('should pass for all supported video extensions', () => {
      const extensions = [
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
      ];

      extensions.forEach(ext => {
        const video = createValidVideo({ fileName: `test-video${ext}` });
        const result = validateVideoFile(video);

        expect(result.valid).toBe(true);
      });
    });

    it('should fail for missing URI', () => {
      const video = createValidVideo({ uri: '' });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe(VIDEO_VALIDATION_ERROR_CODES.MISSING_URI);
        expect(result.errors[0].field).toBe('uri');
      }
    });

    it('should fail for missing file name', () => {
      const video = createValidVideo({ fileName: '' });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe(VIDEO_VALIDATION_ERROR_CODES.MISSING_FILENAME);
        expect(result.errors[0].field).toBe('fileName');
      }
    });

    it('should fail for whitespace-only URI', () => {
      const video = createValidVideo({ uri: '   ' });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0].code).toBe(VIDEO_VALIDATION_ERROR_CODES.MISSING_URI);
      }
    });

    it('should fail for unsupported file extension', () => {
      const video = createValidVideo({ fileName: 'test-video.txt' });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(
          result.errors.some(e => e.code === VIDEO_VALIDATION_ERROR_CODES.UNSUPPORTED_FORMAT),
        ).toBe(true);
        const formatError = result.errors.find(
          e => e.code === VIDEO_VALIDATION_ERROR_CODES.UNSUPPORTED_FORMAT,
        );
        expect(formatError?.field).toBe('fileName');
      }
    });

    it('should fail for invalid MIME type', () => {
      const video = createValidVideo({ type: 'application/pdf' });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(
          result.errors.some(e => e.code === VIDEO_VALIDATION_ERROR_CODES.INVALID_MIME_TYPE),
        ).toBe(true);
        const mimeError = result.errors.find(
          e => e.code === VIDEO_VALIDATION_ERROR_CODES.INVALID_MIME_TYPE,
        );
        expect(mimeError?.field).toBe('type');
      }
    });

    it('should pass when MIME type is not provided', () => {
      const video = createValidVideo({ type: undefined });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(true);
    });

    it('should warn for large file (> 500 MB)', () => {
      const video = createValidVideo({
        fileSize: 600 * 1024 * 1024, // 600 MB
      });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe(VIDEO_VALIDATION_ERROR_CODES.LARGE_FILE_WARNING);
        expect(result.errors[0].field).toBe('fileSize');
      }
    });

    it('should pass for file exactly at 500 MB threshold', () => {
      const video = createValidVideo({
        fileSize: 500 * 1024 * 1024, // Exactly 500 MB
      });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(true);
    });

    it('should be case-insensitive for file extensions', () => {
      const video = createValidVideo({ fileName: 'test-VIDEO.MP4' });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(true);
    });

    it('should collect multiple errors', () => {
      const video = createValidVideo({
        fileName: 'test-video.txt',
        type: 'application/pdf',
        fileSize: 600 * 1024 * 1024,
      });
      const result = validateVideoFile(video);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThan(1);
      }
    });
  });

  describe('isWarning', () => {
    it('should return true for large file warning', () => {
      const error = {
        field: 'fileSize',
        message: 'Large file',
        code: VIDEO_VALIDATION_ERROR_CODES.LARGE_FILE_WARNING,
      };

      expect(isWarning(error)).toBe(true);
    });

    it('should return false for unsupported format error', () => {
      const error = {
        field: 'fileName',
        message: 'Unsupported format',
        code: VIDEO_VALIDATION_ERROR_CODES.UNSUPPORTED_FORMAT,
      };

      expect(isWarning(error)).toBe(false);
    });

    it('should return false for invalid MIME type error', () => {
      const error = {
        field: 'type',
        message: 'Invalid MIME type',
        code: VIDEO_VALIDATION_ERROR_CODES.INVALID_MIME_TYPE,
      };

      expect(isWarning(error)).toBe(false);
    });

    it('should return false for missing URI error', () => {
      const error = {
        field: 'uri',
        message: 'Missing URI',
        code: VIDEO_VALIDATION_ERROR_CODES.MISSING_URI,
      };

      expect(isWarning(error)).toBe(false);
    });
  });
});
