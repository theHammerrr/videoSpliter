import type {
  VideoProcessingAdapter,
  FrameExtractionConfig,
  FrameExtractionResult,
  VideoMetadata,
} from '../VideoProcessingAdapter';
import { VideoProcessingError, VideoProcessingErrorCode } from '../native/VideoProcessingError';

/**
 * Mock implementation for testing
 * Simulates video processing operations without requiring native code
 */
export class MockVideoProcessingAdapter implements VideoProcessingAdapter {
  private shouldFail = false;
  private cancelRequested = false;

  /**
   * Test helper: Configure adapter to fail
   */
  setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  /**
   * Extract frames from video (mocked)
   */
  async extractFrames(config: FrameExtractionConfig): Promise<FrameExtractionResult> {
    if (this.shouldFail) {
      throw new VideoProcessingError(
        'Mock extraction failed',
        VideoProcessingErrorCode.FFMPEG_FAILED,
      );
    }

    if (this.cancelRequested) {
      this.cancelRequested = false;
      throw new VideoProcessingError('Operation cancelled', VideoProcessingErrorCode.CANCELLED);
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate progress (if callback provided in future)
    await new Promise(resolve => setTimeout(resolve, 50));

    // Generate mock frame paths
    const frameCount = config.frameRate ? Math.floor(10 * config.frameRate) : 300; // 10 seconds of video
    const mockPaths = Array.from(
      { length: Math.min(frameCount, 3) },
      (_, i) => `/mock/output/frame_${String(i + 1).padStart(4, '0')}.jpg`,
    );

    return {
      outputPaths: mockPaths,
      frameCount: mockPaths.length,
      processingTimeMs: 150,
    };
  }

  /**
   * Get video metadata (mocked)
   */
  async getVideoMetadata(_videoPath: string): Promise<VideoMetadata> {
    if (this.shouldFail) {
      throw new VideoProcessingError(
        'Mock metadata extraction failed',
        VideoProcessingErrorCode.VIDEO_NOT_FOUND,
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      duration: 10.5,
      width: 1920,
      height: 1080,
      frameRate: 30,
      codec: 'h264',
      bitrate: 5000000,
    };
  }

  /**
   * Cancel ongoing operation (mocked)
   */
  async cancelOperation(): Promise<void> {
    this.cancelRequested = true;
  }
}
