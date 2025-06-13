import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieWrapperProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export default function LottieWrapper({ children, ...props }: LottieWrapperProps) {
  return <LottieView {...props}>{children}</LottieView>;
}