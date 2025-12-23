# Known Issues

## Jest Tests Failing on Windows with pnpm

**Status**: Known Issue (React Native 0.83.1)
**Platforms Affected**: Windows with pnpm
**Severity**: Low (does not affect development or builds)

### Symptom

When running `pnpm test`, you may encounter:

```
SyntaxError: Cannot use import statement outside a module
```

### Root Cause

React Native 0.83.1's Jest preset includes a setup file (`node_modules/react-native/jest/setup.js`) that uses ES6 import syntax. This file is not properly transformed on Windows when using pnpm, causing Jest to fail.

### Impact

- Tests cannot be run locally on Windows with pnpm
- This does not affect:
  - Application builds (Android/iOS)
  - Development workflow
  - Linting, formatting, or other quality checks
  - CI/CD pipelines on Linux/macOS

### Workarounds

1. **Run tests in WSL** (Windows Subsystem for Linux):

   ```bash
   wsl
   cd /mnt/f/GitRepos/videoSpliter/apps/mobile
   pnpm test
   ```

2. **Use a different package manager** (npm or yarn):

   ```bash
   npm install
   npm test
   ```

3. **Wait for React Native 0.84** which should fix this issue

4. **Run tests in CI/CD** - Tests will run fine on Linux/macOS environments

### Tracking

- Related React Native issue: (TBD)
- This will be resolved when:
  - React Native fixes the Jest preset
  - We upgrade to a newer React Native version

### Verification

Tests are confirmed to work on:

- macOS with pnpm ✅
- Linux with pnpm ✅
- Windows WSL with pnpm ✅
- CI/CD environments ✅

---

**Last Updated**: 2025-12-23
**Affects Versions**: React Native 0.83.x
