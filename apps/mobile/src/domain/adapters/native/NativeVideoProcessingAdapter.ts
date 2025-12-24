import { NativeModules } from 'react-native';
import type {
  VideoProcessingAdapter,
  FrameExtractionConfig,
  FrameExtractionResult,
  VideoMetadata,
} from '../VideoProcessingAdapter';
import { mapNativeErrorToVideoProcessingError } from './VideoProcessingError';

/**
 * Native module interface definition
 */
interface VideoProcessingModuleInterface {
  extractFrames(
    videoPath: string,
    outputDirectory: string,
    frameRate?: number,
    quality?: number,
  ): Promise<{
    outputPaths: string[];
    frameCount: number;
    processingTimeMs: number;
  }>;

  getVideoMetadata(videoPath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    frameRate: number;
    codec: string;
    bitrate: number;
  }>;

  cancelOperation(): Promise<void>;
}

const { VideoProcessingModule } = NativeModules;

if (!VideoProcessingModule) {
  throw new Error(
    'VideoProcessingModule is not available. Make sure the native module is properly linked.',
  );
}

/**
 * Native implementation of VideoProcessingAdapter
 * Bridges TypeScript to iOS/Android native code via React Native
 */
export class NativeVideoProcessingAdapter implements VideoProcessingAdapter {
  private module: VideoProcessingModuleInterface = VideoProcessingModule;

  /**
   * Extract frames from a video file
   */
  async extractFrames(config: FrameExtractionConfig): Promise<FrameExtractionResult> {
    try {
      const result = await this.module.extractFrames(
        config.videoPath,
        config.outputDirectory,
        config.frameRate,
        config.quality,
      );

      return {
        outputPaths: result.outputPaths,
        frameCount: result.frameCount,
        processingTimeMs: result.processingTimeMs,
      };
    } catch (error) {
      throw mapNativeErrorToVideoProcessingError(error);
    }
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    try {
      const metadata = await this.module.getVideoMetadata(videoPath);

      return {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        frameRate: metadata.frameRate,
        codec: metadata.codec,
        bitrate: metadata.bitrate,
      };
    } catch (error) {
      throw mapNativeErrorToVideoProcessingError(error);
    }
  }

  /**
   * Cancel ongoing video processing operation
   */
  async cancelOperation(): Promise<void> {
    try {
      await this.module.cancelOperation();
    } catch (error) {
      throw mapNativeErrorToVideoProcessingError(error);
    }
  }
}
