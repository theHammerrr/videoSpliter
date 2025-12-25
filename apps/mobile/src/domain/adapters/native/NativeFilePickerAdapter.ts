import { launchImageLibrary, launchCamera, type Asset } from 'react-native-image-picker';
import { FilePickerAdapter, VideoFile } from '../FilePickerAdapter';

/**
 * Native File Picker Adapter
 *
 * Implements video file picking using react-native-image-picker library.
 * Handles gallery selection and camera recording.
 *
 * @example
 * const adapter = new NativeFilePickerAdapter();
 * const video = await adapter.pickVideo();
 * if (video) {
 *   console.log(`Selected: ${video.fileName}`);
 * }
 */
export class NativeFilePickerAdapter implements FilePickerAdapter {
  /**
   * Map react-native-image-picker Asset to VideoFile
   *
   * @private
   */
  private mapAsset(asset: Asset): VideoFile | null {
    // Ensure we have required fields
    if (!asset.uri || !asset.fileName) {
      return null;
    }

    return {
      uri: asset.uri,
      fileName: asset.fileName,
      fileSize: asset.fileSize ?? 0,
      type: asset.type,
      duration: asset.duration,
    };
  }

  /**
   * Pick a video from device gallery
   *
   * @returns Selected video file, or null if cancelled
   */
  async pickVideo(): Promise<VideoFile | null> {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        videoQuality: 'high',
        selectionLimit: 1,
      });

      // User cancelled
      if (result.didCancel) {
        return null;
      }

      // Error occurred
      if (result.errorCode || result.errorMessage) {
        console.error('Video picker error:', result.errorMessage || result.errorCode);
        throw new Error(result.errorMessage || `Picker error: ${result.errorCode}`);
      }

      // No assets selected
      if (!result.assets || result.assets.length === 0) {
        return null;
      }

      // Map first asset to VideoFile
      return this.mapAsset(result.assets[0]);
    } catch (error) {
      console.error('Error picking video:', error);
      throw error;
    }
  }

  /**
   * Record a video using device camera
   *
   * @returns Recorded video file, or null if cancelled
   */
  async pickVideoFromCamera(): Promise<VideoFile | null> {
    try {
      const result = await launchCamera({
        mediaType: 'video',
        videoQuality: 'high',
      });

      // User cancelled
      if (result.didCancel) {
        return null;
      }

      // Error occurred
      if (result.errorCode || result.errorMessage) {
        console.error('Camera error:', result.errorMessage || result.errorCode);
        throw new Error(result.errorMessage || `Camera error: ${result.errorCode}`);
      }

      // No assets captured
      if (!result.assets || result.assets.length === 0) {
        return null;
      }

      // Map first asset to VideoFile
      return this.mapAsset(result.assets[0]);
    } catch (error) {
      console.error('Error recording video:', error);
      throw error;
    }
  }
}
