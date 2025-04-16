import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface StyledTextProps extends TextProps {
  weight?: 'regular' | 'medium' | 'bold';
  color?: string;
}

const StyledText: React.FC<StyledTextProps> = ({
  weight = 'regular',
  color,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();

  const getFontWeight = (weight: string) => {
    switch (weight) {
      case 'bold':
        return theme.typography.fontWeightBold;
      case 'medium':
        return theme.typography.fontWeightMedium;
      default:
        return theme.typography.fontWeightRegular;
    }
  };

  return (
    <Text
      style={[
        {
          color: color || theme.colors.text,
          fontFamily: theme.typography.fontFamily,
          fontWeight: getFontWeight(weight),
          fontSize: theme.typography.fontSizeMd,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default StyledText;
