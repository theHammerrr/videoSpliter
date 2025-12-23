# Feature: Export Frames to Gallery

**\## Goal**

**Allow the user to manually export extracted image frames from the app to the system gallery.**

**This is an explicit, user-initiated action and not part of the extraction process.**

**\---**

**\## Scope**

**\### In Scope**

**\- Export images from app storage to gallery**

**\- User-triggered action only**

**\- Basic success / error handling**

**\### Out of Scope**

**\- Automatic export**

**\- Cloud sync**

**\- Image editing**

**\- Background exports**

**\---**

**\## Behavior**

**\- Frames are first stored in app-private storage**

**\- User chooses “Export to Gallery”**

**\- App copies images to the system gallery**

**\- Original files remain in app storage**

**\---**

**\## Platform Notes**

**\### Android**

**\- Use MediaStore**

**\- Export into a dedicated folder (e.g.** `VideoSpliter/Exports/`**)**

**\### iOS**

**\- Export images to Photos library**

**\- Request permission only when export is triggered**

**\---**

**\## Definition of Done**

**\- User can export frames to gallery on Android and iOS**

**\- Permissions handled correctly**

**\- Images appear in gallery**

**\- No automatic exports**
