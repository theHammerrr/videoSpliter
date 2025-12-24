# iOS Setup Checklist - Issue #3

This checklist helps you complete the manual setup steps required to enable FFmpeg on iOS.

**⚠️ IMPORTANT**: These steps **require macOS**. iOS development cannot be done on Windows.

## Prerequisites

- [ ] macOS computer with Xcode installed
- [ ] Xcode 14+ installed
- [ ] CocoaPods installed (`sudo gem install cocoapods`)
- [ ] React Native development environment set up

## Setup Steps

### Step 1: Install CocoaPods Dependencies

This downloads the FFmpeg library (~30-40MB) and links it to your project.

```bash
cd apps/mobile/ios
pod install --repo-update
cd ..
```

**Expected output:**

```
Analyzing dependencies
Downloading dependencies
Installing ffmpeg-kit-react-native (6.0.3)
...
Pod installation complete!
```

**Verification:**

- [ ] `ios/Pods/` directory exists
- [ ] `ios/VideoSpliter.xcworkspace` file exists (use this, not .xcodeproj)
- [ ] No error messages during pod install

**Troubleshooting:**

- If you get "command not found: pod", install CocoaPods: `sudo gem install cocoapods`
- If you get Ruby version errors, update Ruby or use rbenv
- If download fails, try: `pod install --repo-update --verbose`

---

### Step 2: Add Swift Files to Xcode Project

The Swift files were created but need to be manually added to the Xcode project.

1. **Open the workspace** (not the .xcodeproj):

   ```bash
   open ios/VideoSpliter.xcworkspace
   ```

   - [ ] Workspace opens in Xcode

2. **Locate the VideoSpliter group** in the left sidebar (Project Navigator):

   - [ ] Click on the folder icon to expand if needed
   - [ ] You should see folders like "AppDelegate.h", "Images.xcassets", etc.

3. **Add Swift files**:

   - [ ] Right-click on the `VideoSpliter` group (the folder icon, not the project)
   - [ ] Select **"Add Files to VideoSpliter..."**

4. **Select the FFmpeg folder**:

   - [ ] Navigate to: `ios/VideoSpliter/FFmpeg/`
   - [ ] Select these **4 Swift files** (hold Cmd to select multiple):
     - [ ] `VideoProcessorError.swift`
     - [ ] `FFmpegVideoProcessor.swift`
     - [ ] `VideoProcessingModule.swift`
     - [ ] `VideoProcessorTypes.swift`
   - [ ] **Important**: Do NOT select `VideoProcessingModule.m` (it's already included)

5. **Configure import options**:

   - [ ] **Uncheck** "Copy items if needed" (we want to reference, not copy)
   - [ ] Select **"Create groups"** (not "Create folder references")
   - [ ] Ensure **"VideoSpliter" target is checked** in "Add to targets"
   - [ ] Click **"Add"**

6. **Verify files were added**:
   - [ ] In Xcode, expand the `FFmpeg` folder in the left sidebar
   - [ ] You should see all 4 .swift files listed
   - [ ] Files should have a document icon (not grayed out)

**Troubleshooting:**

- If files appear grayed out, they weren't added to the target - select the file, check "Target Membership" in right panel
- If you get "Bridging header" prompt, click "Create" (Xcode will auto-configure Swift/ObjC bridging)

---

### Step 3: Verify Build Settings

Ensure Xcode project has the correct settings for FFmpeg.

1. **Select the project** in left sidebar (blue icon at top)

   - [ ] Click on the "VideoSpliter" project name

2. **Select the VideoSpliter target**:

   - [ ] In the main panel, click on "VideoSpliter" under TARGETS

3. **Go to Build Settings tab**:

   - [ ] Click "Build Settings" tab at the top
   - [ ] Set filter to "All" (not "Basic")
   - [ ] Use search box to find settings

4. **Verify these settings**:

   - [ ] **Enable Bitcode**: Search for "ENABLE_BITCODE"

     - Should be: **NO**
     - Why: FFmpeg doesn't support bitcode
     - If not NO: The Podfile post_install hook should have set this

   - [ ] **Swift Language Version**: Search for "SWIFT_VERSION"

     - Should be: **5.0** or higher
     - Why: Our Swift code uses Swift 5.0 features

   - [ ] **Clang Enable Modules**: Search for "CLANG_ENABLE_MODULES"
     - Should be: **YES**
     - Why: Required for Swift/ObjC interop

**Troubleshooting:**

- If ENABLE_BITCODE is YES, the Podfile hook didn't run - try `pod install` again
- If Swift version is missing, Xcode may not have recognized the Swift files

---

### Step 4: Clean and Build

Clean the build folder and compile the project.

```bash
cd ios
xcodebuild clean -workspace VideoSpliter.xcworkspace -scheme VideoSpliter
xcodebuild -workspace VideoSpliter.xcworkspace -scheme VideoSpliter -configuration Debug
```

**Or use Xcode GUI**:

- [ ] Product → Clean Build Folder (Cmd+Shift+K)
- [ ] Product → Build (Cmd+B)

**Expected result:**

- [ ] Build succeeds with no errors
- [ ] You may see warnings (acceptable if build succeeds)

**Common build errors and fixes:**

| Error                                         | Cause                     | Fix                                                                |
| --------------------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| `"Use of undeclared type 'FFmpegKit'"`        | CocoaPods not installed   | Run `pod install --repo-update`                                    |
| `"No such module 'ffmpegkit'"`                | Stale derived data        | Clean: `rm -rf ~/Library/Developer/Xcode/DerivedData` then rebuild |
| `"ld: bitcode bundle could not be generated"` | Bitcode enabled           | Set `ENABLE_BITCODE = NO` in Build Settings                        |
| `"Bridging header not found"`                 | Swift/ObjC bridge issue   | Delete bridging header, let Xcode recreate it                      |
| Files not found                               | Swift files not in target | Select file → check Target Membership in Inspector                 |

---

### Step 5: Run the App

Test the app on simulator or device.

**Simulator:**

```bash
cd apps/mobile
npm run ios
```

**Or from Xcode:**

- [ ] Select a simulator from the top toolbar (e.g., "iPhone 15")
- [ ] Click the Play button (▶️) or press Cmd+R
- [ ] Wait for app to launch

**Verification:**

- [ ] App launches without crashing
- [ ] No error: "VideoProcessingModule is not available"
- [ ] Metro bundler shows no red screen errors

**Test the native module** (optional):

```javascript
// In your app code or React DevTools console:
import { NativeModules } from 'react-native';
console.log(NativeModules.VideoProcessingModule); // Should NOT be undefined
```

---

## Success Criteria

You know the setup is complete when:

- [x] ✅ `pod install` completed without errors
- [x] ✅ All 4 Swift files appear in Xcode project under FFmpeg folder
- [x] ✅ Build settings show `ENABLE_BITCODE = NO`
- [x] ✅ Build succeeds with no errors
- [x] ✅ App launches on simulator/device
- [x] ✅ `NativeModules.VideoProcessingModule` is defined (not undefined)
- [x] ✅ No "module not found" errors in console

---

## Next Steps After Setup

Once iOS is working, you can:

1. **Test frame extraction**:

   ```typescript
   import { NativeVideoProcessingAdapter } from '@adapters';
   const adapter = new NativeVideoProcessingAdapter();
   // Test with a sample video
   ```

2. **Implement video import UI** (uses this adapter)

3. **Implement Android version** (Issue #2)

---

## If You Don't Have a Mac

If you're on Windows and can't access a Mac:

### Option 1: Remote Mac Access

- **MacStadium**: Rent a Mac in the cloud (~$50/month)
- **MacinCloud**: Pay-per-hour Mac access (~$1/hour)
- **AWS EC2 Mac**: Mac instances on AWS

### Option 2: CI/CD Build

- Push code to GitHub
- Use **GitHub Actions** with `macos-latest` runner (free for public repos)
- Automated builds without local Mac

Example GitHub Actions workflow:

```yaml
name: iOS Build
on: push
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install CocoaPods
        run: cd apps/mobile/ios && pod install
      - name: Build iOS
        run: cd apps/mobile && npx react-native run-ios --configuration Release
```

### Option 3: Team Member with Mac

- Have a teammate with a Mac complete these steps
- Commit the changes they make (Podfile.lock, .xcworkspace)
- Continue development on Windows using MockVideoProcessingAdapter

### Option 4: Focus on Android First

- Wait for Issue #2 (Android FFmpeg integration)
- Android development works perfectly on Windows
- Same TypeScript code will work on both platforms

---

## Troubleshooting Resources

- [Native Module README](./src/native/README.md#troubleshooting) - FFmpeg-specific issues
- [Architecture Docs](./docs/architecture.md#native-modules---ffmpeg-integration) - Technical details
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup?platform=ios) - Official guide
- [CocoaPods Troubleshooting](https://guides.cocoapods.org/using/troubleshooting.html)

---

**Last Updated**: 2025-12-24
**Status**: Manual steps required before iOS app will function
