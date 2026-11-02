import { router, useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import ArrowLeft from "../../../assets/icons/arrow-left.svg";
import ProfileIcon from "../../../assets/icons/profile.svg";
import { useAuth } from "../../context/auth/useAuth";
import { headerStyles } from "./ScreenHeaderCustomer.styles";


export default function ScreenHeaderCustomer({
  title,
  fallbackHref = "/my-quiz",
  titleStyle,
  horizontalInset = 16,
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
    <View style={[headerStyles.container, { marginHorizontal: -horizontalInset }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("MOBILE.GO_BACK")}
        hitSlop={12}
        style={({ hovered, pressed }) => [
          headerStyles.action,
          (hovered || pressed) && headerStyles.pressed,
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
          headerStyles.action, headerStyles.avatar,
          (hovered || pressed) && headerStyles.pressed,
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
