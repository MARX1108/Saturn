import React from 'react';
import { View } from 'react-native';

interface LottieWrapperProps {
  children?: React.ReactNode;
  [key: string]: any;
}

let LottieView: any = null;

try {
  LottieView = require('lottie-react-native');
} catch (error) {
  console.warn('lottie-react-native not available, using fallback View');
}

export default function LottieWrapper({ children, ...props }: LottieWrapperProps) {
  if (LottieView) {
    return <LottieView {...props}>{children}</LottieView>;
  }
  return <View {...props}>{children}</View>;
}