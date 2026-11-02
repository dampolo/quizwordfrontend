import { Stack } from "expo-router";


export default function ProfileLayout() {
  return (
    <Stack initialRouteName="profile" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
    </Stack>
  );
}
