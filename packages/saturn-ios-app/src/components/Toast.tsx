/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top' | 'bottom';
}

interface ToastRef {
  show: (options: ToastOptions) => void;
  hide: () => void;
}

// Singleton pattern for global Toast
class ToastManager {
  static toastRef: ToastRef | null = null;

  static setToastRef(ref: ToastRef): void {
    this.toastRef = ref;
  }

  static show(options: ToastOptions): void {
    if (this.toastRef) {
      this.toastRef.show(options);
    }
  }

  static hide(): void {
    if (this.toastRef) {
      this.toastRef.hide();
    }
  }
}

// Export the static Toast interface
export const Toast = ToastManager;

// Internal Toast component
const ToastComponent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Register this component with the ToastManager
    ToastManager.setToastRef({
      show: ({ message, type = 'info', duration = 3000, position = 'top' }) => {
        setMessage(message);
        setType(type);
        setPosition(position);
        setVisible(true);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Auto hide after duration
        setTimeout(() => {
          hide();
        }, duration);
      },
      hide: () => {
        hide();
      },
    });

    return () => {
      // Clear reference when unmounted
      ToastManager.toastRef = null;
    };
  }, []);

  const hide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  const getToastStyle = (): ViewStyle => {
    let style: ViewStyle = { ...styles.toast };

    // Adjust position
    if (position === 'top') {
      style = { ...style, top: 50 };
    } else {
      style = { ...style, bottom: 50 };
    }

    // Adjust type color
    switch (type) {
      case 'success':
        style = { ...style, backgroundColor: '#4CAF50' };
        break;
      case 'error':
        style = { ...style, backgroundColor: '#F44336' };
        break;
      case 'warning':
        style = { ...style, backgroundColor: '#FF9800' };
        break;
      case 'info':
      default:
        style = { ...style, backgroundColor: '#2196F3' };
        break;
    }

    return style;
  };

  const getTextStyle = (): TextStyle => {
    return styles.text;
  };

  return (
    <Animated.View style={[getToastStyle(), { opacity: fadeAnim }]}>
      <Text style={getTextStyle()}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ToastComponent;
