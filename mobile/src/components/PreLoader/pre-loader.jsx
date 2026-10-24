import { useEffect, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import Logo from "../Logo/logo";

export default function PreLoader({ size = 40, style }) {
  const [rotation] = useState(() => new Animated.Value(0));
  const { t } = useTranslation();

  useEffect(() => {
    rotation.setValue(0);
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
    );
    animation.start();

    return () => animation.stop();
  }, [rotation]);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t("MOBILE.LOADING")}
      accessibilityState={{ busy: true }}
      style={[styles.container, style]}
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [
            {
              rotate: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        }}
      >
        <Logo size={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
});
