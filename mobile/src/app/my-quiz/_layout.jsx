import { QuizProvider } from "@quizword/shared/quiz/provider";
import { VocabularyProvider } from "@quizword/shared/vocabulary/provider";
import { TranslationProvider } from "@quizword/shared/translation/provider";
import { router } from "expo-router";
import { confirmContactRedirect } from "../../services/contact";
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "expo-router/drawer";
import { Alert } from "react-native";
import { speak } from "../../services/speech";
import { useRef, useState } from "react";
import ProfileIcon from "../../../assets/icons/profile.svg";
import LogoutIcon from "../../../assets/icons/log-out.svg";
import SettingsIcon from "../../../assets/icons/settings.svg";
import { useAuth } from "../../context/auth/useAuth";


export default function MyQuizLayout() {
  const { logout } = useAuth();
  const loggingOutRef = useRef(false);
  const [loggingOut, setLoggingOut] = useState(false);


  function openPage(navigation, href) {
    navigation.closeDrawer();
    router.navigate(href);
  }


  async function logOut(navigation) {
    if (loggingOutRef.current) {
      return;
    }
    loggingOutRef.current = true;
    setLoggingOut(true);
    try {
      await logout();
      navigation.closeDrawer();
      router.replace("/");
    } catch {
      Alert.alert("Abmelden fehlgeschlagen", "Bitte versuche es erneut.");
    } finally {
      loggingOutRef.current = false;
      setLoggingOut(false);
    }
  }


  return (
    <VocabularyProvider
      speak={speak}
      api={process.env.EXPO_PUBLIC_API_URL}
      onError={(message) =>
        Alert.alert("Vokabeln konnten nicht geladen werden", message)
      }
    >
      <QuizProvider api={process.env.EXPO_PUBLIC_API_URL}>
        <TranslationProvider
          api={process.env.EXPO_PUBLIC_API_URL}
          onError={(message) =>
            Alert.alert("Übersetzung fehlgeschlagen", message)
          }
        >
          <Drawer
            screenOptions={{ drawerPosition: "right", headerShown: false }}
            drawerContent={(props) => (
              <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
                <DrawerItem
                  label="Profil"
                  icon={({ size }) => <ProfileIcon width={size} height={size} />}
                  onPress={() => openPage(props.navigation, "/my-quiz/profile")}
                />
                <DrawerItem
                  label={loggingOut ? "Abmelden …" : "Log out"}
                  icon={({ size }) => <LogoutIcon width={size} height={size} />}
                  onPress={() => logOut(props.navigation)}
                />
                <DrawerItem
                  label="Einstellungen"
                  icon={({ size }) => <SettingsIcon width={size} height={size} />}
                  onPress={() => openPage(props.navigation, "/my-quiz/settings")}
                />

                <DrawerItem
                  label="Datenschutz"
                  onPress={() => {
                    props.navigation.closeDrawer();
                    router.navigate("/privacy-policy");
                  }}
                />
                <DrawerItem
                  label="Impressum"
                  onPress={() => {
                    props.navigation.closeDrawer();
                    router.navigate("/imprint");
                  }}
                />
                <DrawerItem
                  label="Kontakt"
                  onPress={() => {
                    props.navigation.closeDrawer();
                    confirmContactRedirect();
                  }}
                />
                <DrawerItem
                  label="Help Desk"
                  onPress={() => {
                    props.navigation.closeDrawer();
                    router.navigate("/help-desk");
                  }}
                />
                <DrawerItem
                  label="Preise"
                  onPress={() => {
                    props.navigation.closeDrawer();
                    router.navigate("/price");
                  }}
                />
              </DrawerContentScrollView>
            )}
          >
            <Drawer.Screen name="(tabs)" options={{ title: "Meine Quiz" }} />
            <Drawer.Screen name="(profile)" options={{ drawerItemStyle: { display: "none" } }} />
            <Drawer.Screen name="settings" options={{ drawerItemStyle: { display: "none" } }} />
          </Drawer>
        </TranslationProvider>
      </QuizProvider>
    </VocabularyProvider>
  );
}


