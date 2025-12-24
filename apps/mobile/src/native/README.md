# Native Modules

This directory contains documentation and bridge code for native modules used in VideoSpliter.

## Overview

VideoSpliter uses native modules for performance-critical operations that cannot be efficiently implemented in JavaScript:

- **Video Processing (FFmpeg)**: Frame extraction, metadata retrieval, and video manipulation

## FFmpeg Video Processing Module

### Purpose

The FFmpeg module enables high-performance video operations using the industry-standard FFmpeg library. It provides:

1. **Frame Extraction**: Extract individual frames from videos at specified intervals
2. **Video Metadata**: Retrieve detailed video information (duration, resolution, codec, etc.)
3. **Operation Cancellation**: Cancel long-running operations

### Architecture

```
TypeScript Application
    ↓
VideoProcessingAdapter Interface (@adapters/VideoProcessingAdapter)
    ↓
NativeVideoProcessingAdapter (@adapters/native/NativeVideoProcessingAdapter)
    ↓
React Native Bridge
    ↓
VideoProcessingModule (Swift/Kotlin)
    ↓
FFmpegVideoProcessor
    ↓
ffmpeg-kit-react-native Library
```

### Installation

#### iOS Setup

1. **Install CocoaPods dependencies**:

   ```bash
   cd ios
   pod install --repo-update
   ```

2. **Add Swift files to Xcode**:

   - Open `ios/VideoSpliter.xcworkspace` in Xcode
   - Right-click on the `VideoSpliter` group
   - Select "Add Files to VideoSpliter..."
   - Navigate to `ios/VideoSpliter/FFmpeg/`
   - Select all `.swift` files (NOT the `.m` file - it's already included)
   - Ensure "Copy items if needed" is **unchecked**
   - Ensure "Create groups" is selected
   - Click "Add"

3. **Verify build settings**:

   - Select the VideoSpliter project in Xcode
   - Go to Build Settings
   - Ensure `ENABLE_BITCODE` is set to `NO` (required by FFmpeg)
   - Ensure `SWIFT_VERSION` is `5.0` or higher

4. **Build the project**:
   ```bash
   cd ios
   xcodebuild -workspace VideoSpliter.xcworkspace -scheme VideoSpliter -configuration Debug
   ```

#### Android Setup (Future)

Android support is planned for Issue #2.

### Usage

#### Basic Frame Extraction

```typescript
import { NativeVideoProcessingAdapter } from '@adapters/native/NativeVideoProcessingAdapter';
import type { FrameExtractionConfig } from '@adapters/VideoProcessingAdapter';
import { VideoProcessingError, VideoProcessingErrorCode } from '@adapters';

const adapter = new NativeVideoProcessingAdapter();

async function extractVideoFrames() {
  const config: FrameExtractionConfig = {
    videoPath: '/path/to/video.mp4',
    outputDirectory: '/path/to/output/frames',
    frameRate: 1, // Extract 1 frame per second
    quality: 2, // High quality (1-31, lower is better)
  };

  try {
    const result = await adapter.extractFrames(config);

    console.log(`Extracted ${result.frameCount} frames`);
    console.log(`Processing took ${result.processingTimeMs}ms`);
    console.log(`Output files:`, result.outputPaths);

    // result.outputPaths contains paths like:
    // ['/path/to/output/frames/frame_0001.jpg', '/path/to/output/frames/frame_0002.jpg', ...]
  } catch (error) {
    if (error instanceof VideoProcessingError) {
      handleVideoError(error);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

#### Extract All Frames (No Frame Rate Limit)

```typescript
const config: FrameExtractionConfig = {
  videoPath: '/path/to/video.mp4',
  outputDirectory: '/path/to/output/frames',
  // Omit frameRate to extract all frames
  quality: 5, // Medium quality for faster processing
};

const result = await adapter.extractFrames(config);
// For a 30fps video that's 10 seconds long, this will extract ~300 frames
```

#### Extract Frames for Preview Thumbnails

```typescript
const config: FrameExtractionConfig = {
  videoPath: '/path/to/video.mp4',
  outputDirectory: '/path/to/thumbnails',
  frameRate: 0.1, // Extract 1 frame every 10 seconds
  quality: 10, // Lower quality for smaller file size
};

const result = await adapter.extractFrames(config);
```

#### Get Video Metadata

```typescript
async function getVideoInfo(videoPath: string) {
  try {
    const metadata = await adapter.getVideoMetadata(videoPath);

    console.log(`Duration: ${metadata.duration} seconds`);
    console.log(`Resolution: ${metadata.width}x${metadata.height}`);
    console.log(`Frame rate: ${metadata.frameRate} fps`);
    console.log(`Codec: ${metadata.codec}`);
    console.log(`Bitrate: ${metadata.bitrate} bps`);

    return metadata;
  } catch (error) {
    if (error instanceof VideoProcessingError) {
      if (error.code === VideoProcessingErrorCode.VIDEO_NOT_FOUND) {
        console.error('Video file not found');
      } else {
        console.error('Failed to read video metadata:', error.message);
      }
    }
    throw error;
  }
}
```

#### Cancel Long-Running Operation

```typescript
async function extractWithCancellation() {
  const extractionPromise = adapter.extractFrames({
    videoPath: '/path/to/long-video.mp4',
    outputDirectory: '/path/to/output',
    // No frameRate = extract all frames (could take a while)
  });

  // User clicks cancel button after 5 seconds
  setTimeout(async () => {
    await adapter.cancelOperation();
    console.log('Operation cancelled by user');
  }, 5000);

  try {
    const result = await extractionPromise;
    console.log('Completed successfully:', result);
  } catch (error) {
    if (
      error instanceof VideoProcessingError &&
      error.code === VideoProcessingErrorCode.CANCELLED
    ) {
      console.log('Operation was cancelled');
      // Clean up any partial output files if needed
    } else {
      console.error('Operation failed:', error);
    }
  }
}
```

### Error Handling

#### Error Codes

The adapter throws `VideoProcessingError` instances with the following error codes:

| Error Code             | Description                   | Cause                               | Resolution                   |
| ---------------------- | ----------------------------- | ----------------------------------- | ---------------------------- |
| `INVALID_VIDEO_PATH`   | Video path is invalid         | Empty or malformed path             | Validate path before calling |
| `VIDEO_NOT_FOUND`      | Video file doesn't exist      | File deleted or wrong path          | Check file exists            |
| `FFMPEG_FAILED`        | FFmpeg execution failed       | Corrupted video, unsupported format | Validate video file          |
| `CANCELLED`            | Operation was cancelled       | User called `cancelOperation()`     | Expected, no action needed   |
| `INSUFFICIENT_STORAGE` | Not enough disk space         | Low storage for frames              | Free up space                |
| `INVALID_FRAME_RATE`   | Frame rate out of range       | Negative or zero frameRate          | Use positive value or omit   |
| `OUTPUT_DIR_FAILED`    | Can't create output directory | Permission issues                   | Check permissions            |
| `UNKNOWN_ERROR`        | Unexpected error              | Various platform issues             | Check logs, file bug         |

#### Error Handling Patterns

**Pattern 1: Specific Error Handling**

```typescript
try {
  const result = await adapter.extractFrames(config);
  return result;
} catch (error) {
  if (error instanceof VideoProcessingError) {
    switch (error.code) {
      case VideoProcessingErrorCode.VIDEO_NOT_FOUND:
        showUserAlert('Video not found', 'The selected video file could not be found.');
        break;

      case VideoProcessingErrorCode.INSUFFICIENT_STORAGE:
        showUserAlert(
          'Storage full',
          'Not enough space to extract frames. Please free up storage.',
        );
        break;

      case VideoProcessingErrorCode.CANCELLED:
        // User cancelled, no alert needed
        console.log('User cancelled operation');
        break;

      case VideoProcessingErrorCode.FFMPEG_FAILED:
        showUserAlert(
          'Invalid video',
          'This video file appears to be corrupted or in an unsupported format.',
        );
        break;

      default:
        showUserAlert('Error', `Failed to process video: ${error.message}`);
        logErrorToAnalytics(error);
    }
  } else {
    // Unexpected error type
    showUserAlert('Error', 'An unexpected error occurred');
    logErrorToAnalytics(error);
  }
  throw error; // Re-throw for caller to handle
}
```

**Pattern 2: Validation Before Processing**

```typescript
import RNFS from 'react-native-fs';

async function extractFramesWithValidation(videoPath: string, outputDir: string) {
  // Pre-flight checks
  const fileExists = await RNFS.exists(videoPath);
  if (!fileExists) {
    throw new Error('Video file does not exist');
  }

  const fileInfo = await RNFS.stat(videoPath);
  const freeSpace = await RNFS.getFSInfo();

  // Estimate: video size * 0.5 (rough estimate for frames)
  const estimatedFrameSize = fileInfo.size * 0.5;
  if (freeSpace.freeSpace < estimatedFrameSize) {
    throw new Error('Insufficient storage space');
  }

  // Proceed with extraction
  try {
    const result = await adapter.extractFrames({
      videoPath,
      outputDirectory: outputDir,
      frameRate: 1,
      quality: 2,
    });
    return result;
  } catch (error) {
    // Handle errors
    throw error;
  }
}
```

**Pattern 3: Cleanup on Error**

```typescript
import RNFS from 'react-native-fs';

async function extractFramesWithCleanup(videoPath: string, outputDir: string): Promise<string[]> {
  // Create temp directory
  const tempDir = `${outputDir}/temp_${Date.now()}`;
  await RNFS.mkdir(tempDir);

  try {
    const result = await adapter.extractFrames({
      videoPath,
      outputDirectory: tempDir,
      frameRate: 1,
      quality: 2,
    });

    // Move frames to final location
    // ... move logic ...

    return result.outputPaths;
  } catch (error) {
    // Clean up temp directory on error
    try {
      await RNFS.unlink(tempDir);
    } catch (cleanupError) {
      console.warn('Failed to clean up temp directory:', cleanupError);
    }
    throw error;
  }
}
```

### Testing

#### Using Mock Adapter for Unit Tests

```typescript
import { MockVideoProcessingAdapter } from '@adapters/mock/MockVideoProcessingAdapter';

describe('VideoImportService', () => {
  let mockAdapter: MockVideoProcessingAdapter;
  let service: VideoImportService;

  beforeEach(() => {
    mockAdapter = new MockVideoProcessingAdapter();
    service = new VideoImportService(mockAdapter);
  });

  it('should extract frames successfully', async () => {
    const result = await service.importAndExtract('/test/video.mp4');
    expect(result.frameCount).toBeGreaterThan(0);
  });

  it('should handle errors gracefully', async () => {
    mockAdapter.setShouldFail(true);

    await expect(service.importAndExtract('/test/video.mp4')).rejects.toThrow();
  });
});
```

#### Testing on Device/Simulator

1. **Add a test video to the app bundle** (for development only):

   - In Xcode, add a small test video to the project
   - Use `NSBundle.mainBundle()` to get the path

2. **Test with video from photo library**:

   - Use `react-native-image-picker` to select a video
   - Pass the URI to the adapter

3. **Monitor performance**:
   - Use Xcode Instruments to monitor memory usage
   - Check processing time for different video sizes
   - Verify frames are written to disk correctly

### Performance Optimization

#### Frame Rate Selection

```typescript
// For thumbnails/preview: Extract very few frames
const previewConfig = { frameRate: 0.1, quality: 10 };

// For analysis: Extract moderate frames
const analysisConfig = { frameRate: 1, quality: 5 };

// For high-quality output: Extract all frames
const highQualityConfig = { /* no frameRate */, quality: 2 };
```

#### Quality vs File Size

- **Quality 1-2**: High quality, large files (~500KB per frame)
- **Quality 5-10**: Medium quality, moderate files (~200KB per frame)
- **Quality 15-31**: Low quality, small files (~50KB per frame)

#### Processing Time Estimates

| Video | Duration | Frame Rate | Quality | Frames | Time |
| ----- | -------- | ---------- | ------- | ------ | ---- |
| 720p  | 10s      | 1 fps      | 2       | 10     | ~2s  |
| 1080p | 60s      | 1 fps      | 5       | 60     | ~15s |
| 4K    | 120s     | 0.1 fps    | 10      | 12     | ~30s |

_Times are approximate and device-dependent_

### Troubleshooting

#### "VideoProcessingModule is not available"

**Symptoms**: App crashes or throws error when trying to use the adapter

**Causes**:

1. Native module not linked (CocoaPods not installed)
2. Swift files not added to Xcode project
3. App not rebuilt after adding files

**Solutions**:

1. Run `cd ios && pod install --repo-update`
2. Open Xcode and verify FFmpeg folder is in project
3. Clean build folder: `cd ios && xcodebuild clean`
4. Rebuild: `cd ios && xcodebuild -workspace VideoSpliter.xcworkspace -scheme VideoSpliter`

#### Xcode Build Errors

**Error**: `"ld: bitcode bundle could not be generated"`

**Solution**: Disable bitcode in Build Settings (`ENABLE_BITCODE = NO`)

**Error**: `"Use of undeclared type 'FFmpegKit'"`

**Solution**: Run `pod install` again, ensure `ffmpeg-kit-react-native` is in Podfile

**Error**: `"No such module 'ffmpegkit'"`

**Solution**: Clean derived data and rebuild:

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ios && pod install
```

#### High Memory Usage

**Symptoms**: App crashes or slows down when extracting frames from large videos

**Solutions**:

1. Extract fewer frames (increase frame rate interval)
2. Use lower quality setting
3. Process video in chunks (not yet implemented)
4. Close other apps to free memory
5. Test on device with more RAM

#### Slow Processing

**Symptoms**: Frame extraction takes very long

**Causes**:

1. Large video file (4K, long duration)
2. High frame rate (extracting many frames)
3. Running on slow device/simulator

**Solutions**:

1. Optimize frame rate for use case
2. Use lower quality setting for previews
3. Show progress indicator to user
4. Test on physical device (faster than simulator)

#### Output Files Not Found

**Symptoms**: `extractFrames` succeeds but output files don't exist

**Causes**:

1. Invalid output directory path
2. Permission issues
3. Sandboxing restrictions

**Solutions**:

1. Use app's documents directory: `RNFS.DocumentDirectoryPath`
2. Create directory before extraction: `RNFS.mkdir()`
3. Check file permissions in Info.plist

### Best Practices

1. **Always validate input**:

   - Check video file exists before processing
   - Validate output directory is writable
   - Check available storage space

2. **Handle errors gracefully**:

   - Provide user-friendly error messages
   - Log errors for debugging
   - Clean up temporary files on failure

3. **Optimize for use case**:

   - Use appropriate frame rate and quality
   - Don't extract all frames unless necessary
   - Consider device capabilities

4. **Show progress indicators**:

   - Inform users of long-running operations
   - Allow cancellation when appropriate

5. **Clean up resources**:

   - Delete temporary frames when done
   - Cancel operations on component unmount
   - Manage memory carefully

6. **Test thoroughly**:
   - Test with various video formats and sizes
   - Test error cases (missing files, low storage)
   - Monitor performance on real devices

### Platform Support

- **iOS**: ✅ Fully supported (iOS 15.1+)
- **Android**: ⏳ Planned (Issue #2)

### Dependencies

- `ffmpeg-kit-react-native` (min variant) - FFmpeg library
- React Native 0.83.1+
- iOS 15.1+ / Android API level TBD

### Related Documentation

- [Architecture Documentation](../../docs/architecture.md#native-modules---ffmpeg-integration)
- [FFmpeg Official Documentation](https://ffmpeg.org/documentation.html)
- [ffmpeg-kit-react-native](https://github.com/arthenica/ffmpeg-kit)

### License

FFmpeg is licensed under LGPL 2.1. See ffmpeg-kit-react-native documentation for details.

---

**Last Updated**: 2025-12-23
**Status**: iOS implementation complete, Android pending
