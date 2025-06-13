import React from 'react';
import { View } from 'react-native';

interface LottieWrapperProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export default function LottieWrapper({ children, ...props }: LottieWrapperProps) {
  return <View {...props}>{children}</View>;
}