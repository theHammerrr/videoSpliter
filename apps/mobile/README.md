# VideoSpliter - Mobile Client

A React Native mobile application for video splitting and frame extraction.

## Overview

VideoSpliter is a mobile-first video processing application built with React Native and TypeScript. This is the foundation project - a clean, scalable architecture ready for feature implementation.

## Project Status

**Current Phase**: Native Integration (iOS) 🚧

The project foundation is complete with native FFmpeg integration for iOS. The following components are ready:

- ✅ Clean architecture with clear boundaries
- ✅ Comprehensive tooling and quality checks
- ✅ TypeScript strict mode
- ✅ Testing infrastructure
- ✅ FFmpeg integration for iOS (frame extraction, metadata)
- ⏳ FFmpeg integration for Android (pending)
- ⏳ Video processing features (UI implementation pending)

## Tech Stack

- **Platform**: React Native (Bare workflow)
- **Language**: TypeScript (Strict mode)
- **Targets**: Android + iOS
- **Architecture**: Client-only (no backend)
- **Video Processing**: FFmpeg (ffmpeg-kit-react-native, min variant)
- **Testing**: Jest
- **Linting**: ESLint + Prettier
- **Spellcheck**: CSpell

## Project Structure

```
apps/mobile/
├── src/
│   ├── app/              # App shell, navigation, providers
│   ├── features/         # Feature modules (import, split, export, settings)
│   ├── domain/           # Pure business logic
│   │   ├── services/     # Use-cases and orchestration
│   │   └── adapters/     # Side effects (filesystem, native bridges)
│   ├── ui/               # Reusable UI components
│   ├── lib/              # Utilities and helpers
│   ├── config/           # Constants, env, feature flags
│   └── native/           # Native module documentation
├── android/              # Android native code (Kotlin)
├── ios/                  # iOS native code (Swift)
├── __tests__/            # Test files
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9.0.0
- React Native development environment ([setup guide](https://reactnative.dev/docs/environment-setup))
- For iOS: Xcode, CocoaPods
- For Android: Android Studio, JDK

### Installation

```bash
# Install dependencies
cd apps/mobile
pnpm install

# iOS only: Install CocoaPods dependencies (includes FFmpeg)
cd ios && pod install --repo-update && cd ..
```

#### iOS-Specific Setup

After installing CocoaPods dependencies, you need to manually add Swift files to Xcode:

1. Open `ios/VideoSpliter.xcworkspace` in Xcode (NOT `.xcodeproj`)
2. Right-click on the `VideoSpliter` group in the project navigator
3. Select "Add Files to VideoSpliter..."
4. Navigate to `ios/VideoSpliter/FFmpeg/`
5. Select all `.swift` files (VideoProcessorError.swift, FFmpegVideoProcessor.swift, VideoProcessingModule.swift, VideoProcessorTypes.swift)
6. **Important**: Uncheck "Copy items if needed"
7. Ensure "Create groups" is selected
8. Click "Add"

The Objective-C bridge file (`VideoProcessingModule.m`) is already included and doesn't need to be added manually.

### Running the App

```bash
# Start Metro bundler
pnpm start

# Android setup notes:
# - Ensure you have Android SDK configured (ANDROID_HOME or android/local.properties).
# - FFmpegKit dependency may not be available from Maven Central anymore; if Gradle fails to resolve
#   `com.arthenica:ffmpeg-kit-*`, use an internal Maven mirror (Artifactory/Nexus) and set:
#   `FFMPEG_KIT_REPO_URL` (and optionally `FFMPEG_KIT_REPO_USER` / `FFMPEG_KIT_REPO_TOKEN`).

# Run on Android
pnpm android

# Run on iOS
pnpm ios
```

## Available Scripts

| Script              | Description                      |
| ------------------- | -------------------------------- |
| `pnpm start`        | Start Metro bundler              |
| `pnpm android`      | Run on Android device/emulator   |
| `pnpm ios`          | Run on iOS simulator             |
| `pnpm lint`         | Lint code with ESLint            |
| `pnpm lint:fix`     | Fix linting issues automatically |
| `pnpm format`       | Format code with Prettier        |
| `pnpm format:check` | Check code formatting            |
| `pnpm spellcheck`   | Run spell checker                |
| `pnpm test`         | Run tests                        |
| `pnpm test:watch`   | Run tests in watch mode          |

## Architecture

See [docs/architecture.md](./docs/architecture.md) for detailed architectural decisions and patterns.

### Key Principles

1. **Pure Domain Logic**: `domain/` contains only TypeScript - no React, no native dependencies
2. **Side Effect Isolation**: All IO and native access goes through `adapters/`
3. **Feature Ownership**: Features own their screens and logic
4. **No Direct Native Access**: UI components don't access native APIs directly

## Contributing

See [docs/contributing.md](./docs/contributing.md) for development guidelines and conventions.

## Quality Standards

- TypeScript strict mode enforced
- No `any` types without justification
- All code must pass ESLint, Prettier, and CSpell
- Pre-commit hooks ensure code quality
- Tests required for business logic

## Native Dependencies

### FFmpeg Integration

VideoSpliter uses **ffmpeg-kit-react-native** (min variant) for video processing:

- **Library**: `ffmpeg-kit-react-native`
- **Variant**: Min (~30-40MB additional app size)
- **iOS Status**: ✅ Implemented (Issue #3)
- **Android Status**: ⏳ Pending (Issue #2)

**Capabilities**:

- Extract frames from videos at specified intervals
- Retrieve video metadata (duration, resolution, codec, bitrate, etc.)
- Cancel long-running operations
- Support for common video formats (MP4, MOV, AVI, etc.)

**Bundle Size Impact**:

- iOS: +30-40MB (min variant vs +120MB for full FFmpeg)
- The min variant includes essential video processing codecs
- See [Podfile](./ios/Podfile) for FFmpeg configuration

**Documentation**:

- [Native Module Usage Guide](./src/native/README.md)
- [Architecture Documentation](./docs/architecture.md#native-modules---ffmpeg-integration)

### iOS Permissions

The app requires the following iOS permissions (configured in Info.plist):

- **Photo Library Access**: To import videos from user's photo library
- **Camera Access**: To record videos directly in the app
- **File Sharing**: To allow users to import videos via Files app

## Future Features

The following features will be implemented in future issues:

- ✅ Native FFmpeg integration for iOS
- ⏳ Native FFmpeg integration for Android (Issue #2)
- Video import and preview UI
- Frame extraction UI with timeline
- Export and sharing functionality
- Progress callbacks for long operations
- E2E testing with Detox or Maestro

## Troubleshooting

### iOS Build Issues

**"VideoProcessingModule is not available"**

- Ensure you ran `pod install --repo-update` in the ios/ directory
- Verify Swift files were added to Xcode project (see iOS-Specific Setup above)
- Clean and rebuild: `cd ios && xcodebuild clean`

**Bitcode compilation error**

- FFmpeg does not support bitcode
- Solution: Build settings have `ENABLE_BITCODE = NO` in Podfile post_install hook

**"Use of undeclared type 'FFmpegKit'"**

- Run `pod install` again
- Clean Xcode derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`

For more troubleshooting, see:

- [Known Issues](./KNOWN_ISSUES.md) - Platform-specific issues
- [Native Module Troubleshooting](./src/native/README.md#troubleshooting) - FFmpeg-specific issues

## License

TBD

## Documentation

- [Architecture Documentation](./docs/architecture.md)
- [Contributing Guidelines](./docs/contributing.md)
- [Native Module Usage Guide](./src/native/README.md)
