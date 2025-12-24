# Architecture Documentation

## Overview

VideoSpliter follows a **layered architecture** with clear boundaries between concerns. The architecture emphasizes:

- **Testability**: Pure domain logic separate from framework code
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features without breaking existing code
- **Type Safety**: TypeScript strict mode throughout

## Architecture Layers

### 1. App Layer (`src/app/`)

**Purpose**: Application shell and cross-cutting concerns

**Responsibilities**:

- App entry point and initialization
- Navigation setup
- Global providers (theme, state, context)
- App-level error boundaries

**Rules**:

- Can import from any layer
- Should be thin - delegate to other layers
- No business logic here

**Example**:

```typescript
// src/app/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './providers/ThemeProvider';
import { RootNavigator } from './navigation/RootNavigator';
```

### 2. Features Layer (`src/features/`)

**Purpose**: Vertical slices of functionality

**Responsibilities**:

- Feature-specific screens and navigation
- Feature state management
- Coordinating domain services and UI

**Rules**:

- Each feature is self-contained
- Features should not import from other features
- Can import from domain, ui, lib, config

**Structure**:

```
features/
├── import/           # Video import feature
│   ├── screens/
│   ├── components/
│   └── hooks/
├── split/            # Video splitting feature
├── export/           # Export and share feature
└── settings/         # App settings
```

### 3. Domain Layer (`src/domain/`)

**Purpose**: Pure business logic

**Responsibilities**:

- Business rules and logic
- Data models and types
- Domain-specific algorithms

**Rules**:

- **PURE TypeScript only** - no React, no React Native, no native modules
- No side effects (IO, network, storage)
- Can be tested in Node.js without React Native
- Can only import from other domain code or `lib/`

**Example**:

```typescript
// src/domain/video/VideoSegment.ts
export interface VideoSegment {
  startTime: number;
  endTime: number;
  duration: number;
}

export function calculateSegmentDuration(segment: VideoSegment): number {
  return segment.endTime - segment.startTime;
}
```

### 4. Services Layer (`src/domain/services/`)

**Purpose**: Use-cases and orchestration

**Responsibilities**:

- Coordinate domain logic and adapters
- Implement use-cases (user actions)
- Orchestrate complex operations

**Rules**:

- Can import domain logic and adapters
- Should be pure functions or classes
- Return values, not side effects (adapters do side effects)

**Example**:

```typescript
// src/domain/services/VideoImportService.ts
export class VideoImportService {
  constructor(private fileAdapter: FileSystemAdapter, private videoAdapter: VideoAdapter) {}

  async importVideo(uri: string): Promise<VideoMetadata> {
    const metadata = await this.videoAdapter.extractMetadata(uri);
    await this.fileAdapter.copyToAppStorage(uri);
    return metadata;
  }
}
```

### 5. Adapters Layer (`src/domain/adapters/`)

**Purpose**: Side effect isolation

**Responsibilities**:

- All IO operations (filesystem, network, database)
- Native module access
- Third-party library integration
- Platform-specific implementations

**Rules**:

- Define interfaces for all adapters
- Implement platform-specific versions if needed
- Must be mockable for testing
- This is the ONLY layer that can access native APIs

**Example**:

```typescript
// src/domain/adapters/FileSystemAdapter.ts
export interface FileSystemAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

// Implementation uses React Native FS
export class RNFileSystemAdapter implements FileSystemAdapter {
  async readFile(path: string): Promise<string> {
    return RNFS.readFile(path);
  }
  // ... other methods
}
```

### 6. UI Layer (`src/ui/`)

**Purpose**: Reusable UI components

**Responsibilities**:

- Generic, reusable components
- Design system components
- No feature-specific logic

**Rules**:

- Should be "dumb" components (presentation only)
- Can import from `lib/` and `config/`
- Should not access native APIs directly
- Should be highly reusable

**Example**:

```typescript
// src/ui/Button.tsx
export function Button({ title, onPress }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

### 7. Lib Layer (`src/lib/`)

**Purpose**: Utility functions and helpers

**Responsibilities**:

- Pure utility functions
- Type guards and validators
- Date/time formatting
- String manipulation

**Rules**:

- All functions must be pure
- Well-tested
- No dependencies on other app code
- Framework-agnostic when possible

**Example**:

```typescript
// src/lib/time.ts
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${seconds % 60}`;
}
```

### 8. Config Layer (`src/config/`)

**Purpose**: Configuration and constants

**Responsibilities**:

- App configuration
- Environment variables
- Feature flags
- Constants

**Rules**:

- No logic, only data
- Can be imported by any layer
- Should be typed

**Example**:

```typescript
// src/config/app.ts
export const APP_CONFIG = {
  maxVideoSize: 500 * 1024 * 1024, // 500 MB
  supportedFormats: ['mp4', 'mov', 'avi'],
  defaultFrameRate: 30,
} as const;
```

## Dependency Rules

```
┌─────────────────────────────────────┐
│              App Layer              │  ← Can import everything
├─────────────────────────────────────┤
│           Features Layer            │  ← Can import: Domain, UI, Lib, Config
├─────────────────────────────────────┤
│  Services ──→ Adapters ──→ Domain   │  ← Pure TypeScript only
├─────────────────────────────────────┤
│             UI Layer                │  ← Can import: Lib, Config
├─────────────────────────────────────┤
│            Lib Layer                │  ← Pure utilities
├─────────────────────────────────────┤
│           Config Layer              │  ← No dependencies
└─────────────────────────────────────┘
```

## Data Flow

### Read Flow (User Action → Display)

```
User Interaction
    ↓
Feature Screen
    ↓
Service (use-case)
    ↓
Adapter (fetch data)
    ↓
Domain Model (transform)
    ↓
UI Component (render)
```

### Write Flow (User Input → Persistence)

```
User Input
    ↓
Feature Screen (validate)
    ↓
Service (orchestrate)
    ↓
Domain Logic (business rules)
    ↓
Adapter (persist)
    ↓
Native Module / API
```

## Path Aliases

TypeScript path aliases make imports cleaner:

```typescript
import { App } from '@app/App';
import { VideoImport } from '@features/import';
import { VideoSegment } from '@domain/video';
import { FileAdapter } from '@adapters/FileSystemAdapter';
import { Button } from '@ui/Button';
import { formatDuration } from '@lib/time';
import { APP_CONFIG } from '@config/app';
```

## Testing Strategy

### Unit Tests

- **Domain**: Test all business logic (pure functions, easy to test)
- **Services**: Test orchestration with mocked adapters
- **Utils**: Test all utility functions

### Integration Tests

- Test services with real adapters in controlled environment
- Test feature flows end-to-end

### Component Tests

- Test UI components in isolation
- Use React Test Renderer

### E2E Tests (Future)

- Detox or Maestro
- Test critical user journeys

## State Management

### Local State

- Use React hooks (`useState`, `useReducer`) for component-local state
- Keep state as close to where it's used as possible

### Shared State

- Context API for cross-cutting concerns (theme, auth)
- Avoid prop drilling

### Future Considerations

- If state management becomes complex, consider Zustand or Jotai
- Avoid heavy libraries like Redux unless absolutely necessary

## Error Handling

### Domain Layer

- Throw typed errors
- Define custom error classes

```typescript
export class VideoProcessingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}
```

### Adapter Layer

- Catch platform errors
- Transform to domain errors
- Log for debugging

### UI Layer

- Error boundaries for crash prevention
- User-friendly error messages
- Retry mechanisms where appropriate

## Performance Considerations

1. **Lazy Loading**: Load features on demand
2. **Memoization**: Use `React.memo`, `useMemo`, `useCallback` appropriately
3. **List Virtualization**: Use `FlatList` for long lists
4. **Image Optimization**: Lazy load images, use appropriate sizes
5. **Native Modules**: Offload heavy processing to native code

## Future Architectural Decisions

### Native Modules

- FFmpeg integration will go in `adapters/`
- Define TypeScript interfaces first
- Implement Android (Kotlin) and iOS (Swift) separately
- Use code generation for TypeScript bindings

### Navigation

- React Navigation (chosen for React Native)
- Define navigation types centrally
- Feature-based navigation structure

### Styling

- StyleSheet.create for performance
- Consider styled-components if needed
- Theme system via Context

## Native Modules - FFmpeg Integration

### Overview

VideoSpliter uses **FFmpeg** for video processing through a native module bridge. The implementation follows the adapter pattern with clear separation between TypeScript and native code.

**Key Components**:

- **TypeScript Adapter Interface**: `VideoProcessingAdapter` defines the contract
- **Native Implementations**: iOS (Swift) and Android (Kotlin) - currently iOS only
- **Mock Adapter**: For testing without native dependencies
- **FFmpeg Library**: ffmpeg-kit-react-native (min variant, ~30-40MB)

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│           TypeScript Layer (JavaScript)                 │
├─────────────────────────────────────────────────────────┤
│  NativeVideoProcessingAdapter                           │
│    - Implements VideoProcessingAdapter interface        │
│    - Calls NativeModules.VideoProcessingModule          │
│    - Transforms errors to domain errors                 │
├─────────────────────────────────────────────────────────┤
│           React Native Bridge (Objective-C)             │
├─────────────────────────────────────────────────────────┤
│  VideoProcessingModule.m                                │
│    - RCT_EXTERN_MODULE exposes Swift to RN              │
│    - RCT_EXTERN_METHOD exposes Swift methods            │
├─────────────────────────────────────────────────────────┤
│              Native Layer (Swift)                       │
├─────────────────────────────────────────────────────────┤
│  VideoProcessingModule                                  │
│    - @objc methods callable from JavaScript             │
│    - Promise-based async API                            │
│    - Delegates to FFmpegVideoProcessor                  │
│                                                          │
│  FFmpegVideoProcessor                                   │
│    - Core FFmpeg processing logic                       │
│    - Builds and executes FFmpeg commands                │
│    - Error handling and result collection               │
├─────────────────────────────────────────────────────────┤
│       FFmpeg Kit Library (Pre-built Binary)             │
└─────────────────────────────────────────────────────────┘
```

### Video Processing Data Flow

#### Frame Extraction Flow

```
TypeScript (Feature/Service)
    ↓
NativeVideoProcessingAdapter.extractFrames()
    ↓
NativeModules.VideoProcessingModule.extractFrames()
    ↓  [React Native Bridge]
    ↓
VideoProcessingModule.swift (RN Bridge)
    ↓
FFmpegVideoProcessor.extractFrames()
    ↓
FFmpegKit.execute(command)
    ↓  [Native FFmpeg Execution]
    ↓
Frame files written to disk
    ↓
Result { outputPaths, frameCount, processingTimeMs }
    ↓  [Back through bridge]
    ↓
TypeScript receives FrameExtractionResult
```

#### Error Flow

```
Swift Error (VideoProcessorError)
    ↓
RN Bridge (reject promise with code & message)
    ↓
TypeScript catch block
    ↓
mapNativeErrorToVideoProcessingError()
    ↓
VideoProcessingError (domain error)
    ↓
Service/Feature error handling
```

### Layer Responsibilities

#### TypeScript Adapter Layer

**Files**:

- `src/domain/adapters/VideoProcessingAdapter.ts` - Interface definition
- `src/domain/adapters/native/NativeVideoProcessingAdapter.ts` - Native bridge
- `src/domain/adapters/native/VideoProcessingError.ts` - Error types
- `src/domain/adapters/mock/MockVideoProcessingAdapter.ts` - Testing mock

**Responsibilities**:

1. Define clean, type-safe interface for video operations
2. Bridge TypeScript to native code via `NativeModules`
3. Transform platform errors into domain errors
4. Provide mock implementation for unit testing

**Example Usage**:

```typescript
import { NativeVideoProcessingAdapter } from '@adapters/native/NativeVideoProcessingAdapter';

const adapter = new NativeVideoProcessingAdapter();

try {
  const result = await adapter.extractFrames({
    videoPath: '/path/to/video.mp4',
    outputDirectory: '/path/to/output',
    frameRate: 1, // 1 frame per second
    quality: 2, // High quality (1-31, lower is better)
  });

  console.log(`Extracted ${result.frameCount} frames in ${result.processingTimeMs}ms`);
  console.log('Output files:', result.outputPaths);
} catch (error) {
  if (error instanceof VideoProcessingError) {
    console.error(`Error [${error.code}]: ${error.message}`);
  }
}
```

#### Native Swift Layer (iOS)

**Files**:

- `ios/VideoSpliter/FFmpeg/VideoProcessingModule.swift` - RN bridge
- `ios/VideoSpliter/FFmpeg/VideoProcessingModule.m` - Objective-C bridge
- `ios/VideoSpliter/FFmpeg/FFmpegVideoProcessor.swift` - FFmpeg logic
- `ios/VideoSpliter/FFmpeg/VideoProcessorError.swift` - Error types
- `ios/VideoSpliter/FFmpeg/VideoProcessorTypes.swift` - Type definitions

**Responsibilities**:

1. Expose Swift methods to React Native via `@objc`
2. Execute FFmpeg commands using ffmpeg-kit library
3. Handle native errors and map to error codes
4. Run operations on background threads
5. Support cancellation of long-running operations

**FFmpeg Command Examples**:

```swift
// Extract all frames at high quality
ffmpeg -i input.mp4 -q:v 2 output/frame_%04d.jpg

// Extract 1 frame per second
ffmpeg -i input.mp4 -vf fps=1 -q:v 2 output/frame_%04d.jpg

// Get video metadata
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4
```

### Error Handling

#### Error Code Mapping

| Swift Error                     | Error Code             | TypeScript Error     |
| ------------------------------- | ---------------------- | -------------------- |
| `invalidVideoPath`              | `INVALID_VIDEO_PATH`   | VideoProcessingError |
| `ffmpegExecutionFailed`         | `FFMPEG_FAILED`        | VideoProcessingError |
| `videoNotFound`                 | `VIDEO_NOT_FOUND`      | VideoProcessingError |
| `cancelled`                     | `CANCELLED`            | VideoProcessingError |
| `insufficientStorage`           | `INSUFFICIENT_STORAGE` | VideoProcessingError |
| `invalidFrameRate`              | `INVALID_FRAME_RATE`   | VideoProcessingError |
| `outputDirectoryCreationFailed` | `OUTPUT_DIR_FAILED`    | VideoProcessingError |

#### Error Handling Best Practices

1. **Always use try-catch** when calling adapter methods
2. **Check error codes** for specific error handling
3. **Provide user-friendly messages** in the UI layer
4. **Log errors** for debugging (native and TypeScript)
5. **Clean up resources** on error (temporary files, etc.)

```typescript
try {
  const result = await adapter.extractFrames(config);
  return result;
} catch (error) {
  if (error instanceof VideoProcessingError) {
    switch (error.code) {
      case VideoProcessingErrorCode.VIDEO_NOT_FOUND:
        showUserMessage('Video file not found');
        break;
      case VideoProcessingErrorCode.INSUFFICIENT_STORAGE:
        showUserMessage('Not enough storage space');
        break;
      case VideoProcessingErrorCode.CANCELLED:
        // User cancelled - no message needed
        break;
      default:
        showUserMessage('Failed to process video');
        logError(error);
    }
  }
  throw error; // Re-throw for caller to handle
}
```

### Testing Strategy

#### Unit Tests (TypeScript)

Test the **mock adapter** to verify interface contract:

```typescript
// src/domain/adapters/__tests__/VideoProcessingAdapter.test.ts
describe('VideoProcessingAdapter', () => {
  let adapter: MockVideoProcessingAdapter;

  it('should extract frames successfully', async () => {
    const result = await adapter.extractFrames({
      videoPath: '/test/video.mp4',
      outputDirectory: '/test/output',
    });
    expect(result.frameCount).toBeGreaterThan(0);
  });

  it('should handle cancellation', async () => {
    const promise = adapter.extractFrames({...});
    await adapter.cancelOperation();
    await expect(promise).rejects.toThrow();
  });
});
```

#### Integration Tests (Swift)

Test **real FFmpeg** with sample videos:

```swift
// ios/VideoSpliterTests/FFmpegVideoProcessorTests.swift
class FFmpegVideoProcessorTests: XCTestCase {
  func testExtractFrames() async throws {
    let processor = FFmpegVideoProcessor()
    let result = try await processor.extractFrames(
      videoPath: testVideoPath,
      outputDirectory: tempDirectory,
      frameRate: 1,
      quality: 2
    )
    XCTAssertGreaterThan(result.frameCount, 0)
  }
}
```

#### Manual Testing Checklist

- [ ] Test with various video formats (MP4, MOV, AVI)
- [ ] Test with different resolutions (720p, 1080p, 4K)
- [ ] Test with very short videos (<1 second)
- [ ] Test with long videos (>10 minutes)
- [ ] Test cancellation mid-operation
- [ ] Test with invalid file paths
- [ ] Test with insufficient storage
- [ ] Monitor memory usage during extraction
- [ ] Verify frame quality and accuracy

### Performance Considerations

1. **Memory Usage**:

   - Typical videos: ~50-100MB during extraction
   - 4K videos: Can use 200-500MB
   - All operations run on background threads
   - Swift ARC handles memory automatically

2. **Processing Time**:

   - ~1-5 seconds for 10-second 1080p video (1 fps)
   - Scales linearly with frame rate and video duration
   - Quality setting has minimal impact on speed

3. **Storage**:

   - Each frame: ~100KB-500KB (depends on quality and resolution)
   - 60-second video at 1fps: ~6-30MB output
   - Always check available storage before extraction

4. **Optimization Tips**:
   - Use lower quality setting (higher number) for previews
   - Extract fewer frames (lower frame rate) when possible
   - Clean up temporary files after use
   - Show progress indicators for long operations

### Platform-Specific Notes

#### iOS

- **Minimum Version**: iOS 15.1+
- **Permissions Required**:
  - `NSPhotoLibraryUsageDescription` - For importing videos
  - `NSCameraUsageDescription` - For recording videos
  - `UIFileSharingEnabled` - For accessing documents
- **Bundle Size Impact**: +30-40MB (min variant)
- **Build Settings**:
  - `ENABLE_BITCODE = NO` (FFmpeg doesn't support bitcode)
  - `SWIFT_VERSION = 5.0`
- **Xcode Setup**: Manual file addition to Xcode project required

#### Android (Future)

- Implementation pending in Issue #2
- Will use same TypeScript adapter interface
- Kotlin implementation with ffmpeg-kit-react-native

### Troubleshooting

#### Common Issues

1. **"VideoProcessingModule is not available"**

   - **Cause**: Native module not linked or Xcode files not added
   - **Fix**: Run `cd ios && pod install`, add files to Xcode project

2. **"FFmpeg execution failed"**

   - **Cause**: Invalid video file, corrupted data, or unsupported format
   - **Fix**: Validate video file, check format support, inspect logs

3. **"Insufficient storage"**

   - **Cause**: Not enough disk space for extracted frames
   - **Fix**: Check available space, clean up old files, reduce frame rate

4. **High memory usage**

   - **Cause**: Large video files or high frame rates
   - **Fix**: Process in smaller chunks, reduce quality setting

5. **Xcode build fails**
   - **Cause**: Bitcode enabled or Swift version mismatch
   - **Fix**: Disable bitcode, ensure Swift 5.0+

### Future Enhancements

- [ ] Progress callbacks during extraction (Issue: future)
- [ ] Video trimming/cutting functionality
- [ ] Custom FFmpeg filters (blur, crop, etc.)
- [ ] Batch processing multiple videos
- [ ] Resume interrupted operations
- [ ] Streaming video support
- [ ] Hardware acceleration (VideoToolbox on iOS)

---

## Conventions

1. **File Naming**:

   - Components: `PascalCase.tsx`
   - Utilities: `camelCase.ts`
   - Types: `PascalCase.types.ts`
   - Tests: `*.test.ts` or `*.spec.ts`

2. **Directory Naming**:

   - Use `kebab-case` for feature directories
   - Use `PascalCase` for component directories (if needed)

3. **Import Order**:

   ```typescript
   // 1. External dependencies
   import React from 'react';
   import { View } from 'react-native';

   // 2. Internal dependencies (path aliases)
   import { Button } from '@ui/Button';
   import { formatDuration } from '@lib/time';

   // 3. Relative imports
   import { useLocalState } from './useLocalState';
   ```

## Migration Path

As the app grows, we may need to:

1. **Extract packages**: Move shared code to `packages/shared`
2. **Add state management**: If Context becomes unwieldy
3. **Add API layer**: If backend is added later
4. **Modularize**: Split large features into sub-features

---

**Last Updated**: 2025-12-23
**Status**: Foundation - Ready for feature implementation
