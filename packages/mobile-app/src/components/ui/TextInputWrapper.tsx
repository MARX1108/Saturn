import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import StyledText from './StyledText';

interface TextInputWrapperProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputContainerStyle?: ViewStyle;
  errorStyle?: TextStyle;
}

const TextInputWrapper: React.FC<TextInputWrapperProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputContainerStyle,
  errorStyle,
  ...textInputProps
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <StyledText
          weight="medium"
          color={theme.colors.text}
          style={[styles.label, labelStyle]}
        >
          {label}
        </StyledText>
      )}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.surfaceVariant },
          inputContainerStyle,
          error ? styles.inputError : null,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSizeMd,
              fontFamily: theme.typography.fontFamily,
            },
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="none"
          {...textInputProps}
        />
      </View>
      {error && (
        <StyledText
          weight="regular"
          color={theme.colors.error}
          style={[styles.errorText, errorStyle]}
        >
          {error}
        </StyledText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ED4956',
  },
  input: {
    width: '100%',
  },
  errorText: {
    marginTop: 4,
  },
});

export default TextInputWrapper;
