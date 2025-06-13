import { View, Dimensions, Platform } from "react-native";
import React, { useEffect, useRef } from "react";
import useGetMode from "../../hooks/GetMode";
import LottieWrapper from "../home/post/components/LottieWrapper";
import Animated, {
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";
const { width } = Dimensions.get("window");


export default function TypingBox() {
  const dark = useGetMode();
  const backgroundColor = dark ? "#181B1D" : "#e8e8eb";
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      animationRef.current?.play();
    }

    return () => {
      if (Platform.OS !== 'web') {
        animationRef.current?.reset();
      }
    };
  }, []);
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutDown.springify()}
      style={{ width: "100%", alignItems: "flex-start" }}
    >
      <View>
        <View
          style={{
            padding: 10,
            borderRadius: 15,
            maxWidth: width / 1.5,
            borderBottomLeftRadius: 0,

            alignSelf: "flex-start",

            backgroundColor,
          }}
        >
          <View
            style={{
              height: 10,
              width: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LottieWrapper
              style={{ width: 40, height: 50, zIndex: 0 }}
              ref={animationRef}
              source={dark ? require("../../assets/lottie/isTyping-light.json") : require("../../assets/lottie/isTyping-black.json")}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
