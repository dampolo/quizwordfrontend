import { Tabs, useSegments } from "expo-router";
import CategoriesIcon from "../../../../assets/icons/categories-icon.svg";
import WordsIcon from "../../../../assets/icons/words.svg";
import AddIcon from "../../../../assets/icons/add.svg";
import QuizIcon from "../../../../assets/icons/quiz-icon.svg";
import TranslateIcon from "../../../../assets/icons/translate.svg";
import { styles, tabColors } from "../../../styles/my-quiz-tabs";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../styles/basic";

export default function MyQuizTabsLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1];
  const isQuizOpen = currentScreen === "hear-quiz" || currentScreen === "learn-quiz" || currentScreen === "play-test-quiz" || currentScreen === "flip-card-quiz" || currentScreen === "flip-card-quiz-reverse" || currentScreen === "word-audio-loop" || currentScreen === "word-audio-loop-reverse";
  return (
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
        tabBarStyle: [
          styles.tabBar,
          { height: 54 + insets.bottom },
          isQuizOpen && { display: "none" },
        ],
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
        name="(all-quizzes)"
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
  );
}
