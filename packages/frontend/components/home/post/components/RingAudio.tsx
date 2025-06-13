import { useEffect, useRef } from "react";
import { View, Platform } from "react-native";
import LottieWrapper from "./LottieWrapper";
import { useAppSelector } from "../../../../redux/hooks/hooks";
import { Image } from "expo-image";


export default function RingAudio({
  animationRef,
}: {
  animationRef: React.RefObject<any>;
}) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      animationRef.current?.pause();
    }
  }, []);
  const userImage = useAppSelector((state) => state.user.data?.imageUri);
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
          source={{ uri: userImage }}
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
