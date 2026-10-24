import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ScreenHeader/screen-header";
import { useAuth } from "../../../context/auth/useAuth";
import { auth, authCompact, authCompactWidth } from "../../../styles/auth";
import { resets } from "../../../styles/resets";
import { styles } from "../../../styles/styles";

export default function Confirmation() {
  const { confirmationMessage } = useAuth();
  const compact = useWindowDimensions().width <= authCompactWidth;
  const mainAuthStyle = [auth.mainAuth, compact && authCompact.mainAuth];
  const contentStyle = [
    auth.mainContentCustomer,
    compact && authCompact.mainContentCustomer,
  ];

  function getButtonStyle({ pressed }) {
    return [styles.button, pressed && auth.pressed];
  }

  return (
    <SafeAreaView style={resets.screen} edges={["bottom"]}>
      <ScreenHeader title="" fallbackHref="/quiz/(auth)/login-quiz" />
      <ScrollView contentContainerStyle={mainAuthStyle}>
        <View style={contentStyle}>
          <View style={auth.formTitle}>
            <Text accessibilityRole="header" style={auth.formTitleName}>
              Bestätigung
            </Text>
          </View>
          <Text accessibilityLiveRegion="polite" style={auth.description}>
            {confirmationMessage}
          </Text>
          <Link href="/quiz/(auth)/login-quiz" replace asChild>
            <Pressable testID="confirmation-login" style={getButtonStyle}>
              <Text style={auth.btnPasswordText}>Anmelden</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
