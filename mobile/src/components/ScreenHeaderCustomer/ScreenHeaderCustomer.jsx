import { router, useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import ArrowLeft from "../../../assets/icons/arrow-left.svg";
import ProfileIcon from "../../../assets/icons/profile.svg";
import { useAuth } from "../../context/auth/useAuth";
import { colors } from "../../styles/basic";


export default function ScreenHeaderCustomer({
  title,
  fallbackHref = "/my-quiz",
  titleStyle,
  style,
  onProfilePress,
}) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigation = useNavigation("/my-quiz");


  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
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
        <ArrowLeft width={32} height={32} style={[headerStyles.icon]} />
      </Pressable>

      <Text accessibilityRole="header" style={[headerStyles.title, titleStyle]}>
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("MOBILE.PROFILE_LABEL", { defaultValue: "Profil" })}
        hitSlop={6}
        onPress={onProfilePress ?? (() => navigation.openDrawer())}
        style={({ hovered, pressed }) => [
          headerStyles.action,
          { opacity: hovered || pressed ? 0.6 : 1 },
        ]}
      >
        {profile?.image ? (
          <Image
            source={{ uri: profile.image }}
            style={headerStyles.avatar}
            resizeMode="cover"
          />
        ) : (
          <ProfileIcon width={40} height={40} />
        )}
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: colors.qwPrimary,
  },
  icon: {
    color: colors.qwPrimary,
  }
});
