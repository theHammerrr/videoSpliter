import { Platform } from 'react-native';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  type Permission,
} from 'react-native-permissions';
import { PermissionAdapter, PermissionStatus, PermissionType } from '../PermissionAdapter';

/**
 * Native Permission Adapter
 *
 * Implements permission handling using react-native-permissions library.
 * Handles platform-specific permission mappings and result conversions.
 *
 * @example
 * const adapter = new NativePermissionAdapter();
 * const status = await adapter.check(PermissionType.PHOTO_LIBRARY);
 */
export class NativePermissionAdapter implements PermissionAdapter {
  /**
   * Map PermissionType to platform-specific native permission
   *
   * @private
   */
  private getPermission(type: PermissionType): Permission {
    if (Platform.OS === 'ios') {
      switch (type) {
        case PermissionType.PHOTO_LIBRARY:
          return PERMISSIONS.IOS.PHOTO_LIBRARY;
        case PermissionType.CAMERA:
          return PERMISSIONS.IOS.CAMERA;
        default:
          throw new Error(`Unknown permission type: ${type}`);
      }
    } else if (Platform.OS === 'android') {
      switch (type) {
        case PermissionType.PHOTO_LIBRARY:
          // On Android 13+, use READ_MEDIA_VIDEO for video access
          // On older versions, fallback to READ_EXTERNAL_STORAGE
          if (Platform.Version >= 33) {
            return PERMISSIONS.ANDROID.READ_MEDIA_VIDEO;
          } else {
            return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
          }
        case PermissionType.CAMERA:
          return PERMISSIONS.ANDROID.CAMERA;
        default:
          throw new Error(`Unknown permission type: ${type}`);
      }
    } else {
      throw new Error(`Unsupported platform: ${Platform.OS}`);
    }
  }

  /**
   * Map react-native-permissions RESULTS to PermissionStatus
   *
   * @private
   */
  private mapResult(result: string): PermissionStatus {
    switch (result) {
      case RESULTS.GRANTED:
        return PermissionStatus.GRANTED;
      case RESULTS.DENIED:
        return PermissionStatus.DENIED;
      case RESULTS.BLOCKED:
        return PermissionStatus.BLOCKED;
      case RESULTS.UNAVAILABLE:
      case RESULTS.LIMITED:
        // LIMITED (iOS 14+) is treated as GRANTED for our use case
        // since we can still access selected photos/videos
        return result === RESULTS.LIMITED ? PermissionStatus.GRANTED : PermissionStatus.UNAVAILABLE;
      default:
        return PermissionStatus.UNAVAILABLE;
    }
  }

  /**
   * Check the current status of a permission
   *
   * @param permission - The permission type to check
   * @returns Current permission status
   */
  async check(permission: PermissionType): Promise<PermissionStatus> {
    try {
      const nativePermission = this.getPermission(permission);
      const result = await check(nativePermission);
      return this.mapResult(result);
    } catch (error) {
      console.error('Error checking permission:', error);
      return PermissionStatus.UNAVAILABLE;
    }
  }

  /**
   * Request a permission from the user
   *
   * @param permission - The permission type to request
   * @returns Permission status after request
   */
  async request(permission: PermissionType): Promise<PermissionStatus> {
    try {
      const nativePermission = this.getPermission(permission);
      const result = await request(nativePermission);
      return this.mapResult(result);
    } catch (error) {
      console.error('Error requesting permission:', error);
      return PermissionStatus.UNAVAILABLE;
    }
  }

  /**
   * Open device settings
   *
   * Navigates to the app settings screen where users can manually
   * enable permissions.
   */
  async openSettings(): Promise<void> {
    try {
      await openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }
}
