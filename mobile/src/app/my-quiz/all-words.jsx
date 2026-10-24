import { useState } from "react";
import { Alert, Button, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../../context/auth/useAuth";

export default function AllWords() {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      router.replace("/quiz/(auth)/login-quiz");
    } catch {
      Alert.alert("Logout failed", "Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <Text>All words</Text>

          <Button
            title={loggingOut ? "Logging out…" : "Log out"}
            onPress={handleLogout}
            disabled={loggingOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
