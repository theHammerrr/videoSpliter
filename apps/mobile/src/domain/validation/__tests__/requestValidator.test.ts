import { validateRequest, validateStorageEstimate } from '../requestValidator';
import type { FrameExtractionRequest } from '@domain/models';
import { isValid } from '@domain/models';

describe('requestValidator', () => {
  describe('validateRequest', () => {
    const validRequest: FrameExtractionRequest = {
      videoPath: '/path/to/video.mp4',
      outputDirectory: '/path/to/output',
      strategy: { type: 'uniform', frameCount: 100 },
      quality: 2,
    };

    it('should pass for valid request', () => {
      const result = validateRequest(validRequest);
      expect(isValid(result)).toBe(true);
    });

    it('should pass for valid request without quality', () => {
      const result = validateRequest({
        ...validRequest,
        quality: undefined,
      });
      expect(isValid(result)).toBe(true);
    });

    it('should fail for empty video path', () => {
      const result = validateRequest({
        ...validRequest,
        videoPath: '',
      });
      expect(isValid(result)).toBe(false);
      if (!result.valid) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('videoPath');
      }
    });

    it('should fail for empty output directory', () => {
      const result = validateRequest({
        ...validRequest,
        outputDirectory: '',
      });
      expect(isValid(result)).toBe(false);
      if (!result.valid) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('outputDirectory');
      }
    });

    it('should fail for invalid strategy', () => {
      const result = validateRequest({
        ...validRequest,
        strategy: { type: 'uniform', frameCount: 0 },
      });
      expect(isValid(result)).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].field).toBe('frameCount');
      }
    });

    it('should fail for invalid quality', () => {
      const result = validateRequest({
        ...validRequest,
        quality: 0,
      });
      expect(isValid(result)).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].field).toBe('quality');
      }
    });

    it('should collect multiple errors', () => {
      const result = validateRequest({
        videoPath: '',
        outputDirectory: '',
        strategy: { type: 'uniform', frameCount: 0 },
        quality: 0,
      });
      expect(isValid(result)).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should validate all strategy types', () => {
      const strategies = [
        { type: 'uniform' as const, frameCount: 100 },
        { type: 'interval' as const, intervalSeconds: 2 },
        { type: 'frame-based' as const, frameInterval: 30 },
        { type: 'all-frames' as const },
        { type: 'custom-fps' as const, fps: 10 },
      ];

      strategies.forEach(strategy => {
        const result = validateRequest({
          ...validRequest,
          strategy,
        });
        expect(isValid(result)).toBe(true);
      });
    });
  });

  describe('validateStorageEstimate', () => {
    it('should pass for storage under limit', () => {
      expect(validateStorageEstimate(100)).toEqual([]);
      expect(validateStorageEstimate(1000)).toEqual([]);
      expect(validateStorageEstimate(5000)).toEqual([]);
    });

    it('should fail for storage over limit', () => {
      const errors = validateStorageEstimate(5001);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('estimatedStorageMB');
      expect(errors[0].code).toBe('STORAGE_LIMIT_EXCEEDED');
    });

    it('should pass for zero storage', () => {
      expect(validateStorageEstimate(0)).toEqual([]);
    });

    it('should pass for non-finite values (skip validation)', () => {
      // When estimate is invalid, skip validation
      expect(validateStorageEstimate(NaN)).toEqual([]);
      expect(validateStorageEstimate(Infinity)).toEqual([]);
    });
  });
});
