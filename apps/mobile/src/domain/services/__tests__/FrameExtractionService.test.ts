import { FrameExtractionService } from '../FrameExtractionService';
import { MockVideoProcessingAdapter } from '@domain/adapters/mock/MockVideoProcessingAdapter';
import type { FrameExtractionRequest } from '@domain/models';
import { isValid } from '@domain/models';
import { VideoProcessingError } from '@domain/adapters/native/VideoProcessingError';

describe('FrameExtractionService', () => {
  let adapter: MockVideoProcessingAdapter;
  let service: FrameExtractionService;

  beforeEach(() => {
    adapter = new MockVideoProcessingAdapter();
    service = new FrameExtractionService(adapter);
  });

  const validRequest: FrameExtractionRequest = {
    videoPath: '/path/to/video.mp4',
    outputDirectory: '/path/to/output',
    strategy: { type: 'uniform', frameCount: 100 },
    quality: 2,
  };

  describe('extractFrames', () => {
    it('should extract frames successfully with uniform strategy', async () => {
      const result = await service.extractFrames(validRequest);

      expect(result.totalFrames).toBeGreaterThan(0);
      expect(result.frames).toHaveLength(result.totalFrames);
      expect(result.strategy).toEqual(validRequest.strategy);
      expect(result.processingTimeMs).toBeGreaterThan(0);
    });

    it('should extract frames with interval strategy', async () => {
      const request: FrameExtractionRequest = {
        ...validRequest,
        strategy: { type: 'interval', intervalSeconds: 2 },
      };

      const result = await service.extractFrames(request);

      expect(result.totalFrames).toBeGreaterThan(0);
      expect(result.strategy).toEqual(request.strategy);
    });

    it('should extract frames with frame-based strategy', async () => {
      const request: FrameExtractionRequest = {
        ...validRequest,
        strategy: { type: 'frame-based', frameInterval: 30 },
      };

      const result = await service.extractFrames(request);

      expect(result.totalFrames).toBeGreaterThan(0);
      expect(result.strategy).toEqual(request.strategy);
    });

    it('should extract frames with all-frames strategy', async () => {
      const request: FrameExtractionRequest = {
        ...validRequest,
        strategy: { type: 'all-frames' },
      };

      const result = await service.extractFrames(request);

      expect(result.totalFrames).toBeGreaterThan(0);
      expect(result.strategy).toEqual(request.strategy);
    });

    it('should extract frames with custom-fps strategy', async () => {
      const request: FrameExtractionRequest = {
        ...validRequest,
        strategy: { type: 'custom-fps', fps: 5 },
      };

      const result = await service.extractFrames(request);

      expect(result.totalFrames).toBeGreaterThan(0);
      expect(result.strategy).toEqual(request.strategy);
    });

    it('should include frame info with timestamps', async () => {
      const result = await service.extractFrames(validRequest);

      expect(result.frames.length).toBeGreaterThan(0);
      result.frames.forEach((frame, index) => {
        expect(frame.frameNumber).toBe(index);
        expect(frame.timestamp).toBeGreaterThanOrEqual(0);
        expect(frame.path).toBeTruthy();
      });
    });

    it('should calculate timestamps correctly', async () => {
      const result = await service.extractFrames(validRequest);

      // Timestamps should be increasing
      for (let i = 1; i < result.frames.length; i++) {
        expect(result.frames[i].timestamp).toBeGreaterThan(result.frames[i - 1].timestamp);
      }
    });

    it('should use default quality when not specified', async () => {
      const request: FrameExtractionRequest = {
        videoPath: '/path/to/video.mp4',
        outputDirectory: '/path/to/output',
        strategy: { type: 'uniform', frameCount: 100 },
      };

      const result = await service.extractFrames(request);
      expect(result).toBeDefined();
    });

    it('should throw error for invalid request', async () => {
      const invalidRequest: FrameExtractionRequest = {
        ...validRequest,
        videoPath: '',
      };

      await expect(service.extractFrames(invalidRequest)).rejects.toThrow(VideoProcessingError);
    });

    it('should throw error for invalid strategy', async () => {
      const invalidRequest: FrameExtractionRequest = {
        ...validRequest,
        strategy: { type: 'uniform', frameCount: 0 },
      };

      await expect(service.extractFrames(invalidRequest)).rejects.toThrow(VideoProcessingError);
    });

    it('should throw error when storage limit exceeded', async () => {
      const request: FrameExtractionRequest = {
        ...validRequest,
        strategy: { type: 'uniform', frameCount: 10000 },
        quality: 1, // High quality for maximum storage
      };

      await expect(service.extractFrames(request)).rejects.toThrow(VideoProcessingError);
    });

    it('should propagate adapter errors', async () => {
      adapter.setShouldFail(true);

      await expect(service.extractFrames(validRequest)).rejects.toThrow(VideoProcessingError);
    });
  });

  describe('planExtraction', () => {
    it('should create extraction plan', async () => {
      const plan = await service.planExtraction(validRequest);

      expect(plan.videoPath).toBe(validRequest.videoPath);
      expect(plan.outputDirectory).toBe(validRequest.outputDirectory);
      expect(plan.strategy).toEqual(validRequest.strategy);
      expect(plan.quality).toBe(2);
      expect(plan.extractionFps).toBeGreaterThan(0);
      expect(plan.estimatedFrameCount).toBeGreaterThan(0);
      expect(plan.estimatedStorageMB).toBeGreaterThan(0);
      expect(plan.estimatedDurationMs).toBeGreaterThan(0);
      expect(plan.videoDuration).toBeGreaterThan(0);
      expect(plan.videoFps).toBeGreaterThan(0);
      expect(plan.videoResolution.width).toBeGreaterThan(0);
      expect(plan.videoResolution.height).toBeGreaterThan(0);
    });

    it('should create plan without executing extraction', async () => {
      const mockExtractFramesSpy = jest.spyOn(adapter, 'extractFrames');

      await service.planExtraction(validRequest);

      expect(mockExtractFramesSpy).not.toHaveBeenCalled();

      mockExtractFramesSpy.mockRestore();
    });

    it('should calculate different FPS for different strategies', async () => {
      const uniformPlan = await service.planExtraction({
        ...validRequest,
        strategy: { type: 'uniform', frameCount: 100 },
      });

      const intervalPlan = await service.planExtraction({
        ...validRequest,
        strategy: { type: 'interval', intervalSeconds: 2 },
      });

      const allFramesPlan = await service.planExtraction({
        ...validRequest,
        strategy: { type: 'all-frames' },
      });

      expect(uniformPlan.extractionFps).not.toBe(intervalPlan.extractionFps);
      expect(intervalPlan.extractionFps).not.toBe(allFramesPlan.extractionFps);
    });

    it('should throw error for invalid request', async () => {
      const invalidRequest: FrameExtractionRequest = {
        ...validRequest,
        outputDirectory: '',
      };

      await expect(service.planExtraction(invalidRequest)).rejects.toThrow(VideoProcessingError);
    });
  });

  describe('validateRequest', () => {
    it('should return valid result for valid request', () => {
      const result = service.validateRequest(validRequest);
      expect(isValid(result)).toBe(true);
    });

    it('should return invalid result for invalid request', () => {
      const invalidRequest: FrameExtractionRequest = {
        ...validRequest,
        videoPath: '',
      };

      const result = service.validateRequest(invalidRequest);
      expect(isValid(result)).toBe(false);
    });

    it('should collect all validation errors', () => {
      const invalidRequest: FrameExtractionRequest = {
        videoPath: '',
        outputDirectory: '',
        strategy: { type: 'uniform', frameCount: 0 },
        quality: 0,
      };

      const result = service.validateRequest(invalidRequest);
      expect(isValid(result)).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThan(1);
      }
    });
  });

  describe('cancelExtraction', () => {
    it('should delegate to adapter', async () => {
      const cancelSpy = jest.spyOn(adapter, 'cancelOperation');

      await service.cancelExtraction();

      expect(cancelSpy).toHaveBeenCalled();

      cancelSpy.mockRestore();
    });
  });

  describe('integration tests', () => {
    it('should handle complete workflow from request to result', async () => {
      // 1. Validate request
      const validation = service.validateRequest(validRequest);
      expect(isValid(validation)).toBe(true);

      // 2. Create plan
      const plan = await service.planExtraction(validRequest);
      expect(plan.estimatedFrameCount).toBeGreaterThan(0);

      // 3. Execute extraction
      const result = await service.extractFrames(validRequest);
      expect(result.totalFrames).toBeGreaterThan(0);
      expect(result.frames).toHaveLength(result.totalFrames);
    });

    it('should work with all strategy types end-to-end', async () => {
      const strategies = [
        { type: 'uniform' as const, frameCount: 50 },
        { type: 'interval' as const, intervalSeconds: 1 },
        { type: 'frame-based' as const, frameInterval: 15 },
        { type: 'all-frames' as const },
        { type: 'custom-fps' as const, fps: 2 },
      ];

      for (const strategy of strategies) {
        const request: FrameExtractionRequest = {
          ...validRequest,
          strategy,
        };

        const result = await service.extractFrames(request);
        expect(result.totalFrames).toBeGreaterThan(0);
        expect(result.strategy).toEqual(strategy);
      }
    });

    it('should produce consistent results for same request', async () => {
      const result1 = await service.extractFrames(validRequest);
      const result2 = await service.extractFrames(validRequest);

      expect(result1.totalFrames).toBe(result2.totalFrames);
      expect(result1.strategy).toEqual(result2.strategy);
    });
  });
});
