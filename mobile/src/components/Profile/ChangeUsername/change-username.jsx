import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Snackbar } from "react-native-paper";
import { useAuth } from "../../../context/auth/useAuth";
import PreLoader from "../../PreLoader/pre-loader";
import ScreenHeaderCustomer from "../../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { styles } from "../../../styles/styles";
import { changeUsernameStyles } from "./change-username.styles";


export default function ChangeUsername() {
  const { profile, patchChangeUsername, getProfile } = useAuth();
  const [focused, setFocused] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const inputRef = useRef(null);
  const valid = /^\S{4,10}$/.test(username);


  function changeUsername(value) {
    setUsername(value);
    setError("");
  }


  function returnToProfile() {
    if (!busyRef.current) {
      router.navigate("/my-quiz/profile");
    }
  }


  async function save() {
    if (busyRef.current) {
      return;
    }
    if (!valid) {
      const message = "Mindestens 4, maximal 10 Zeichen und keine Leerzeichen.";
      setError(message);
      setNotice(message);
      inputRef.current?.focus();
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await patchChangeUsername({ username });
      await getProfile();
      setUsername("");
      setNotice("Dein Benutzername wurde geändert!");
    } catch (failure) {
      const data = failure?.response?.data ?? failure?.response;
      const detail = data?.username || data?.detail || data?.non_field_errors;
      const message = (Array.isArray(detail) ? detail.filter((item) => typeof item === "string").join("\n") : typeof detail === "string" ? detail : "") || "Der Benutzername konnte nicht geändert werden. Bitte versuche es erneut.";
      setError(message);
      setNotice(message);
      inputRef.current?.focus();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }


  return (
    <SafeAreaView style={changeUsernameStyles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeaderCustomer horizontalInset={0} title="Benutzername ändern" fallbackHref="/my-quiz/profile" />
      <KeyboardAvoidingView style={changeUsernameStyles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          style={changeUsernameStyles.flex}
          keyboardDismissMode="on-drag" contentContainerStyle={changeUsernameStyles.content} keyboardShouldPersistTaps="handled">
          <View style={changeUsernameStyles.card}>
            <Text accessibilityRole="header" style={changeUsernameStyles.title}>Benutzername ändern</Text>
            <Text style={changeUsernameStyles.body}>Hier kannst du einen neuen Benutzernamen eingeben.</Text>
            <Text style={changeUsernameStyles.body}>Aktueller Benutzername: {profile?.username || "–"}</Text>
            <View style={changeUsernameStyles.field}>
              <Text style={changeUsernameStyles.label}>Dein neuer Benutzername</Text>
              <TextInput
                ref={inputRef}
                testID="change-username-input"
                accessibilityLabel="Dein neuer Benutzername"
                value={username}
                onChangeText={changeUsername}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                editable={!busy}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username-new"
                returnKeyType="done"
                onSubmitEditing={save}
                style={[changeUsernameStyles.input, focused && styles.inputFieldFocus, !!error && changeUsernameStyles.invalidInput]}
              />
              <Text style={changeUsernameStyles.hint}>Mindestens 4, maximal 10 Zeichen und keine Leerzeichen.</Text>
              {!!error && <Text accessibilityRole="alert" style={changeUsernameStyles.error}>{error}</Text>}
            </View>
            {busy && <PreLoader />}
            <Pressable testID="save-username" accessibilityRole="button" accessibilityState={{ disabled: busy || !valid, busy }} disabled={busy || !valid} onPress={save} style={({ pressed }) => [styles.button, pressed && !busy && styles.pressed, (busy || !valid) && styles.buttonDisabled]}>
              <Text style={[styles.buttonText, busy && styles.buttonTextDisabled]}>Ändern</Text>
            </Pressable>
            <Pressable testID="cancel-change-username" accessibilityRole="button" disabled={busy} onPress={returnToProfile} style={({ pressed }) => [styles.button, styles.secondary, pressed && !busy && styles.pressed, busy && styles.buttonDisabled]}>
              <Text style={[styles.buttonText, styles.secondaryText, busy && styles.buttonTextDisabled]}>Zurück zum Profil</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar visible={!!notice} onDismiss={() => setNotice("")} action={{ label: "OK", onPress: () => setNotice("") }}>{notice}</Snackbar>
    </SafeAreaView>
  );
}
