import { QuizProvider } from "@quizword/shared/quiz/provider";
import { VocabularyProvider } from "@quizword/shared/vocabulary/provider";
import { TranslationProvider } from "@quizword/shared/translation/provider";
import { Tabs } from "expo-router";
import CategoriesIcon from "../../../assets/icons/categories-icon.svg";
import WordsIcon from "../../../assets/icons/words.svg";
import AddIcon from "../../../assets/icons/add.svg";
import QuizIcon from "../../../assets/icons/quiz-icon.svg";
import TranslateIcon from "../../../assets/icons/translate.svg";
import { styles, tabColors } from "../../styles/my-quiz-tabs";
import { Alert, Pressable } from "react-native";
import { colors } from "../../styles/basic";
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
          <Tabs
            initialRouteName="(all-words)"
            backBehavior="history"
            screenOptions={{
              headerShown: false,
              tabBarHideOnKeyboard: true,
              tabBarLabelPosition: "below-icon",
              tabBarActiveTintColor: tabColors.active,
              tabBarInactiveTintColor: tabColors.inactive,
              tabBarActiveBackgroundColor: tabColors.activeBackground,
              tabBarStyle: styles.tabBar,
              tabBarItemStyle: styles.tabBarItem,
              tabBarLabelStyle: styles.tabBarLabel,
              tabBarButton: (props) => (
                <Pressable
                  {...props}
                  android_ripple={{
                    color: colors.qwSixth,
                    borderless: false,
                  }}
                />
              ),
            }}
          >
            <Tabs.Screen
              name="(all-categories)"
              options={{
                title: "Kategorien",
                tabBarIcon: ({ color, size }) => (
                  <CategoriesIcon
                    width={size}
                    height={size}
                    color={color}
                    accessible={false}
                    aria-hidden
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="(all-words)"
              options={{
                title: "Wörter",
                tabBarIcon: ({ color, size }) => (
                  <WordsIcon
                    width={size}
                    height={size}
                    color={color}
                    accessible={false}
                    aria-hidden
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="add-new-word"
              options={{
                title: "Neu",
                tabBarIcon: ({ color, size }) => (
                  <AddIcon
                    width={size}
                    height={size}
                    color={color}
                    accessible={false}
                    aria-hidden
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="(quizzes)"
              options={{
                title: "Quizze",
                tabBarIcon: ({ color, size }) => (
                  <QuizIcon
                    width={size}
                    height={size}
                    color={color}
                    accessible={false}
                    aria-hidden
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="translate"
              options={{
                title: "Übersetzer",
                tabBarIcon: ({ color, size }) => (
                  <TranslateIcon
                    width={size}
                    height={size}
                    color={color}
                    accessible={false}
                    aria-hidden
                  />
                ),
              }}
            />
          </Tabs>
        </TranslationProvider>
      </QuizProvider>
    </VocabularyProvider>
  );
}
