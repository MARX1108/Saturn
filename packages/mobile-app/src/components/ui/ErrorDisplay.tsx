import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import StyledText from './StyledText';
import { COLOR_PALETTE } from '../../theme/colors';

interface ErrorDisplayProps {
  message: string;
  userFriendlyMessage?: string;
  onRetry?: () => void;
}

/**
 * A consistent error display component with optional retry functionality
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  userFriendlyMessage,
  onRetry,
}) => {
  // Always show a user-friendly message, falling back to a generic one
  const displayMessage =
    userFriendlyMessage || 'Something went wrong. Please try again later.';

  return (
    <View style={styles.container}>
      <StyledText style={styles.errorMessage}>{displayMessage}</StyledText>
      {message && __DEV__ && (
        <StyledText style={styles.technicalDetails}>
          Technical details: {message}
        </StyledText>
      )}

      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <StyledText style={styles.retryText}>Try Again</StyledText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLOR_PALETTE.errorLight,
    borderRadius: 8,
    marginVertical: 8,
  },
  errorMessage: {
    color: COLOR_PALETTE.error,
    fontSize: 16,
    fontWeight: '500',
  },
  technicalDetails: {
    color: COLOR_PALETTE.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: COLOR_PALETTE.primary,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 12,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ErrorDisplay;
