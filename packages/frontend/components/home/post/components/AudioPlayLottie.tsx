import { useEffect, useRef } from "react";
import { View, Platform } from "react-native";
import { useAppSelector } from "../../../../redux/hooks/hooks";
import { Image } from "expo-image";
import LottieWrapper from "./LottieWrapper";


export default function AudioPlayLottie({
  animationRef,
  src,
}: {
  animationRef: React.RefObject<any>;
  src: string;
}) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      animationRef.current?.pause();
    }
  }, []);

  return (
    <View
      style={{
        height: 200,
        width: 200,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          height: 200,
          width: 200,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 99,
          position: "absolute",
        }}
      >
        <Image
          style={{ borderRadius: 999, height: 80, width: 80 }}
          source={{ uri: src }}
        />
      </View>
      <LottieWrapper
        style={{ width: 200, height: 200, position: "absolute", zIndex: 0 }}
        ref={animationRef}
        source={require("../../../../assets/lottie/play.json")}
      />
    </View>
  );
}
