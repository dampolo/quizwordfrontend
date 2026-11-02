import { Stack } from "expo-router";


export default function ProfileLayout() {
  return (
    <Stack initialRouteName="profile" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-profile-image" />
    </Stack>
  );
}
