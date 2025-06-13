import { View, Text, Pressable } from "react-native";
import React from "react";
import { CameraIcon } from "../icons";
import useGetMode from "../../hooks/GetMode";

export default function PickImageButton({
  handleSetPhotoPost,
}: {
  handleSetPhotoPost: (mimeType: string, uri: string, size: number) => void;
}) {
  const dark = useGetMode();
  const borderColor = dark ? "white" : "black";
  const rippleColor = !dark ? "#ABABAB" : "#55555500";

  const handleWebImagePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
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
        width: 100,
        borderStyle: "dashed",
        backgroundColor: "#FFFFFF00",
        borderRadius: 10,
        overflow: "hidden",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={handleWebImagePick}
        style={{
          width: 100,
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
          <Text style={{ fontFamily: "jakaraBold", color: borderColor }}>Upload</Text>
        </View>
      </Pressable>
    </View>
  );
}