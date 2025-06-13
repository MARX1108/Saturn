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
  const backgroundColor = dark ? "white" : "black";
  const backgroundColorView = !dark ? "white" : "black";

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
        borderColor: "#B4B4B488",
        borderWidth: 1,
        width: 100,
        backgroundColor: backgroundColorView,
        borderRadius: 10,
        overflow: "hidden",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={handleWebImagePick}
        style={{
          width: 100,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CameraIcon color={backgroundColor} size={40} />
      </Pressable>
    </View>
  );
}