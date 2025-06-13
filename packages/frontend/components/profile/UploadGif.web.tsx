import { View, Text, Pressable } from "react-native";
import React from "react";
import { CameraIcon } from "../icons";
import useGetMode from "../../hooks/GetMode";
import { useAppDispatch } from "../../redux/hooks/hooks";
import { openToast } from "../../redux/slice/toast/toast";

export default function PickGifButton({
  handleSetPhotoPost,
}: {
  handleSetPhotoPost: (mimeType: string, uri: string, size: number) => void;
}) {
  const dark = useGetMode();
  const borderColor = dark ? "white" : "black";
  const backgroundColorView = !dark ? "white" : "black";
  const dispatch = useAppDispatch();
  const rippleColor = !dark ? "#ABABAB" : "#55555500";

  const handleWebGifPick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/gif';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Validate file size and type
        if (file.size > 1200000 || file.type !== "image/gif") {
          dispatch(openToast({
            text: "Gif of 1MB only!",
            type: "error"
          }));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          handleSetPhotoPost(file.type, result, file.size);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <View
      style={{
        borderColor,
        borderWidth: 1,
        borderStyle: "dashed",
        borderRadius: 10,
        overflow: "hidden",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={handleWebGifPick}
        style={{
          padding: 10,
          height: 50,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
          }}
        >
          <CameraIcon size={20} color={borderColor} />
          <Text style={{ fontFamily: "jakaraBold", color: borderColor }}>
            Animated{" "}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}