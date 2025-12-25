import { VideoImportService, VideoImportError, VideoImportErrorCode } from '../VideoImportService';
import { PermissionStatus, PermissionType } from '@domain/adapters/PermissionAdapter';
import type { PermissionAdapter } from '@domain/adapters/PermissionAdapter';
import type { FilePickerAdapter, VideoFile } from '@domain/adapters/FilePickerAdapter';

// Mock Permission Adapter
class MockPermissionAdapter implements PermissionAdapter {
  private permissions: Map<PermissionType, PermissionStatus> = new Map();
  private requestResults: Map<PermissionType, PermissionStatus> = new Map();

  setPermissionStatus(type: PermissionType, status: PermissionStatus): void {
    this.permissions.set(type, status);
  }

  setRequestResult(type: PermissionType, status: PermissionStatus): void {
    this.requestResults.set(type, status);
  }

  async check(permission: PermissionType): Promise<PermissionStatus> {
    return this.permissions.get(permission) || PermissionStatus.DENIED;
  }

  async request(permission: PermissionType): Promise<PermissionStatus> {
    const result = this.requestResults.get(permission) || PermissionStatus.DENIED;
    this.permissions.set(permission, result);
    return result;
  }

  async openSettings(): Promise<void> {
    // Mock implementation
  }
}

// Mock File Picker Adapter
class MockFilePickerAdapter implements FilePickerAdapter {
  private videoToReturn: VideoFile | null = null;
  private shouldThrow: boolean = false;
  private errorMessage: string = 'Picker error';

  setVideoToReturn(video: VideoFile | null): void {
    this.videoToReturn = video;
  }

  setShouldThrow(shouldThrow: boolean, message?: string): void {
    this.shouldThrow = shouldThrow;
    if (message) {
      this.errorMessage = message;
    }
  }

  async pickVideo(): Promise<VideoFile | null> {
    if (this.shouldThrow) {
      throw new Error(this.errorMessage);
    }
    return this.videoToReturn;
  }

  async pickVideoFromCamera(): Promise<VideoFile | null> {
    if (this.shouldThrow) {
      throw new Error(this.errorMessage);
    }
    return this.videoToReturn;
  }
}

describe('VideoImportService', () => {
  let permissionAdapter: MockPermissionAdapter;
  let filePickerAdapter: MockFilePickerAdapter;
  let service: VideoImportService;

  const validVideo: VideoFile = {
    uri: 'file:///path/to/video.mp4',
    fileName: 'test-video.mp4',
    fileSize: 10 * 1024 * 1024, // 10 MB
    type: 'video/mp4',
    duration: 60,
  };

  beforeEach(() => {
    permissionAdapter = new MockPermissionAdapter();
    filePickerAdapter = new MockFilePickerAdapter();
    service = new VideoImportService(permissionAdapter, filePickerAdapter);
  });

  describe('importVideoFromGallery', () => {
    it('should import video successfully when permission is already granted', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.PHOTO_LIBRARY, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(validVideo);

      const result = await service.importVideoFromGallery();

      expect(result).toEqual(validVideo);
    });

    it('should request permission and import video when permission is denied', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.PHOTO_LIBRARY, PermissionStatus.DENIED);
      permissionAdapter.setRequestResult(PermissionType.PHOTO_LIBRARY, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(validVideo);

      const result = await service.importVideoFromGallery();

      expect(result).toEqual(validVideo);
    });

    it('should throw PERMISSION_DENIED error when user denies permission', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.PHOTO_LIBRARY, PermissionStatus.DENIED);
      permissionAdapter.setRequestResult(PermissionType.PHOTO_LIBRARY, PermissionStatus.DENIED);

      await expect(service.importVideoFromGallery()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromGallery()).rejects.toMatchObject({
        code: VideoImportErrorCode.PERMISSION_DENIED,
      });
    });

    it('should throw PERMISSION_BLOCKED error when permission is blocked', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.PHOTO_LIBRARY, PermissionStatus.BLOCKED);

      await expect(service.importVideoFromGallery()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromGallery()).rejects.toMatchObject({
        code: VideoImportErrorCode.PERMISSION_BLOCKED,
      });
    });

    it('should throw PERMISSION_UNAVAILABLE error when permission is unavailable', async () => {
      permissionAdapter.setPermissionStatus(
        PermissionType.PHOTO_LIBRARY,
        PermissionStatus.UNAVAILABLE,
      );

      await expect(service.importVideoFromGallery()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromGallery()).rejects.toMatchObject({
        code: VideoImportErrorCode.PERMISSION_UNAVAILABLE,
      });
    });

    it('should throw USER_CANCELLED error when user cancels selection', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.PHOTO_LIBRARY, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(null); // User cancelled

      await expect(service.importVideoFromGallery()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromGallery()).rejects.toMatchObject({
        code: VideoImportErrorCode.USER_CANCELLED,
      });
    });

    it('should throw INVALID_VIDEO error for unsupported format', async () => {
      const invalidVideo: VideoFile = {
        ...validVideo,
        fileName: 'test.txt',
        type: 'text/plain',
      };

      permissionAdapter.setPermissionStatus(PermissionType.PHOTO_LIBRARY, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(invalidVideo);

      await expect(service.importVideoFromGallery()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromGallery()).rejects.toMatchObject({
        code: VideoImportErrorCode.INVALID_VIDEO,
      });
    });

    it('should throw INVALID_VIDEO error for missing URI', async () => {
      const invalidVideo: VideoFile = {
        ...validVideo,
        uri: '',
      };

      permissionAdapter.setPermissionStatus(PermissionType.PHOTO_LIBRARY, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(invalidVideo);

      await expect(service.importVideoFromGallery()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromGallery()).rejects.toMatchObject({
        code: VideoImportErrorCode.INVALID_VIDEO,
      });
    });

    it('should throw PICKER_ERROR when picker fails', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.PHOTO_LIBRARY, PermissionStatus.GRANTED);
      filePickerAdapter.setShouldThrow(true, 'Picker failed');

      await expect(service.importVideoFromGallery()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromGallery()).rejects.toMatchObject({
        code: VideoImportErrorCode.PICKER_ERROR,
      });
    });

    it('should allow large file with warning (not throw)', async () => {
      const largeVideo: VideoFile = {
        ...validVideo,
        fileSize: 600 * 1024 * 1024, // 600 MB - triggers warning
      };

      permissionAdapter.setPermissionStatus(PermissionType.PHOTO_LIBRARY, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(largeVideo);

      // Should not throw - warnings are allowed
      const result = await service.importVideoFromGallery();
      expect(result).toEqual(largeVideo);
    });
  });

  describe('importVideoFromCamera', () => {
    it('should record video successfully when permission is already granted', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.CAMERA, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(validVideo);

      const result = await service.importVideoFromCamera();

      expect(result).toEqual(validVideo);
    });

    it('should request permission and record video when permission is denied', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.CAMERA, PermissionStatus.DENIED);
      permissionAdapter.setRequestResult(PermissionType.CAMERA, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(validVideo);

      const result = await service.importVideoFromCamera();

      expect(result).toEqual(validVideo);
    });

    it('should throw PERMISSION_DENIED error when user denies camera permission', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.CAMERA, PermissionStatus.DENIED);
      permissionAdapter.setRequestResult(PermissionType.CAMERA, PermissionStatus.DENIED);

      await expect(service.importVideoFromCamera()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromCamera()).rejects.toMatchObject({
        code: VideoImportErrorCode.PERMISSION_DENIED,
      });
    });

    it('should throw PERMISSION_BLOCKED error when camera permission is blocked', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.CAMERA, PermissionStatus.BLOCKED);

      await expect(service.importVideoFromCamera()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromCamera()).rejects.toMatchObject({
        code: VideoImportErrorCode.PERMISSION_BLOCKED,
      });
    });

    it('should throw USER_CANCELLED error when user cancels recording', async () => {
      permissionAdapter.setPermissionStatus(PermissionType.CAMERA, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(null); // User cancelled

      await expect(service.importVideoFromCamera()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromCamera()).rejects.toMatchObject({
        code: VideoImportErrorCode.USER_CANCELLED,
      });
    });

    it('should validate recorded video', async () => {
      const invalidVideo: VideoFile = {
        ...validVideo,
        fileName: 'test.txt',
      };

      permissionAdapter.setPermissionStatus(PermissionType.CAMERA, PermissionStatus.GRANTED);
      filePickerAdapter.setVideoToReturn(invalidVideo);

      await expect(service.importVideoFromCamera()).rejects.toThrow(VideoImportError);
      await expect(service.importVideoFromCamera()).rejects.toMatchObject({
        code: VideoImportErrorCode.INVALID_VIDEO,
      });
    });
  });

  describe('validateVideo', () => {
    it('should not throw for valid video', () => {
      expect(() => service.validateVideo(validVideo)).not.toThrow();
    });

    it('should throw for invalid video', () => {
      const invalidVideo: VideoFile = {
        ...validVideo,
        fileName: 'test.txt',
      };

      expect(() => service.validateVideo(invalidVideo)).toThrow(VideoImportError);
      expect(() => service.validateVideo(invalidVideo)).toThrow(
        expect.objectContaining({
          code: VideoImportErrorCode.INVALID_VIDEO,
        }),
      );
    });

    it('should not throw for large file warning', () => {
      const largeVideo: VideoFile = {
        ...validVideo,
        fileSize: 600 * 1024 * 1024, // 600 MB
      };

      // Should not throw - warnings are allowed
      expect(() => service.validateVideo(largeVideo)).not.toThrow();
    });

    it('should throw for missing URI', () => {
      const invalidVideo: VideoFile = {
        ...validVideo,
        uri: '',
      };

      expect(() => service.validateVideo(invalidVideo)).toThrow(VideoImportError);
    });
  });

  describe('openSettings', () => {
    it('should delegate to permission adapter', async () => {
      const openSettingsSpy = jest.spyOn(permissionAdapter, 'openSettings');

      await service.openSettings();

      expect(openSettingsSpy).toHaveBeenCalled();

      openSettingsSpy.mockRestore();
    });
  });
});
