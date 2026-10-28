import { Stack } from "expo-router";


export default function QuizzesLayout() {
  return (
    <Stack
      initialRouteName="all-quizzes"
      screenOptions={{ headerShown: false }}
    />
  );
}