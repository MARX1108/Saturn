import {
  View,
  Text,
  useColorScheme,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Vibration,
  Pressable,
} from "react-native";
import AnimatedScreen from "../../components/global/AnimatedScreen";

import InputText from "./components/InputText";
import InputPassword from "./components/InputPassword";
import Button from "../../components/global/Buttons/Button";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { setRoute } from "../../redux/slice/routes";
import useGetMode from "../../hooks/GetMode";
import {
  LegacyRef,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { openToast } from "../../redux/slice/toast/toast";
import { useLoginMutation } from "../../redux/api/auth";
import { clearUserData, signOut, loginSuccess } from "../../redux/slice/user";
import { useForm, Controller } from "react-hook-form";
import { LoginScreen } from "../../types/navigation";
import { servicesApi } from "../../redux/api/services";
import { userApi } from "../../redux/api/user";
import { Image } from "expo-image";
import  ReAnimated,{ useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";

const width = Dimensions.get("window").width;
export default function Login({ navigation }: LoginScreen) {
  const dark = useGetMode();
  const isDark = dark;
  const [login, loginResponse] = useLoginMutation();
  const color = isDark ? "white" : "black";
  const buttonColor = !isDark ? "white" : "black";
  const dispatch = useAppDispatch();
  const borderColor = isDark ? "white" : "black";
  const user = useAppSelector((state) => state?.user?.data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      userName: user?.userName ? user?.userName : "",
      password: "",
    },
  });
  //
  const animUser = useRef(new Animated.Value(0));
  const animPass = useRef(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView | null>(null);
  const shakeUserName = useCallback(() => {
    vibrateAnimation(animUser);
  }, []);
  const shakePassword = useCallback(() => {
    vibrateAnimation(animPass);
  }, []);

  const onSubmit = (data: { userName: string; password: string }) => {
    console.log('[DIAGNOSTIC_ANDROID_LOGIN] Entry: The handleLogin function was triggered.');
    console.log('[DIAGNOSTIC_ANDROID_LOGIN] Loading state:', loginResponse.isLoading);
    console.log('[DIAGNOSTIC_ANDROID_LOGIN] Data being submitted:', JSON.stringify({ userName: data.userName.trim(), password: '***' }));
    console.log('[DIAGNOSTIC_ANDROID_LOGIN] Timestamp:', Date.now());
    
    // Prevent multiple submissions
    if (loginResponse.isLoading || isSubmitting) {
      console.log('[DIAGNOSTIC_ANDROID_LOGIN] Already loading/submitting, skipping submission', { 
        isLoading: loginResponse.isLoading, 
        isSubmitting 
      });
      return;
    }
    
    // Add cooldown period to prevent rapid successive attempts
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const minCooldownMs = 2000; // 2 seconds minimum between attempts
    
    if (timeSinceLastSubmission < minCooldownMs) {
      console.log('[DIAGNOSTIC_ANDROID_LOGIN] Cooldown period active, skipping submission', {
        timeSinceLastSubmission,
        remainingCooldown: minCooldownMs - timeSinceLastSubmission
      });
      dispatch(openToast({ 
        text: "Please wait a moment before trying again.", 
        type: "Failed" 
      }));
      return;
    }
    
    setIsSubmitting(true);
    setLastSubmissionTime(now);
    
    try {
      // userApi.util.resetApiState();
      // servicesApi.util.resetApiState();
      console.log('[DIAGNOSTIC_ANDROID_LOGIN] Making API call to:', `${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`);
      login({ username: data.userName.trim(), password: data.password })
        .unwrap()
        .then((e) => {
          console.log('[DIAGNOSTIC_ANDROID_LOGIN] Success response received');
          console.log('[DIAGNOSTIC_ANDROID_LOGIN] Response data:', { hasToken: !!e.token, hasData: !!e.data, msg: e.msg });
          
          // Save login data to Redux
          dispatch(loginSuccess({ token: e.token, data: e.data }));
          
          // Navigate to main app
          dispatch(setRoute({ route: "App" }));
          
          Vibration.vibrate(5);
          dispatch(openToast({ text: "Successful Login", type: "Success" }));
        })
        .catch((e) => {
          console.error('[DIAGNOSTIC_ANDROID_LOGIN] API Error caught:', e);
          console.error('[DIAGNOSTIC_ANDROID_LOGIN] Error structure:', {
            hasData: !!e?.data,
            hasMsg: !!e?.data?.msg,
            status: e?.status,
            fullError: JSON.stringify(e)
          });
          Vibration.vibrate(5);
          
          // Handle rate limiting specifically
          if (e?.status === 429) {
            dispatch(openToast({ 
              text: "Too many login attempts. Please wait a moment and try again.", 
              type: "Failed" 
            }));
            return;
          }
          
          // Fix: Safely access the error message
          const errorMessage = e?.data?.msg || e?.data?.message || e?.data || e?.error || 'Login failed';
          dispatch(openToast({ text: errorMessage, type: "Failed" }));
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } catch (error) {
      console.error('[DIAGNOSTIC_ANDROID_LOGIN] FATAL: An error was caught inside the handleLogin function.', error);
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (errors.userName) {
      shakeUserName();
    }
    if (errors.password) {
      shakePassword();
    }
  }, [errors.userName, errors.password]);

  const vibrateAnimation = (name: React.MutableRefObject<Animated.Value>) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(name.current, {
          useNativeDriver: true,
          toValue: -2,
          duration: 50,
        }),

        Animated.timing(name.current, {
          useNativeDriver: true,
          toValue: 2,
          duration: 50,
        }),

        Animated.timing(name.current, {
          useNativeDriver: true,
          toValue: 0,
          duration: 50,
        }),
      ]),
      { iterations: 2 }
    ).start();
  };

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        console.log("shsh");
        scrollViewRef.current?.scrollTo({ x: 300, y: 0 });
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const keyboard = useAnimatedKeyboard({isStatusBarTranslucentAndroid:true});
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
    paddingTop:keyboard.height.value
  }));
  return (
    <AnimatedScreen>
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <ReAnimated.View style={[{ flex: 1, marginTop:40 },animatedStyles]}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              alignItems: "center",
              paddingHorizontal: 25,
              paddingBottom: 50,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <View>
                {!user ? (
                  <Image
                    source={require("../../assets/images/auth.png")}
                    contentFit="contain"
                    style={{ height: 200, width }}
                  />
                ) : (
                  <View style={{ paddingBottom: 10, marginTop: 40 }}>
                    <Image
                      style={{ height: 100, width: 100, borderRadius: 999 }}
                      source={{ uri: user?.imageUri }}
                    />
                  </View>
                )}
              </View>
              <Text style={{ color, fontFamily: "mulishBold", fontSize: 24 }}>
                Welcome Back{user?.name && `, ${user?.name?.split(" ")[0]}`}
              </Text>
              <Text style={{ color, fontFamily: "mulish", fontSize: 14 }}>
                sign in to access your account
              </Text>
              {user && (
                <Pressable
                  onPress={() => {
                    dispatch(clearUserData());
                    reset({
                      userName: "",
                      password: "",
                    });
                  }}
                >
                  <Text style={{ color }}>Not you ?</Text>
                </Pressable>
              )}
              <View style={{ gap: 30, marginTop: 70 }}>
                <Animated.View
                  style={{ transform: [{ translateX: animUser.current }] }}
                >
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <InputText
                        style={{
                          borderColor: errors.userName ? "red" : "",
                          borderWidth: errors.userName ? 1 : 0,
                        }}
                        props={{
                          value: value,
                          onBlur,
                          onChangeText: onChange,
                        }}
                      />
                    )}
                    name="userName"
                  />
                </Animated.View>
                <Animated.View
                  style={{ transform: [{ translateX: animPass.current }] }}
                >
                  <Controller
                    control={control}
                    rules={{
                      maxLength: 100,
                      minLength: 3,
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <InputPassword
                        style={{
                          borderColor: errors.password ? "red" : "",
                          borderWidth: errors.password ? 1 : 0,
                        }}
                        props={{
                          value,
                          onChangeText: onChange,
                          onBlur,
                        }}
                      />
                    )}
                    name="password"
                  />
                </Animated.View>
              </View>
            </View>
          </ScrollView>
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 40,
              paddingHorizontal: 25,
            }}
          >
            <Button
              loading={loginResponse.isLoading || isSubmitting}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit(onSubmit)();
              }}
            >
              <Text
                style={{
                  fontFamily: "jakaraBold",
                  fontSize: 15,
                  color: buttonColor,
                }}
              >
                Login
              </Text>
            </Button>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pressable
                style={{
                  width: "100%",
                  marginTop: 20,
                  height: "100%",
                  flexDirection: "row",
                  gap: 4,

                  borderStyle: "dashed",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={() => navigation.replace("Register")}
              >
                <Text style={{ color, includeFontPadding: false }}>
                  Don't have an account?
                </Text>

                <Text
                  style={{
                    color,
                    fontFamily: "jakaraBold",
                    includeFontPadding: false,
                  }}
                >
                  Register
                </Text>
              </Pressable>
            </View>
          </View>
        </ReAnimated.View>
      </TouchableWithoutFeedback>
    </AnimatedScreen>
  );
}
