import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import StyledText from './StyledText';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <Ionicons
        name="alert-circle-outline"
        size={24}
        color={theme.colors.error}
        style={styles.icon}
      />
      <StyledText style={[styles.text, { color: theme.colors.text }]}>
        {message}
      </StyledText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
});

export default ErrorMessage;
