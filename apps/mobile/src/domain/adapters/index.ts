/**
 * Video Processing Adapters
 * Clean exports for all adapter implementations
 */

// Interface and types
export type {
  VideoProcessingAdapter,
  FrameExtractionConfig,
  FrameExtractionResult,
  VideoMetadata,
} from './VideoProcessingAdapter';

// Error types
export {
  VideoProcessingError,
  VideoProcessingErrorCode,
  mapNativeErrorToVideoProcessingError,
} from './native/VideoProcessingError';

// Implementations
export { NativeVideoProcessingAdapter } from './native/NativeVideoProcessingAdapter';
export { MockVideoProcessingAdapter } from './mock/MockVideoProcessingAdapter';
