# Android (VideoSpliter)

This folder contains the native Android project for the React Native app.

## Prerequisites

- Android Studio (recommended) + Android SDK
- JDK (use the version required by your React Native / AGP setup)
- An Android emulator or a physical device
- Node.js + `pnpm`

## One-time setup

### 1 Configure Android SDK path

Gradle needs to know where your Android SDK is located. Use either:

- `ANDROID_HOME` / `ANDROID_SDK_ROOT` environment variables, **or**
- `android/local.properties` with `sdk.dir=...` (recommended for local dev)

Example `android/local.properties`:

```properties
sdk.dir=C\:/Users/<you>/AppData/Local/Android/Sdk
```

### 2 FFmpegKit repository (required)

The project depends on `com.arthenica:ffmpeg-kit-min`. If Gradle fails with:

`Could not find com.arthenica:ffmpeg-kit-min:<version>`

then you must provide an alternative Maven repository that hosts/mirrors the FFmpegKit artifacts
(recommended: your organization’s Artifactory/Nexus).

Configure it via environment variables (preferred) or Gradle properties:

- `FFMPEG_KIT_REPO_URL` (required when Maven Central resolution fails)
- `FFMPEG_KIT_REPO_USER` (optional)
- `FFMPEG_KIT_REPO_TOKEN` (optional)

PowerShell example:

```powershell
$env:FFMPEG_KIT_REPO_URL="https://<your-artifactory-or-nexus>/maven/"
$env:FFMPEG_KIT_REPO_USER="<username>"        # optional
$env:FFMPEG_KIT_REPO_TOKEN="<token/password>" # optional
```

## Run the app (recommended workflow)

From `apps/mobile`:

```bash
pnpm install
pnpm start
pnpm android
```

If `pnpm android` cannot find `adb`/`emulator`, ensure the Android SDK tools are on `PATH`
(usually `<sdk>/platform-tools` and `<sdk>/emulator`).

## Build with Gradle

From `apps/mobile/android`:

```bash
# Debug APK
./gradlew :app:assembleDebug

# Install debug on a connected device/emulator
./gradlew :app:installDebug

# Release APK (unsigned unless you configure signing)
./gradlew :app:assembleRelease

# App Bundle (AAB) for Play Store
./gradlew :app:bundleRelease

# Clean build outputs
./gradlew clean
```

## Troubleshooting

- **SDK location not found**: set `ANDROID_HOME` or create `android/local.properties` with `sdk.dir=...`.
- **No emulators found**: create an AVD in Android Studio or connect a physical device.
- **FFmpegKit dependency not found**: set `FFMPEG_KIT_REPO_URL` (and credentials if needed) to your Maven mirror.
