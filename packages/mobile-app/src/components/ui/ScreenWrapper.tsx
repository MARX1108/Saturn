import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ViewProps,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeType } from '../../theme/theme';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
  padding?: keyof ThemeType['spacing'] | number;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  useSafeArea = true,
  padding = 'md',
  backgroundColor,
  statusBarStyle,
  style,
  ...props
}) => {
  const theme = useTheme();

  // Determine padding value (either from theme or direct number)
  const paddingValue =
    typeof padding === 'string' ? theme.spacing[padding] : padding;

  // Default background color from theme if not provided
  const bgColor = backgroundColor || theme.colors.background;

  // Determine status bar style based on background color or prop
  const barStyle =
    statusBarStyle ||
    (bgColor === theme.colors.white ? 'dark-content' : 'light-content');

  const viewStyles = {
    flex: 1,
    backgroundColor: bgColor,
    padding: paddingValue,
  };

  // Use SafeAreaView or regular View based on the prop
  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <>
      <StatusBar
        backgroundColor={bgColor}
        barStyle={barStyle}
        translucent={true}
      />
      <Container style={[viewStyles, style]} {...props}>
        {children}
      </Container>
    </>
  );
};

export default ScreenWrapper;
