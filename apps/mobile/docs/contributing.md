# Contributing Guidelines

## Development Workflow

### Before You Start

1. **Read the documentation**:

   - [README.md](../README.md) - Project overview
   - [architecture.md](./architecture.md) - Architecture principles

2. **Set up your environment**:

   - Ensure all prerequisites are installed
   - Run `pnpm install` to install dependencies
   - Verify builds work on your target platform(s)

3. **Run quality checks**:
   ```bash
   pnpm lint
   pnpm format:check
   pnpm spellcheck
   pnpm test
   ```

### Development Process

1. **Create a branch** for your work:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our conventions (see below)

3. **Run quality checks** before committing:

   ```bash
   pnpm lint:fix
   pnpm format
   pnpm test
   ```

4. **Commit your changes** using Conventional Commits (see below)

5. **Push and create a pull request**

## Code Conventions

### File Naming

- **Components**: `PascalCase.tsx`

  - Example: `VideoPlayer.tsx`, `ImportButton.tsx`

- **Utilities**: `camelCase.ts`

  - Example: `formatTime.ts`, `validateVideo.ts`

- **Types**: `PascalCase.types.ts`

  - Example: `Video.types.ts`, `User.types.ts`

- **Tests**: `*.test.ts` or `*.spec.ts`

  - Example: `formatTime.test.ts`, `VideoPlayer.test.tsx`

- **Hooks**: `useCamelCase.ts`
  - Example: `useVideoPlayer.ts`, `useTheme.ts`

### Directory Structure

```
src/
├── app/                  # App entry, navigation, providers
├── features/             # Feature modules (one folder per feature)
│   ├── import/
│   │   ├── screens/      # Feature screens
│   │   ├── components/   # Feature-specific components
│   │   └── hooks/        # Feature-specific hooks
│   └── split/
├── domain/               # Business logic (PURE TypeScript)
│   ├── models/           # Data models
│   ├── services/         # Use-cases
│   └── adapters/         # Side effects (IO, native)
├── ui/                   # Reusable UI components
├── lib/                  # Utilities
└── config/               # Configuration
```

### TypeScript Guidelines

#### Strict Mode

- TypeScript strict mode is **enabled**
- No `any` types without explicit justification
- Use `unknown` instead of `any` when type is truly unknown

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
function processData(data: VideoMetadata) {
  return data.duration;
}

// ✅ Good (when type is unknown)
function processData(data: unknown) {
  if (isVideoMetadata(data)) {
    return data.duration;
  }
  throw new Error('Invalid data');
}
```

#### Type Definitions

- Define types in `*.types.ts` files for complex types
- Use interfaces for objects that can be extended
- Use types for unions, intersections, and simple shapes

```typescript
// Video.types.ts
export interface Video {
  id: string;
  uri: string;
  duration: number;
  metadata: VideoMetadata;
}

export type VideoFormat = 'mp4' | 'mov' | 'avi';

export type VideoWithFormat = Video & {
  format: VideoFormat;
};
```

#### Function Return Types

- Always specify return types for exported functions
- Optional for simple internal functions

```typescript
// ✅ Good
export function calculateDuration(start: number, end: number): number {
  return end - start;
}

// ✅ Also acceptable for simple internal functions
function add(a: number, b: number) {
  return a + b;
}
```

### React/React Native Conventions

#### Component Structure

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Props interface
interface VideoCardProps {
  title: string;
  duration: number;
  onPress: () => void;
}

// Component
export function VideoCard({ title, duration, onPress }: VideoCardProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text>{formatDuration(duration)}</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

#### Hooks

- Use hooks at the top of the component
- Custom hooks must start with `use`
- Extract complex logic into custom hooks

```typescript
export function useVideoPlayer(videoUri: string) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);

  const play = React.useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = React.useCallback(() => {
    setIsPlaying(false);
  }, []);

  return { isPlaying, currentTime, play, pause };
}
```

### Import Order

Organize imports in this order:

```typescript
// 1. External dependencies (React, React Native, third-party)
import React from 'react';
import { View, Text } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

// 2. Internal path aliases (sorted alphabetically)
import { Button } from '@ui/Button';
import { APP_CONFIG } from '@config/app';
import { formatDuration } from '@lib/time';

// 3. Relative imports
import { useLocalState } from './useLocalState';
import { VideoCard } from './components/VideoCard';

// 4. Types (if not inline)
import type { Video } from './types';
```

### Styling

- Use `StyleSheet.create()` for performance
- Keep styles close to component (at bottom of file)
- Use meaningful style names

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  // Avoid: style1, style2, container2
});
```

## Testing Guidelines

### What to Test

1. **Domain Logic** (Required):

   - All business logic must have tests
   - Aim for 100% coverage of domain code

2. **Utilities** (Required):

   - All utility functions must have tests

3. **Services** (Required):

   - Test use-cases with mocked adapters

4. **Components** (Optional but recommended):

   - Test complex component logic
   - Test user interactions

5. **Adapters** (Integration tests):
   - Test with real dependencies when possible
   - Mock only external services

### Test Structure

```typescript
describe('VideoService', () => {
  describe('importVideo', () => {
    it('should import video successfully', async () => {
      // Arrange
      const mockAdapter = createMockVideoAdapter();
      const service = new VideoService(mockAdapter);

      // Act
      const result = await service.importVideo('test.mp4');

      // Assert
      expect(result).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should throw error for invalid video', async () => {
      // Arrange
      const mockAdapter = createMockVideoAdapter({ throwError: true });
      const service = new VideoService(mockAdapter);

      // Act & Assert
      await expect(service.importVideo('invalid.mp4')).rejects.toThrow();
    });
  });
});
```

### Test Naming

- Use descriptive test names
- Follow pattern: `should [expected behavior] when [condition]`

```typescript
// ✅ Good
it('should return formatted duration when given valid milliseconds', () => {});
it('should throw error when video format is unsupported', () => {});

// ❌ Bad
it('works', () => {});
it('test video', () => {});
```

## Git Conventions

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring (no functional changes)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (deps, config, etc.)
- `perf`: Performance improvements

#### Examples

```
feat(import): add video import from camera roll

- Implement native file picker integration
- Add video metadata extraction
- Update import screen UI

Closes #123
```

```
fix(player): resolve playback pause issue on Android

The video player was not properly pausing on Android devices
due to incorrect lifecycle handling.
```

```
docs(architecture): update domain layer documentation

Add examples for adapter implementation patterns.
```

```
chore(deps): update React Native to 0.83.1
```

### Branch Naming

- `feature/short-description` - New features
- `fix/short-description` - Bug fixes
- `docs/short-description` - Documentation updates
- `refactor/short-description` - Code refactoring

Examples:

- `feature/video-import`
- `fix/android-playback-crash`
- `docs/update-contributing-guide`

## Code Review Guidelines

### For Authors

- Keep PRs focused and small
- Write clear PR descriptions
- Link related issues
- Ensure all tests pass
- Run linting and formatting before submitting

### For Reviewers

- Be constructive and respectful
- Focus on code quality, not style (style is automated)
- Check for:
  - Adherence to architecture principles
  - Test coverage
  - Performance implications
  - Security concerns

## Quality Checks

All code must pass these checks before merging:

```bash
# Linting
pnpm lint

# Formatting
pnpm format:check

# Spell checking
pnpm spellcheck

# Tests
pnpm test
```

### Pre-commit Hooks

Pre-commit hooks automatically run:

- ESLint (with auto-fix)
- Prettier (with auto-fix)
- CSpell

If the hooks fail, fix the issues and commit again.

### Continuous Integration

CI will run all quality checks on every PR. All checks must pass before merging.

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Look at existing code for examples
3. Ask in PR comments or discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
