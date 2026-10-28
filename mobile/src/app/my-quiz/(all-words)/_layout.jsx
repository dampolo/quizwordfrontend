import { Stack } from "expo-router";

export default function AllWordsLayout() {
  return (
    <Stack
      initialRouteName="all-words"
      screenOptions={{ headerShown: false }}
    />
  );
}
