/**
 * Permission Status
 *
 * Represents the various states a permission can be in.
 */
export enum PermissionStatus {
  /**
   * Permission has been granted by the user
   */
  GRANTED = 'granted',

  /**
   * Permission has been denied but can be requested again
   */
  DENIED = 'denied',

  /**
   * Permission has been permanently blocked (user selected "Don't ask again")
   * User must manually enable in device settings
   */
  BLOCKED = 'blocked',

  /**
   * Permission is not available on this platform/device
   */
  UNAVAILABLE = 'unavailable',
}

/**
 * Permission Type
 *
 * Represents the different types of permissions the app may need.
 */
export enum PermissionType {
  /**
   * Access to photo library/gallery (for selecting videos)
   */
  PHOTO_LIBRARY = 'photo_library',

  /**
   * Access to camera (for recording videos)
   */
  CAMERA = 'camera',
}

/**
 * Permission Adapter
 *
 * Abstraction over platform-specific permission handling.
 * Allows testing and decouples domain logic from native permission APIs.
 *
 * @example
 * const adapter = new NativePermissionAdapter();
 * const status = await adapter.check(PermissionType.PHOTO_LIBRARY);
 *
 * if (status === PermissionStatus.DENIED) {
 *   const newStatus = await adapter.request(PermissionType.PHOTO_LIBRARY);
 *   if (newStatus === PermissionStatus.GRANTED) {
 *     // Proceed with gallery access
 *   }
 * } else if (status === PermissionStatus.BLOCKED) {
 *   // Prompt user to open settings
 *   await adapter.openSettings();
 * }
 */
export interface PermissionAdapter {
  /**
   * Check the current status of a permission without requesting it
   *
   * @param permission - The permission type to check
   * @returns Current permission status
   *
   * @example
   * const status = await adapter.check(PermissionType.PHOTO_LIBRARY);
   * if (status === PermissionStatus.GRANTED) {
   *   // Can access photo library
   * }
   */
  check(permission: PermissionType): Promise<PermissionStatus>;

  /**
   * Request a permission from the user
   *
   * Shows the system permission dialog if the permission hasn't been
   * permanently blocked. If blocked, returns BLOCKED status.
   *
   * @param permission - The permission type to request
   * @returns Permission status after request
   *
   * @example
   * const status = await adapter.request(PermissionType.CAMERA);
   * if (status === PermissionStatus.GRANTED) {
   *   // User granted permission
   * } else if (status === PermissionStatus.BLOCKED) {
   *   // User blocked permission permanently
   * }
   */
  request(permission: PermissionType): Promise<PermissionStatus>;

  /**
   * Open device settings where user can manually enable permissions
   *
   * Useful when permission is blocked and user needs to enable it manually.
   *
   * @example
   * if (status === PermissionStatus.BLOCKED) {
   *   await adapter.openSettings();
   * }
   */
  openSettings(): Promise<void>;
}
