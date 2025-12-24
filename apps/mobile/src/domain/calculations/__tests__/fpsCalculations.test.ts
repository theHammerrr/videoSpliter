import {
  calculateUniformSamplingFps,
  calculateIntervalBasedFps,
  calculateFrameBasedFps,
  calculateExtractionFps,
  estimateFrameCount,
} from '../fpsCalculations';
import type { VideoMetadata } from '@domain/adapters';

describe('fpsCalculations', () => {
  describe('calculateUniformSamplingFps', () => {
    it('should calculate FPS for uniform sampling', () => {
      expect(calculateUniformSamplingFps(100, 10)).toBe(10);
      expect(calculateUniformSamplingFps(30, 60)).toBe(0.5);
      expect(calculateUniformSamplingFps(60, 30)).toBe(2);
    });

    it('should handle decimal results', () => {
      expect(calculateUniformSamplingFps(100, 33)).toBeCloseTo(3.0303, 4);
    });

    it('should throw error for zero or negative duration', () => {
      expect(() => calculateUniformSamplingFps(100, 0)).toThrow('Duration must be greater than 0');
      expect(() => calculateUniformSamplingFps(100, -10)).toThrow(
        'Duration must be greater than 0',
      );
    });

    it('should throw error for zero or negative frame count', () => {
      expect(() => calculateUniformSamplingFps(0, 10)).toThrow(
        'Frame count must be greater than 0',
      );
      expect(() => calculateUniformSamplingFps(-100, 10)).toThrow(
        'Frame count must be greater than 0',
      );
    });
  });

  describe('calculateIntervalBasedFps', () => {
    it('should calculate FPS for interval-based extraction', () => {
      expect(calculateIntervalBasedFps(2)).toBe(0.5);
      expect(calculateIntervalBasedFps(0.5)).toBe(2);
      expect(calculateIntervalBasedFps(1)).toBe(1);
    });

    it('should handle very small intervals', () => {
      expect(calculateIntervalBasedFps(0.001)).toBe(1000);
    });

    it('should throw error for zero or negative interval', () => {
      expect(() => calculateIntervalBasedFps(0)).toThrow('Interval must be greater than 0');
      expect(() => calculateIntervalBasedFps(-2)).toThrow('Interval must be greater than 0');
    });
  });

  describe('calculateFrameBasedFps', () => {
    it('should calculate FPS for frame-based extraction', () => {
      expect(calculateFrameBasedFps(30, 30)).toBe(1);
      expect(calculateFrameBasedFps(60, 60)).toBe(1);
      expect(calculateFrameBasedFps(15, 30)).toBe(2);
      expect(calculateFrameBasedFps(10, 30)).toBe(3);
    });

    it('should handle decimal results', () => {
      expect(calculateFrameBasedFps(7, 30)).toBeCloseTo(4.2857, 4);
    });

    it('should throw error for zero or negative frame interval', () => {
      expect(() => calculateFrameBasedFps(0, 30)).toThrow('Frame interval must be greater than 0');
      expect(() => calculateFrameBasedFps(-10, 30)).toThrow(
        'Frame interval must be greater than 0',
      );
    });

    it('should throw error for zero or negative video FPS', () => {
      expect(() => calculateFrameBasedFps(30, 0)).toThrow('Video FPS must be greater than 0');
      expect(() => calculateFrameBasedFps(30, -30)).toThrow('Video FPS must be greater than 0');
    });
  });

  describe('calculateExtractionFps', () => {
    const mockMetadata: VideoMetadata = {
      duration: 60,
      width: 1920,
      height: 1080,
      frameRate: 30,
      codec: 'h264',
      bitrate: 5000000,
    };

    it('should calculate FPS for uniform sampling strategy', () => {
      const fps = calculateExtractionFps({ type: 'uniform', frameCount: 100 }, mockMetadata);
      expect(fps).toBeCloseTo(1.6667, 4);
    });

    it('should calculate FPS for interval-based strategy', () => {
      const fps = calculateExtractionFps({ type: 'interval', intervalSeconds: 2 }, mockMetadata);
      expect(fps).toBe(0.5);
    });

    it('should calculate FPS for frame-based strategy', () => {
      const fps = calculateExtractionFps({ type: 'frame-based', frameInterval: 30 }, mockMetadata);
      expect(fps).toBe(1);
    });

    it('should return video FPS for all-frames strategy', () => {
      const fps = calculateExtractionFps({ type: 'all-frames' }, mockMetadata);
      expect(fps).toBe(30);
    });

    it('should return custom FPS for custom-fps strategy', () => {
      const fps = calculateExtractionFps({ type: 'custom-fps', fps: 5 }, mockMetadata);
      expect(fps).toBe(5);
    });
  });

  describe('estimateFrameCount', () => {
    it('should estimate frame count correctly', () => {
      expect(estimateFrameCount(10, 10)).toBe(100);
      expect(estimateFrameCount(0.5, 60)).toBe(30);
      expect(estimateFrameCount(30, 10)).toBe(300);
    });

    it('should round to nearest integer', () => {
      expect(estimateFrameCount(3, 10.3)).toBe(31); // 30.9 rounds to 31
      expect(estimateFrameCount(1.5, 10)).toBe(15);
    });

    it('should handle zero duration', () => {
      expect(estimateFrameCount(10, 0)).toBe(0);
    });

    it('should throw error for zero or negative FPS', () => {
      expect(() => estimateFrameCount(0, 10)).toThrow('FPS must be greater than 0');
      expect(() => estimateFrameCount(-10, 10)).toThrow('FPS must be greater than 0');
    });

    it('should throw error for negative duration', () => {
      expect(() => estimateFrameCount(10, -10)).toThrow('Duration cannot be negative');
    });
  });
});
