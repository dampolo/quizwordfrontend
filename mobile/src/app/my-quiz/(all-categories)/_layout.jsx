import { Stack } from "expo-router";

export default function AllCategoriesLayout() {
  return (
    <Stack initialRouteName="all-categories" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="all-categories" />
      <Stack.Screen name="edit-category" />
      <Stack.Screen name="add-new-category" />
    </Stack>
  );
}
