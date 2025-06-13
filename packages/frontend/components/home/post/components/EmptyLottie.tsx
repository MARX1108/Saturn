import { useEffect, useRef } from "react";
import { Dimensions, Platform } from "react-native";
import LottieWrapper from "./LottieWrapper";

const { width } = Dimensions.get("window");

export default function EmptyLottie() {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      lottieRef.current?.play();
      return () => lottieRef.current?.pause();
    }
  }, []);

  return (
    <LottieWrapper
      style={{ width: width / 1.5, height: width / 1.5 }}
      ref={lottieRef}
      source={require("../../../../assets/lottie/emptyList.json")}
    />
  );
}