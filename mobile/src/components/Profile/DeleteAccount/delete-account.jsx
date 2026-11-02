import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LockIcon from "../../../../assets/icons/pwd-lock-icon-input-field.svg";
import EyeIcon from "../../../../assets/icons/eye.svg";
import EyeOffIcon from "../../../../assets/icons/eye-off.svg";
import { useAuth } from "../../../context/auth/useAuth";
import { useSnackbar } from "../../../context/snackbar/useSnackbar";
import ScreenHeaderCustomer from "../../ScreenHeaderCustomer/ScreenHeaderCustomer";
import PreLoader from "../../PreLoader/pre-loader";
import { styles } from "../../../styles/styles";
import { deleteAccountStyles } from "./delete-account.styles";


function errorText(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n") : typeof value === "string" ? value : "";
}


export default function DeleteAccount() {
  const { deleteAccount, logout, setConfirmationMessage } = useAuth();
  const { showSnackbar, hideSnackbar } = useSnackbar();
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const busyRef = useRef(false);
  const deletedRef = useRef(false);
  const inputRef = useRef(null);
  const PasswordIcon = passwordVisible ? EyeIcon : EyeOffIcon;


  function changePassword(value) {
    setPassword(value);
    setError("");
  }


  function returnToProfile() {
    if (!busyRef.current && !deletedRef.current) {
      router.navigate("/my-quiz/profile");
    }
  }


  async function removeAccount() {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError("");
    hideSnackbar();
    try {
      if (!deletedRef.current) {
        const result = await deleteAccount({ password });
        deletedRef.current = true;
        setDeleted(true);
        setPassword("");
        setPasswordVisible(false);
        setConfirmationMessage(errorText(result?.detail) || "Dein Konto wurde erfolgreich gelöscht.");
      }
      await logout();
      showSnackbar("Dein Konto wurde erfolgreich gelöscht.", "success");
      router.replace("/quiz/(auth)/confirmation");
    } catch (failure) {
      if (deletedRef.current) {
        showSnackbar("Dein Konto wurde gelöscht. Die Abmeldung ist fehlgeschlagen. Bitte tippe auf Erneut abmelden.", "error");
      } else {
        const data = failure?.response?.data ?? failure?.response ?? failure;
        const message = errorText(data?.password) || errorText(data?.detail) || errorText(data?.non_field_errors) || "Dein Konto konnte nicht gelöscht werden. Bitte versuche es erneut.";
        setError(message);
        showSnackbar(message, "error");
        inputRef.current?.focus();
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }


  function confirmDelete() {
    if (busyRef.current) {
      return;
    }
    if (deletedRef.current) {
      void removeAccount();
      return;
    }
    if (!password) {
      const message = "Bitte gib dein aktuelles Passwort ein.";
      setError(message);
      showSnackbar(message, "error");
      inputRef.current?.focus();
      return;
    }
    Alert.alert(
      "Konto endgültig löschen?",
      "Dein Konto und alle deine Wörter, Quizze und Kategorien werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
      [
        { text: "Abbrechen", style: "cancel" },
        { text: "Endgültig löschen", style: "destructive", onPress: removeAccount },
      ],
      { cancelable: true },
    );
  }


  return (
    <SafeAreaView style={deleteAccountStyles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeaderCustomer horizontalInset={0} title="Konto löschen" fallbackHref="/my-quiz/profile" />
      <KeyboardAvoidingView style={deleteAccountStyles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={deleteAccountStyles.flex} contentContainerStyle={deleteAccountStyles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <View style={deleteAccountStyles.card}>
            <Text accessibilityRole="header" style={deleteAccountStyles.title}>Lösche dein Konto</Text>
            <Text style={deleteAccountStyles.body}>Wenn du dein Konto löschst, werden alle deine Wörter, Quizze und Kategorien entfernt. Diese Aktion kann nicht rückgängig gemacht werden.</Text>
            <Text style={deleteAccountStyles.body}>Um dein Konto zu löschen, gib bitte dein aktuelles Passwort ein.</Text>
            <View style={deleteAccountStyles.field}>
              <Text style={deleteAccountStyles.label}>Aktuelles Passwort</Text>
              <View style={deleteAccountStyles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  testID="delete-account-password"
                  accessibilityLabel="Aktuelles Passwort"
                  value={password}
                  onChangeText={changePassword}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  editable={!busy && !deleted}
                  secureTextEntry={!passwordVisible}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={confirmDelete}
                  style={[deleteAccountStyles.input, focused && styles.inputFieldFocus, !!error && deleteAccountStyles.invalidInput]}
                />
                <View pointerEvents="none" accessible={false} style={deleteAccountStyles.inputIcon}>
                  <LockIcon width={24} height={24} />
                </View>
                <Pressable testID="delete-account-toggle-password" accessibilityRole="button" accessibilityLabel={passwordVisible ? "Passwort verbergen" : "Passwort anzeigen"} disabled={busy || deleted} onPress={() => setPasswordVisible((previous) => !previous)} style={({ pressed }) => [deleteAccountStyles.toggle, pressed && styles.pressed]}>
                  <PasswordIcon width={24} height={24} />
                </Pressable>
              </View>
              {!!error && <Text accessibilityRole="alert" style={deleteAccountStyles.error}>{error}</Text>}
            </View>
            {busy && <PreLoader />}
            <Pressable testID="delete-account-submit" accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={confirmDelete} style={({ pressed }) => [styles.button, deleteAccountStyles.deleteButton, pressed && !busy && styles.pressed, busy && styles.buttonDisabled]}>
              <Text style={[styles.buttonText, busy && styles.buttonTextDisabled]}>{deleted ? "Erneut abmelden" : "Konto endgültig löschen"}</Text>
            </Pressable>
            <Pressable testID="cancel-delete-account" accessibilityRole="button" disabled={busy || deleted} onPress={returnToProfile} style={({ pressed }) => [styles.button, styles.secondary, pressed && !busy && styles.pressed, (busy || deleted) && styles.buttonDisabled]}>
              <Text style={[styles.buttonText, styles.secondaryText, (busy || deleted) && styles.buttonTextDisabled]}>Abbrechen</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
