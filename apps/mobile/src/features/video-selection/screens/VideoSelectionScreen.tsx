import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Screen,
  Header,
  EmptyState,
  VideoDetails,
  LoadingOverlay,
  ErrorMessage,
} from '../../../ui';
import { VideoImportService, VideoImportErrorCode } from '@domain/services';
import { NativePermissionAdapter, NativeFilePickerAdapter } from '@domain/adapters';
import type { VideoFile } from '@domain/adapters';

const VideoSelectionScreen = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [error, setError] = useState<{
    message: string;
    code?: VideoImportErrorCode;
  } | null>(null);

  // Create video import service with native adapters
  const videoImportService = useMemo(
    () => new VideoImportService(new NativePermissionAdapter(), new NativeFilePickerAdapter()),
    [],
  );

  /**
   * Handle video selection from gallery
   */
  const handleSelectVideo = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Selecting video...');
      setError(null);

      const video = await videoImportService.importVideoFromGallery();
      setSelectedVideo(video);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle video recording from camera
   */
  const handleRecordVideo = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Opening camera...');
      setError(null);

      const video = await videoImportService.importVideoFromCamera();
      setSelectedVideo(video);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle error during video import
   */
  const handleError = (err: unknown) => {
    // User cancelled - don't show error
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      err.code === VideoImportErrorCode.USER_CANCELLED
    ) {
      return;
    }

    // Extract error message and code
    let message = 'Failed to import video. Please try again.';
    let code: VideoImportErrorCode | undefined;

    if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
      message = err.message;
    }

    if (err && typeof err === 'object' && 'code' in err) {
      code = err.code as VideoImportErrorCode;
    }

    setError({ message, code });
  };

  /**
   * Handle opening device settings
   */
  const handleOpenSettings = async () => {
    try {
      await videoImportService.openSettings();
      setError(null);
    } catch (err) {
      console.error('Error opening settings:', err);
    }
  };

  /**
   * Handle dismissing error
   */
  const handleDismissError = () => {
    setError(null);
  };

  /**
   * Handle changing video (select a different one)
   */
  const handleChangeVideo = () => {
    setSelectedVideo(null);
    setError(null);
  };

  return (
    <Screen>
      <Header title="Select Video" />

      {/* Main Content */}
      <View style={styles.content}>
        {!selectedVideo ? (
          <EmptyState onSelectVideo={handleSelectVideo} onRecordVideo={handleRecordVideo} />
        ) : (
          <VideoDetails video={selectedVideo} onChangeVideo={handleChangeVideo} />
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <ErrorMessage
            message={error.message}
            onRetry={
              error.code === VideoImportErrorCode.PICKER_ERROR ||
              error.code === VideoImportErrorCode.INVALID_VIDEO
                ? handleSelectVideo
                : undefined
            }
            onOpenSettings={
              error.code === VideoImportErrorCode.PERMISSION_BLOCKED ||
              error.code === VideoImportErrorCode.PERMISSION_DENIED
                ? handleOpenSettings
                : undefined
            }
            onDismiss={handleDismissError}
          />
        </View>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} message={loadingMessage} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
});

export default VideoSelectionScreen;
