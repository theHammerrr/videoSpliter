import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  /**
   * Callback when "Select Video from Gallery" button is pressed
   */
  onSelectVideo: () => void;

  /**
   * Optional callback when "Record Video" button is pressed
   * If not provided, the button will not be shown
   */
  onRecordVideo?: () => void;
}

/**
 * Empty State Component
 *
 * Displays when no video has been selected yet.
 * Shows an icon, message, and action buttons.
 *
 * @example
 * <EmptyState
 *   onSelectVideo={handleSelectVideo}
 *   onRecordVideo={handleRecordVideo}
 * />
 */
const EmptyState = ({ onSelectVideo, onRecordVideo }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon placeholder - using simple circle for now */}
        <View style={styles.iconContainer}>
          <View style={styles.icon} />
        </View>

        {/* Message */}
        <Text style={styles.title}>No Video Selected</Text>
        <Text style={styles.subtitle}>
          Select a video from your gallery or record a new one to get started
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={onSelectVideo}>
            <Text style={styles.primaryButtonText}>Select Video from Gallery</Text>
          </TouchableOpacity>

          {onRecordVideo && (
            <TouchableOpacity style={styles.secondaryButton} onPress={onRecordVideo}>
              <Text style={styles.secondaryButtonText}>Record Video</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
    borderColor: '#cccccc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
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

export default EmptyState;
