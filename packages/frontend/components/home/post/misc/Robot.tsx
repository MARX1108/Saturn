import { useEffect, useRef } from "react";
import { View, Platform } from "react-native";
import LottieWrapper from "../components/LottieWrapper";


export default function Robot() {
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      animationRef.current?.play();
    }
  
  }, []);
  return (
    <View
      style={{
        height: 80,
        width: 80,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LottieWrapper
        style={{ width: 200, height: 200 }}
        loop={true}
        ref={animationRef}
        source={require("../../../../assets/lottie/robot.json")}
      />
    </View>
  );
}
