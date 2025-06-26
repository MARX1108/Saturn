import {
  View,
  Text,
  Dimensions,
  Pressable,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import OnboardBuilder from "./components/OnboardBuilder";
import TrackerTag from "./components/TrackerTag";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { setRoute } from "../../redux/slice/routes";
import { murphyLaws } from "../../data/murphy";
import useGetMode from "../../hooks/GetMode";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;


export default function Onboard() {
  const [page, setPage] = useState(0);
  const dispatch = useAppDispatch();
  const dark = useGetMode();
  const isDark = dark;
  const color = isDark ? "black" : "white";
  const backgroundColor = isDark ? "white" : "black";
  
  const firstPage = (Math.random() * 2).toFixed();
  const secondPage = () => {
    if (Number(firstPage) === 2) {
      return Number(firstPage) - 1;
    } else {
      return Number(firstPage) + 1;
    }
  };
  
  console.log('[DIAGNOSTIC_ONBOARDING] State/Props Check:', {
    page,
    isDark,
    firstPage,
    secondPage: secondPage(),
  });

  return (
    <View
      style={{
        flex: 1,
        marginTop: height * 0.2,
        paddingHorizontal: 20,
        paddingVertical: height * 0.04,
        justifyContent: "space-between",
      }}
    >
      <ScrollView
        horizontal
        pagingEnabled
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          if (x <= width / 2) {
            setPage(0);
          } else {
            setPage(1);
          }
        }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        style={{ width }}
        decelerationRate={"fast"}
      >
        <OnboardBuilder
          header="Welcome to QuickPost"
          subText="Post to inspire"
          imageUri={require("../../assets/images/move.png")}
          quote={murphyLaws[Number(firstPage)]}
        />
        <OnboardBuilder
          header={"Explore the \nnew world"}
          subText="to your desire"
          imageUri={require("../../assets/images/phone.png")}
          quote={murphyLaws[Number(secondPage())]}
        />
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          height: 70,
          width: "100%",
          alignItems: "center",
          backgroundColor: "transparent",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", gap: 5 }}>
          <TrackerTag />
          {page === 1 ? (
            <TrackerTag />
          ) : (
            <TrackerTag key="3" color={!isDark ? "#0000002A" : "#676767CC"} />
          )}
        </View>
        <TouchableOpacity
          testID="continue-button"
          activeOpacity={0.8}
          onPress={() => {
            console.log('[DIAGNOSTIC_ONBOARDING] Entry: The handleNext function was triggered.');
            try {
              dispatch(setRoute({ route: "Auth" }));
            } catch (error) {
              console.error('[DIAGNOSTIC_ONBOARDING] FATAL: An error was caught inside the handleNext function.', error);
            }
          }}
          style={{
            height: 70,
            width: 70,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              borderRadius: 9999,
              height: 60,
              width: 60,
              backgroundColor,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <Ionicons name="chevron-forward" size={35} color={color} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
