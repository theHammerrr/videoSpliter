import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { VideoFile } from '@domain/adapters/FilePickerAdapter';

interface VideoDetailsProps {
  /**
   * Video file to display details for
   */
  video: VideoFile;

  /**
   * Callback when "Change Video" button is pressed
   */
  onChangeVideo: () => void;

  /**
   * Optional callback when "Next" button is pressed
   * If not provided, the button will not be shown
   */
  onNext?: () => void;
}

/**
 * Video Details Component
 *
 * Displays information about a selected video file:
 * - Thumbnail (placeholder for now)
 * - File name
 * - File size
 * - Duration (if available)
 * - Action buttons (Change Video, Next)
 *
 * @example
 * <VideoDetails
 *   video={videoFile}
 *   onChangeVideo={handleChangeVideo}
 *   onNext={handleNext}
 * />
 */
const VideoDetails = ({ video, onChangeVideo, onNext }: VideoDetailsProps) => {
  /**
   * Format file size in human-readable format
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return 'Unknown size';
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }

    const mb = kb / 1024;
    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    }

    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  /**
   * Format duration in MM:SS format
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Video Thumbnail Placeholder */}
      <View style={styles.thumbnailContainer}>
        <View style={styles.thumbnail} />
        {video.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
          </View>
        )}
      </View>

      {/* Video Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>File Name</Text>
        <Text style={styles.value} numberOfLines={2}>
          {video.fileName}
        </Text>

        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <Text style={styles.label}>Size</Text>
            <Text style={styles.value}>{formatFileSize(video.fileSize)}</Text>
          </View>

          {video.duration && (
            <View style={styles.metadataItem}>
              <Text style={styles.label}>Duration</Text>
              <Text style={styles.value}>{formatDuration(video.duration)}</Text>
            </View>
          )}
        </View>

        {video.type && (
          <>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{video.type}</Text>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onChangeVideo}>
          <Text style={styles.secondaryButtonText}>Change Video</Text>
        </TouchableOpacity>

        {onNext && (
          <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#cccccc',
    borderRadius: 12,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 24,
  },
  metadataItem: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoDetails;
