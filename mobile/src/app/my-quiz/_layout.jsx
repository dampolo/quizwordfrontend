import { QuizProvider } from "@quizword/shared/quiz/provider";
import { VocabularyProvider } from "@quizword/shared/vocabulary/provider";
import { TranslationProvider } from "@quizword/shared/translation/provider";
import { router } from "expo-router";
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "expo-router/drawer";
import { Alert } from "react-native";
import { speak } from "../../services/speech";

export default function MyQuizLayout() {
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
                    router.navigate("/contact");
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
          </Drawer>
        </TranslationProvider>
      </QuizProvider>
    </VocabularyProvider>
  );
}
