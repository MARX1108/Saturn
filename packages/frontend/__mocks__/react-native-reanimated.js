const Reanimated = {
  default: {
    createAnimatedComponent: (component) => component,
    View: require('react-native').View,
    Text: require('react-native').Text,
    Image: require('react-native').Image,
    ScrollView: require('react-native').ScrollView,
    Extrapolate: {
      CLAMP: 'clamp',
    },
    interpolate: () => 0,
    event: () => {},
    Value: function Value() {
      return {
        setValue: () => {},
        interpolate: () => 0,
      };
    },
    Node: function Node() {},
    Clock: function Clock() {},
  },
  Easing: {
    linear: () => {},
    ease: () => {},
    quad: () => {},
    cubic: () => {},
    poly: () => {},
    sin: () => {},
    circle: () => {},
    exp: () => {},
    elastic: () => {},
    back: () => {},
    bounce: () => {},
    bezier: () => {},
    in: () => {},
    out: () => {},
    inOut: () => {},
  },
  FadeInLeft: {
    delay: () => ({ duration: () => {} }),
  },
  FadeIn: {},
  FadeOut: {
    duration: () => {},
  },
  FadeInDown: {},
  FadeInUp: {},
  BounceOutDown: {
    duration: () => {},
  },
  useSharedValue: (initialValue) => ({ value: initialValue }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: (value) => value,
  withSpring: (value) => value,
  withDelay: (delay, animation) => animation,
  withRepeat: (animation) => animation,
  cancelAnimation: () => {},
  useAnimatedReaction: () => {},
  runOnJS: (fn) => fn,
  interpolate: () => 0,
  interpolateColor: () => '#000000',
};

module.exports = Reanimated;