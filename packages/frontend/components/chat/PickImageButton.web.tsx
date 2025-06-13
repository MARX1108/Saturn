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
  const backgroundColorView = "#FD5E02";
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
        width: 40,
        backgroundColor: backgroundColorView,
        borderRadius: 999,
        overflow: "hidden",
        height: 40,
        marginLeft: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={handleWebImagePick}
        style={{
          width: 30,
          height: 30,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CameraIcon color={"white"} size={25} />
      </Pressable>
    </View>
  );
}