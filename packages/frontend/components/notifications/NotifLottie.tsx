import { View, Platform } from "react-native";
import React, { useEffect, useRef } from "react";
import LottieWrapper from "../home/post/components/LottieWrapper";


export default function NotifLottie() {
  const animationRef = useRef<any>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') {
      animationRef.current?.play();
    }
  }, []);
  return (
    <View
      style={{
        width: "100%",
        height: "50%",

        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LottieWrapper
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        ref={animationRef}
        source={require("../../assets/lottie/notification.json")}
      />
    </View>
  );
}
