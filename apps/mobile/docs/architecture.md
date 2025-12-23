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
