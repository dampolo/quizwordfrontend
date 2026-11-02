import { useSnackbar } from "../../../context/snackbar/useSnackbar";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LockIcon from "../../../../assets/icons/pwd-lock-icon-input-field.svg";
import EyeIcon from "../../../../assets/icons/eye.svg";
import EyeOffIcon from "../../../../assets/icons/eye-off.svg";
import { useAuth } from "../../../context/auth/useAuth";
import ScreenHeaderCustomer from "../../ScreenHeaderCustomer/ScreenHeaderCustomer";
import PreLoader from "../../PreLoader/pre-loader";
import { styles } from "../../../styles/styles";
import { changePasswordStyles } from "./change-password.styles";

const emptyForm = { old_password: "", new_password: "", repeated_new_password: "" };


function errorText(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n") : typeof value === "string" ? value : "";
}


function validatePasswords(form) {
  const errors = {};
  if (!form.old_password) {
    errors.old_password = "Bitte gib dein aktuelles Passwort ein.";
  }
  if (form.new_password.length < 10 || !/[a-z]/.test(form.new_password) || !/[A-Z]/.test(form.new_password) || !/[0-9]/.test(form.new_password) || !/[@$!%+\-/*?&]/.test(form.new_password) || /\s/.test(form.new_password)) {
    errors.new_password = "Mindestens 10 Zeichen, ein Klein- und ein Großbuchstabe, eine Zahl und ein Sonderzeichen (@ $ ! % + - / * ? &). Keine Leerzeichen.";
  }
  if (!form.repeated_new_password || form.new_password !== form.repeated_new_password) {
    errors.repeated_new_password = "Passwörter stimmen nicht überein.";
  }
  return errors;
}


export default function ChangePassword() {
  const { postChangePassword, setConfirmationMessage, logout } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [visible, setVisible] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const { showSnackbar, hideSnackbar } = useSnackbar();
  const [busy, setBusy] = useState(false);
  const [changed, setChanged] = useState(false);
  const busyRef = useRef(false);
  const changedRef = useRef(false);
  const oldPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const repeatedPasswordRef = useRef(null);
  const OldPasswordIcon = visible.old_password ? EyeIcon : EyeOffIcon;
  const NewPasswordIcon = visible.new_password ? EyeIcon : EyeOffIcon;
  const RepeatedPasswordIcon = visible.repeated_new_password ? EyeIcon : EyeOffIcon;


  function changeField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "", ...(name === "new_password" ? { repeated_new_password: "" } : {}) }));
  }


  function returnToProfile() {
    if (!busyRef.current && !changedRef.current) {
      router.navigate("/my-quiz/profile");
    }
  }


  function focusError(fieldErrors) {
    if (fieldErrors.old_password) {
      oldPasswordRef.current?.focus();
    } else if (fieldErrors.new_password) {
      newPasswordRef.current?.focus();
    } else if (fieldErrors.repeated_new_password) {
      repeatedPasswordRef.current?.focus();
    }
  }


  async function save() {
    if (busyRef.current) {
      return;
    }
    if (!changedRef.current) {
      const validation = validatePasswords(form);
      setErrors(validation);
      if (Object.keys(validation).length) {
        showSnackbar(validation.old_password || validation.new_password || validation.repeated_new_password);
        focusError(validation);
        return;
      }
    }
    busyRef.current = true;
    setBusy(true);
    hideSnackbar();
    try {
      if (!changedRef.current) {
        const result = await postChangePassword(form);
        changedRef.current = true;
        setChanged(true);
        setForm(emptyForm);
        setVisible({});
        setConfirmationMessage(errorText(result?.detail) || "Dein Passwort wurde erfolgreich geändert.");
      }
      await logout();
      router.replace("/quiz/(auth)/confirmation");
    } catch (failure) {
      if (changedRef.current) {
        showSnackbar("Dein Passwort wurde geändert. Die Abmeldung ist fehlgeschlagen. Bitte tippe auf Erneut abmelden.");
      } else {
        const data = failure?.response?.data ?? failure?.response;
        const fieldErrors = {
          old_password: errorText(data?.old_password),
          new_password: errorText(data?.new_password),
          repeated_new_password: errorText(data?.repeated_new_password),
        };
        setErrors(fieldErrors);
        showSnackbar(fieldErrors.old_password || fieldErrors.new_password || fieldErrors.repeated_new_password || errorText(data?.detail) || errorText(data?.non_field_errors) || "Das Passwort konnte nicht geändert werden. Bitte versuche es erneut.");
        focusError(fieldErrors);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }


  return (
    <SafeAreaView style={changePasswordStyles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeaderCustomer horizontalInset={0} title="Passwort ändern" fallbackHref="/my-quiz/profile" />
      <KeyboardAvoidingView style={changePasswordStyles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          style={changePasswordStyles.flex}
          keyboardDismissMode="on-drag" contentContainerStyle={changePasswordStyles.content} keyboardShouldPersistTaps="handled">
          <View style={changePasswordStyles.card}>
            <Text accessibilityRole="header" style={changePasswordStyles.title}>Passwort ändern</Text>
            <Text style={changePasswordStyles.body}>Gib dein aktuelles Passwort und zweimal dein neues Passwort ein. Nach der Änderung wirst du abgemeldet.</Text>
            <View style={changePasswordStyles.field}>
              <Text style={changePasswordStyles.label}>Aktuelles Passwort</Text>
              <View style={changePasswordStyles.inputContainer}>
                <TextInput
                  ref={oldPasswordRef}
                  testID="change-password-old_password"
                  accessibilityLabel="Aktuelles Passwort"
                  value={form.old_password}
                  onChangeText={(value) => changeField("old_password", value)}
                  onFocus={() => setFocusedField("old_password")}
                  onBlur={() => setFocusedField(null)}
                  editable={!busy && !changed}
                  secureTextEntry={!visible.old_password}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => newPasswordRef.current?.focus()}
                  style={[changePasswordStyles.input, focusedField === "old_password" && styles.inputFieldFocus, !!errors.old_password && changePasswordStyles.invalidInput]}
                />
                <View pointerEvents="none" accessible={false} style={changePasswordStyles.inputIcon}>
                  <LockIcon width={24} height={24} />
                </View>
                <Pressable
                  testID="change-password-toggle-old_password"
                  accessibilityRole="button"
                  accessibilityLabel={visible.old_password ? "Aktuelles Passwort verbergen" : "Aktuelles Passwort anzeigen"}
                  disabled={busy || changed}
                  onPress={() => setVisible((previous) => ({ ...previous, old_password: !previous.old_password }))}
                  style={({ pressed }) => [changePasswordStyles.toggle, pressed && styles.pressed]}
                >
                  <OldPasswordIcon width={24} height={24} />
                </Pressable>
              </View>
              {!!errors.old_password && <Text accessibilityRole="alert" style={changePasswordStyles.error}>{errors.old_password}</Text>}
            </View>
            <View style={changePasswordStyles.field}>
              <Text style={changePasswordStyles.label}>Neues Passwort</Text>
              <View style={changePasswordStyles.inputContainer}>
                <TextInput
                  ref={newPasswordRef}
                  testID="change-password-new_password"
                  accessibilityLabel="Neues Passwort"
                  value={form.new_password}
                  onChangeText={(value) => changeField("new_password", value)}
                  onFocus={() => setFocusedField("new_password")}
                  onBlur={() => setFocusedField(null)}
                  editable={!busy && !changed}
                  secureTextEntry={!visible.new_password}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => repeatedPasswordRef.current?.focus()}
                  style={[changePasswordStyles.input, focusedField === "new_password" && styles.inputFieldFocus, !!errors.new_password && changePasswordStyles.invalidInput]}
                />
                <View pointerEvents="none" accessible={false} style={changePasswordStyles.inputIcon}>
                  <LockIcon width={24} height={24} />
                </View>
                <Pressable
                  testID="change-password-toggle-new_password"
                  accessibilityRole="button"
                  accessibilityLabel={visible.new_password ? "Neues Passwort verbergen" : "Neues Passwort anzeigen"}
                  disabled={busy || changed}
                  onPress={() => setVisible((previous) => ({ ...previous, new_password: !previous.new_password }))}
                  style={({ pressed }) => [changePasswordStyles.toggle, pressed && styles.pressed]}
                >
                  <NewPasswordIcon width={24} height={24} />
                </Pressable>
              </View>
              {!!errors.new_password && <Text accessibilityRole="alert" style={changePasswordStyles.error}>{errors.new_password}</Text>}
            </View>
            <Text style={changePasswordStyles.body}>Mindestens 10 Zeichen, Groß- und Kleinbuchstaben, eine Zahl und ein Sonderzeichen (@ $ ! % + - / * ? &). Keine Leerzeichen.</Text>
            <View style={changePasswordStyles.field}>
              <Text style={changePasswordStyles.label}>Neues Passwort wiederholen</Text>
              <View style={changePasswordStyles.inputContainer}>
                <TextInput
                  ref={repeatedPasswordRef}
                  testID="change-password-repeated_new_password"
                  accessibilityLabel="Neues Passwort wiederholen"
                  value={form.repeated_new_password}
                  onChangeText={(value) => changeField("repeated_new_password", value)}
                  onFocus={() => setFocusedField("repeated_new_password")}
                  onBlur={() => setFocusedField(null)}
                  editable={!busy && !changed}
                  secureTextEntry={!visible.repeated_new_password}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={save}
                  style={[changePasswordStyles.input, focusedField === "repeated_new_password" && styles.inputFieldFocus, !!errors.repeated_new_password && changePasswordStyles.invalidInput]}
                />
                <View pointerEvents="none" accessible={false} style={changePasswordStyles.inputIcon}>
                  <LockIcon width={24} height={24} />
                </View>
                <Pressable
                  testID="change-password-toggle-repeated_new_password"
                  accessibilityRole="button"
                  accessibilityLabel={visible.repeated_new_password ? "Neues Passwort wiederholen verbergen" : "Neues Passwort wiederholen anzeigen"}
                  disabled={busy || changed}
                  onPress={() => setVisible((previous) => ({ ...previous, repeated_new_password: !previous.repeated_new_password }))}
                  style={({ pressed }) => [changePasswordStyles.toggle, pressed && styles.pressed]}
                >
                  <RepeatedPasswordIcon width={24} height={24} />
                </Pressable>
              </View>
              {!!errors.repeated_new_password && <Text accessibilityRole="alert" style={changePasswordStyles.error}>{errors.repeated_new_password}</Text>}
            </View>
            {busy && <PreLoader />}
            <Pressable testID="save-password" accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={save} style={({ pressed }) => [styles.button, pressed && !busy && styles.pressed, busy && styles.buttonDisabled]}>
              <Text style={[styles.buttonText, busy && styles.buttonTextDisabled]}>{changed ? "Erneut abmelden" : "Passwort ändern"}</Text>
            </Pressable>
            <Pressable testID="cancel-change-password" accessibilityRole="button" disabled={busy || changed} onPress={returnToProfile} style={({ pressed }) => [styles.button, styles.secondary, pressed && !busy && styles.pressed, (busy || changed) && styles.buttonDisabled]}>
              <Text style={[styles.buttonText, styles.secondaryText, (busy || changed) && styles.buttonTextDisabled]}>Zurück zum Profil</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
