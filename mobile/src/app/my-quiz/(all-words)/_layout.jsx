import { Stack } from "expo-router";

export default function AllWordsLayout() {
  return (
    <Stack initialRouteName="all-words" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="all-words" />
      <Stack.Screen name="edit-word" />
      <Stack.Screen name="show-word" />
    </Stack>
  );
}
