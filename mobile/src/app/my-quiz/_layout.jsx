import { Tabs } from "expo-router";

export default function MyQuizLayout() {
  return (
    <Tabs
      initialRouteName="all-words"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="all-words"
        options={{ title: "Words" }}
      />
      <Tabs.Screen
        name="all-categories"
        options={{ title: "Categories" }}
      />
      <Tabs.Screen
        name="translate"
        options={{ title: "Translator" }}
      />
      <Tabs.Screen
        name="add-new-word"
        options={{ title: "Add word" }}
      />

      <Tabs.Screen
        name="(quizzes)"
        options={{ href: null }}
      />
    </Tabs>
  );
}