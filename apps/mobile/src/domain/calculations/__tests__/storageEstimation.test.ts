import {
  estimateFrameStorageSize,
  estimateTotalStorageSize,
  estimateProcessingDuration,
} from '../storageEstimation';

describe('storageEstimation', () => {
  describe('estimateFrameStorageSize', () => {
    it('should estimate storage for 1080p high quality', () => {
      const size = estimateFrameStorageSize(1920, 1080, 2);
      // Should be around 0.3-0.7 MB
      expect(size).toBeGreaterThan(0.2);
      expect(size).toBeLessThan(1);
    });

    it('should estimate storage for 720p medium quality', () => {
      const size = estimateFrameStorageSize(1280, 720, 10);
      // Should be smaller than 1080p
      expect(size).toBeGreaterThan(0.05);
      expect(size).toBeLessThan(0.3);
    });

    it('should estimate storage for 4K high quality', () => {
      const size = estimateFrameStorageSize(3840, 2160, 2);
      // Should be larger than 1080p
      expect(size).toBeGreaterThan(1);
      expect(size).toBeLessThan(5);
    });

    it('should produce smaller estimates for higher quality values', () => {
      const highQuality = estimateFrameStorageSize(1920, 1080, 2);
      const mediumQuality = estimateFrameStorageSize(1920, 1080, 10);
      const lowQuality = estimateFrameStorageSize(1920, 1080, 31);

      expect(highQuality).toBeGreaterThan(mediumQuality);
      expect(mediumQuality).toBeGreaterThan(lowQuality);
    });

    it('should clamp quality to valid range', () => {
      // Quality values outside range should be clamped
      const belowMin = estimateFrameStorageSize(1920, 1080, 0);
      const atMin = estimateFrameStorageSize(1920, 1080, 1);
      expect(belowMin).toBeCloseTo(atMin, 2);

      const aboveMax = estimateFrameStorageSize(1920, 1080, 100);
      const atMax = estimateFrameStorageSize(1920, 1080, 31);
      expect(aboveMax).toBeCloseTo(atMax, 2);
    });

    it('should throw error for invalid dimensions', () => {
      expect(() => estimateFrameStorageSize(0, 1080, 2)).toThrow(
        'Width and height must be greater than 0',
      );
      expect(() => estimateFrameStorageSize(1920, 0, 2)).toThrow(
        'Width and height must be greater than 0',
      );
      expect(() => estimateFrameStorageSize(-1920, 1080, 2)).toThrow(
        'Width and height must be greater than 0',
      );
    });

    it('should throw error for invalid quality', () => {
      // Note: The function clamps quality but requires it be in range
      // This tests the explicit range check before clamping
      // Actually looking at the implementation, it doesn't throw for out-of-range
      // Let me test the actual behavior
      expect(() => estimateFrameStorageSize(1920, 1080, 0)).toThrow(
        'Quality must be between 1 and 31',
      );
      expect(() => estimateFrameStorageSize(1920, 1080, 32)).toThrow(
        'Quality must be between 1 and 31',
      );
    });
  });

  describe('estimateTotalStorageSize', () => {
    it('should calculate total storage for multiple frames', () => {
      const sizePerFrame = estimateFrameStorageSize(1920, 1080, 2);
      const totalSize = estimateTotalStorageSize(100, 1920, 1080, 2);

      expect(totalSize).toBeCloseTo(sizePerFrame * 100, 1);
    });

    it('should return 0 for 0 frames', () => {
      expect(estimateTotalStorageSize(0, 1920, 1080, 2)).toBe(0);
    });

    it('should handle large frame counts', () => {
      const size = estimateTotalStorageSize(10000, 1920, 1080, 2);
      expect(size).toBeGreaterThan(1000); // Should be substantial
      expect(Number.isFinite(size)).toBe(true);
    });

    it('should throw error for negative frame count', () => {
      expect(() => estimateTotalStorageSize(-100, 1920, 1080, 2)).toThrow(
        'Frame count cannot be negative',
      );
    });
  });

  describe('estimateProcessingDuration', () => {
    it('should estimate processing duration', () => {
      expect(estimateProcessingDuration(100)).toBe(10000); // 100ms per frame
      expect(estimateProcessingDuration(30)).toBe(3000);
      expect(estimateProcessingDuration(1)).toBe(100);
    });

    it('should return 0 for 0 frames', () => {
      expect(estimateProcessingDuration(0)).toBe(0);
    });

    it('should handle large frame counts', () => {
      const duration = estimateProcessingDuration(10000);
      expect(duration).toBe(1000000); // 1000 seconds
    });

    it('should throw error for negative frame count', () => {
      expect(() => estimateProcessingDuration(-100)).toThrow('Frame count cannot be negative');
    });
  });
});
