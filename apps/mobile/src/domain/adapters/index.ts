/**
 * Video Processing Adapters
 * Clean exports for all adapter implementations
 */

// Video Processing Interface and types
export type {
  VideoProcessingAdapter,
  FrameExtractionConfig,
  FrameExtractionResult,
  VideoMetadata,
} from './VideoProcessingAdapter';

// Video Processing Error types
export {
  VideoProcessingError,
  VideoProcessingErrorCode,
  mapNativeErrorToVideoProcessingError,
} from './native/VideoProcessingError';

// Video Processing Implementations
export { NativeVideoProcessingAdapter } from './native/NativeVideoProcessingAdapter';
export { MockVideoProcessingAdapter } from './mock/MockVideoProcessingAdapter';

// Permission Adapter
export type { PermissionAdapter } from './PermissionAdapter';
export { PermissionStatus, PermissionType } from './PermissionAdapter';
export { NativePermissionAdapter } from './native/NativePermissionAdapter';

// File Picker Adapter
export type { FilePickerAdapter, VideoFile } from './FilePickerAdapter';
export { NativeFilePickerAdapter } from './native/NativeFilePickerAdapter';
