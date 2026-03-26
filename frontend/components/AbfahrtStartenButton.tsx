import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";

const SLIDER_WIDTH = Dimensions.get("window").width * 0.9;
const BUTTON_SIZE = 60;
const H_PADDING = 5;
const SWIPE_RANGE = SLIDER_WIDTH - BUTTON_SIZE - 2 * H_PADDING;

export default function SwipeButton({
  onSwipeComplete,
}: {
  onSwipeComplete: () => void;
}) {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      // Begrenze den Slider-Bereich
      if (event.translationX >= 0 && event.translationX <= SWIPE_RANGE) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      // Wenn über 80% geschoben, dann einrasten, sonst zurückfedern
      if (translateX.value > SWIPE_RANGE * 0.8) {
        translateX.value = withSpring(SWIPE_RANGE);
        runOnJS(onSwipeComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    // Text wird blasser, je weiter man schiebt
    opacity: interpolate(translateX.value, [0, SWIPE_RANGE * 0.5], [1, 0]),
  }));

  return (
    <GestureHandlerRootView>
      <View style={[styles.sliderContainer, { width: SLIDER_WIDTH }]}>
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text style={styles.text}>I Abfahrt Starten</Text>
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.handle, animatedButtonStyle]}>
            <View style={styles.circle}>
              <MaterialIcons name="arrow-forward" size={32} color="#616161" />
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sliderContainer: {
    height: 70,
    backgroundColor: "rgba(64, 114, 128, 0.9)",
    borderRadius: 35,
    justifyContent: "center",
    paddingHorizontal: H_PADDING,
    position: "relative",
    overflow: "hidden",
  },
  handle: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 10,
  },
  circle: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 40, // Platz für den Button am Anfang
  },
  text: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "400",
  },
});
