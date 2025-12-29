import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';

interface LoadingOverlayProps {
  /**
   * Whether the overlay is visible
   */
  visible: boolean;

  /**
   * Loading message to display
   * @default "Loading..."
   */
  message?: string;
}

/**
 * Loading Overlay Component
 *
 * Displays a full-screen semi-transparent overlay with a loading spinner
 * and message. Used to indicate background operations.
 *
 * @example
 * <LoadingOverlay
 *   visible={isLoading}
 *   message="Importing video..."
 * />
 */
const LoadingOverlay = ({ visible, message = 'Loading...' }: LoadingOverlayProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
});

export default LoadingOverlay;
