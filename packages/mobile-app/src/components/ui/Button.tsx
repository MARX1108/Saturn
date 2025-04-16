import React from 'react';
import {
  Pressable,
  StyleSheet,
  PressableProps,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import StyledText from './StyledText';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  disabled,
  ...props
}) => {
  const theme = useTheme();

  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.colors.surfaceVariant;
      case 'outline':
      case 'text':
        return theme.colors.transparent;
      case 'primary':
      default:
        return disabled ? theme.colors.surfaceVariant : theme.colors.primary;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'outline':
        return theme.colors.primary;
      case 'text':
        return theme.colors.primary;
      case 'primary':
        return disabled ? theme.colors.textSecondary : theme.colors.white;
      case 'secondary':
      default:
        return theme.colors.text;
    }
  };

  // Get border style based on variant
  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: theme.colors.primary,
      };
    }
    return {};
  };

  // Get padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
        };
      case 'medium':
      default:
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
        };
    }
  };

  // Get font size based on button size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 'fontSizeSm' as const;
      case 'large':
        return 'fontSizeLg' as const;
      case 'medium':
      default:
        return 'fontSizeMd' as const;
    }
  };

  // Combine all styles
  const buttonStyle = {
    ...getPadding(),
    ...getBorderStyle(),
    backgroundColor: getBackgroundColor(),
    borderRadius: theme.borderRadius.pill,
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  return (
    <Pressable
      style={({ pressed }) => [buttonStyle, pressed && { opacity: 0.8 }, style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.activityIndicator}
        />
      ) : (
        <>
          {leftIcon && <span style={styles.leftIcon}>{leftIcon}</span>}
          <StyledText
            weight="semibold"
            color={getTextColor()}
            style={{ fontSize: theme.typography[getFontSize()] }}
          >
            {title}
          </StyledText>
          {rightIcon && <span style={styles.rightIcon}>{rightIcon}</span>}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  activityIndicator: {
    marginRight: 8,
  },
});

export default Button;
