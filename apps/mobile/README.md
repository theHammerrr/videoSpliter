# VideoSpliter - Mobile Client

A React Native mobile application for video splitting and frame extraction.

## Overview

VideoSpliter is a mobile-first video processing application built with React Native and TypeScript. This is the foundation project - a clean, scalable architecture ready for feature implementation.

## Project Status

**Current Phase**: Foundation ✅

This is a foundational setup with no video processing features implemented yet. The project provides:

- Clean architecture with clear boundaries
- Comprehensive tooling and quality checks
- TypeScript strict mode
- Testing infrastructure
- Documentation

## Tech Stack

- **Platform**: React Native (Bare workflow)
- **Language**: TypeScript (Strict mode)
- **Targets**: Android + iOS
- **Architecture**: Client-only (no backend)
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

# iOS only: Install CocoaPods
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
pnpm start

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

## Future Features

The following features will be implemented in future issues:

- Native FFmpeg integration (Android & iOS)
- Video import and preview
- Frame extraction and timeline
- Export and sharing functionality
- E2E testing with Detox or Maestro

## License

TBD

## Documentation

- [Architecture Documentation](./docs/architecture.md)
- [Contributing Guidelines](./docs/contributing.md)
