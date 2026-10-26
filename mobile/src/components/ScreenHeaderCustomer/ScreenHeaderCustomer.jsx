import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ArrowLeft from "../../../assets/icons/arrow-left.svg";
import { colors } from "../../styles/basic";
import Logo from "../Logo/logo";

export default function ScreenHeaderCustomer({
  title,
  fallbackHref = "/my-quiz",
  titleStyle,
  style,
}) {
  const { t } = useTranslation();

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  }

  return (
    <View style={[headerStyles.container, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("MOBILE.GO_BACK")}
        hitSlop={12}
        style={({ hovered, pressed }) => [
          headerStyles.action,
          { opacity: hovered || pressed ? 0.6 : 1 },
        ]}
        onPress={goBack}
      >
        <ArrowLeft width={32} height={32} />
      </Pressable>

      <Text accessibilityRole="header" style={[headerStyles.title, titleStyle]}>
        {title}
      </Text>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t("MOBILE.HOME_LABEL")}
        hitSlop={6}
        onPress={() => router.navigate("/website")}
        style={({ hovered, pressed }) => [
          headerStyles.action,
          { opacity: hovered || pressed ? 0.6 : 1 },
        ]}
      >
        <Logo size={40} />
      </Pressable>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.qwThird,
    paddingVertical: 8,
    marginBottom: 16,
  },
  action: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: colors.qwColorHeading,
  },
});
