import { MockVideoProcessingAdapter } from '../mock/MockVideoProcessingAdapter';
import { VideoProcessingErrorCode } from '../native/VideoProcessingError';

describe('VideoProcessingAdapter', () => {
  let adapter: MockVideoProcessingAdapter;

  beforeEach(() => {
    adapter = new MockVideoProcessingAdapter();
  });

  describe('extractFrames', () => {
    it('should extract frames successfully', async () => {
      const result = await adapter.extractFrames({
        videoPath: '/test/video.mp4',
        outputDirectory: '/test/output',
      });

      expect(result.frameCount).toBeGreaterThan(0);
      expect(result.outputPaths).toHaveLength(result.frameCount);
      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(result.outputPaths[0]).toContain('frame_');
    });

    it('should use custom frame rate', async () => {
      const result = await adapter.extractFrames({
        videoPath: '/test/video.mp4',
        outputDirectory: '/test/output',
        frameRate: 5,
      });

      expect(result.frameCount).toBeGreaterThan(0);
    });

    it('should use custom quality', async () => {
      const result = await adapter.extractFrames({
        videoPath: '/test/video.mp4',
        outputDirectory: '/test/output',
        quality: 10,
      });

      expect(result.frameCount).toBeGreaterThan(0);
    });

    it('should throw error on failure', async () => {
      adapter.setShouldFail(true);

      await expect(
        adapter.extractFrames({
          videoPath: '/test/video.mp4',
          outputDirectory: '/test/output',
        }),
      ).rejects.toThrow('Mock extraction failed');
    });

    it('should throw error with correct code on failure', async () => {
      adapter.setShouldFail(true);

      try {
        await adapter.extractFrames({
          videoPath: '/test/video.mp4',
          outputDirectory: '/test/output',
        });
        fail('Should have thrown error');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error) {
          expect(error.code).toBe(VideoProcessingErrorCode.FFMPEG_FAILED);
        } else {
          fail('Error does not have code property');
        }
      }
    });

    it('should handle cancellation', async () => {
      const extractionPromise = adapter.extractFrames({
        videoPath: '/test/video.mp4',
        outputDirectory: '/test/output',
      });

      // Cancel immediately
      await adapter.cancelOperation();

      try {
        await extractionPromise;
        fail('Should have thrown cancellation error');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error) {
          expect(error.code).toBe(VideoProcessingErrorCode.CANCELLED);
        } else {
          fail('Error does not have code property');
        }
      }
    });
  });

  describe('getVideoMetadata', () => {
    it('should return video metadata', async () => {
      const metadata = await adapter.getVideoMetadata('/test/video.mp4');

      expect(metadata.duration).toBeGreaterThan(0);
      expect(metadata.width).toBeGreaterThan(0);
      expect(metadata.height).toBeGreaterThan(0);
      expect(metadata.frameRate).toBeGreaterThan(0);
      expect(metadata.codec).toBeDefined();
      expect(metadata.codec).toBe('h264');
      expect(metadata.bitrate).toBeGreaterThan(0);
    });

    it('should throw error for non-existent video', async () => {
      adapter.setShouldFail(true);

      await expect(adapter.getVideoMetadata('/nonexistent/video.mp4')).rejects.toThrow(
        'Mock metadata extraction failed',
      );
    });

    it('should throw error with correct code on failure', async () => {
      adapter.setShouldFail(true);

      try {
        await adapter.getVideoMetadata('/nonexistent/video.mp4');
        fail('Should have thrown error');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error) {
          expect(error.code).toBe(VideoProcessingErrorCode.VIDEO_NOT_FOUND);
        } else {
          fail('Error does not have code property');
        }
      }
    });
  });

  describe('cancelOperation', () => {
    it('should cancel without error', async () => {
      await expect(adapter.cancelOperation()).resolves.not.toThrow();
    });
  });
});
