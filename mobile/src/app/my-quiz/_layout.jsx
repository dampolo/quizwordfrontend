import { QuizProvider } from "@quizword/shared/quiz/provider";
import { VocabularyProvider } from "@quizword/shared/vocabulary/provider";
import { TranslationProvider } from "@quizword/shared/translation/provider";
import { Drawer } from "expo-router/drawer";
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
          <Drawer screenOptions={{ drawerPosition: "right", headerShown: false }}>
            <Drawer.Screen name="(tabs)" options={{ title: "Meine Quiz" }} />
          </Drawer>
        </TranslationProvider>
      </QuizProvider>
    </VocabularyProvider>
  );
}
