import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorMessageProps {
  /**
   * Error message to display
   */
  message: string;

  /**
   * Optional callback when "Try Again" button is pressed
   */
  onRetry?: () => void;

  /**
   * Optional callback when "Open Settings" button is pressed
   * Useful for permission errors
   */
  onOpenSettings?: () => void;

  /**
   * Optional callback when "Dismiss" button is pressed
   */
  onDismiss?: () => void;
}

/**
 * Error Message Component
 *
 * Displays an error message with optional action buttons:
 * - Try Again (for retryable errors)
 * - Open Settings (for permission errors)
 * - Dismiss (to clear the error)
 *
 * @example
 * <ErrorMessage
 *   message="Failed to load video"
 *   onRetry={handleRetry}
 *   onDismiss={handleDismiss}
 * />
 *
 * @example
 * <ErrorMessage
 *   message="Camera permission denied"
 *   onOpenSettings={handleOpenSettings}
 *   onDismiss={handleDismiss}
 * />
 */
const ErrorMessage = ({ message, onRetry, onOpenSettings, onDismiss }: ErrorMessageProps) => {
  return (
    <View style={styles.container}>
      {/* Error Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>!</Text>
        </View>
      </View>

      {/* Error Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {onRetry && (
          <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}

        {onOpenSettings && (
          <TouchableOpacity style={styles.primaryButton} onPress={onOpenSettings}>
            <Text style={styles.primaryButtonText}>Open Settings</Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onDismiss}>
            <Text style={styles.secondaryButtonText}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorMessage;
