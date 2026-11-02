import { AuthProvider } from "../context/auth/AuthProvider";
import "../i18n/i18n";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { View } from "react-native";
import { fontAssets } from "../assets/fonts";
import PreLoader from "../components/PreLoader/pre-loader";
import { resets } from "../styles/resets";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
    return (
      <View style={resets.loading}>
        <PreLoader />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider>
          <PaperProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </PaperProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
