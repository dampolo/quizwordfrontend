import { useSnackbar } from "../../../context/snackbar/useSnackbar";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import ScreenHeaderCustomer from "../../ScreenHeaderCustomer/ScreenHeaderCustomer";
import PreLoader from "../../PreLoader/pre-loader";
import { styles } from "../../../styles/styles";
import { editLanguagesStyles } from "./edit-languages.styles";

function errorText(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string").join("\n")
    : typeof value === "string"
      ? value
      : "";
}

export default function EditLanguages() {
  const { languages, nativeLanguage, userLanguages, postLanguages } =
    useVocabulary();
  const { redirect } = useLocalSearchParams();
  const [nativeId, setNativeId] = useState(null);
  const [learningIds, setLearningIds] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const { showSnackbar, hideSnackbar } = useSnackbar();
  const [saved, setSaved] = useState(false);
  const busyRef = useRef(false);
  const selectedNativeId =
    nativeId ?? (nativeLanguage?.id != null ? String(nativeLanguage.id) : "");
  const selectedLearningIds = (
    learningIds ?? userLanguages.map((language) => String(language.id))
  ).filter((id) => id !== selectedNativeId);
  const valid =
    !!selectedNativeId &&
    selectedLearningIds.length > 0 &&
    languages.length > 0;

  function chooseNative(id) {
    if (busyRef.current) {
      return;
    }
    setNativeId(id);
    setLearningIds(
      selectedLearningIds.filter((languageId) => languageId !== id),
    );
    setErrors({});
    setSaved(false);
  }

  function toggleLearning(id) {
    if (busyRef.current || id === selectedNativeId) {
      return;
    }
    setLearningIds(
      selectedLearningIds.includes(id)
        ? selectedLearningIds.filter((languageId) => languageId !== id)
        : [...selectedLearningIds, id],
    );
    setErrors({});
    setSaved(false);
  }

  function returnToProfile() {
    if (!busyRef.current) {
      if (saved && redirect === "false") {
        router.navigate({
          pathname: "/my-quiz/all-words",
          params: { language: selectedLearningIds[0] },
        });
      } else {
        router.navigate("/my-quiz/profile");
      }
    }
  }

  async function save() {
    if (busyRef.current) {
      return;
    }
    if (!valid) {
      showSnackbar(
        "Wähle deine Muttersprache und mindestens eine andere Sprache zum Lernen.",
      );
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setErrors({});
    hideSnackbar();
    try {
      await postLanguages({
        native_language_id: Number(selectedNativeId),
        learning_languages_id: selectedLearningIds.map(Number),
      });
      setSaved(true);
      showSnackbar("Deine Sprachen wurden geändert!");
      router.navigate("/my-quiz/profile");
    } catch (failure) {
      const data = failure?.response?.data ?? failure?.response;
      const fieldErrors = {
        native_language_id: errorText(data?.native_language_id),
        learning_languages_id: errorText(data?.learning_languages_id),
      };
      setErrors(fieldErrors);
      showSnackbar(
        fieldErrors.native_language_id ||
          fieldErrors.learning_languages_id ||
          errorText(data?.detail) ||
          errorText(data?.non_field_errors) ||
          "Die Sprachen konnten nicht gespeichert werden. Bitte versuche es erneut.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <SafeAreaView
      style={editLanguagesStyles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScreenHeaderCustomer
        horizontalInset={0}
        title="Sprachen bearbeiten"
        fallbackHref="/my-quiz/profile"
      />
      <KeyboardAvoidingView
        style={editLanguagesStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={editLanguagesStyles.flex}
          contentContainerStyle={editLanguagesStyles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={editLanguagesStyles.card}>
            <Text accessibilityRole="header" style={editLanguagesStyles.title}>
              Wähle deine Sprachen
            </Text>
            <Text style={editLanguagesStyles.body}>
              Wähle deine Muttersprache und mindestens eine Lernsprache. Deine
              Muttersprache kann nicht gleichzeitig eine Lernsprache sein.
            </Text>
            {!languages.length && (
              <Text accessibilityRole="alert" style={editLanguagesStyles.error}>
                Keine Sprachen verfügbar. Bitte öffne diese Seite erneut, sobald
                die Sprachen geladen sind.
              </Text>
            )}
            <Text accessibilityRole="header" style={editLanguagesStyles.label}>
              Deine Muttersprache
            </Text>
            <View
              accessibilityRole="radiogroup"
              style={editLanguagesStyles.options}
            >
              {languages.map((language) => {
                const id = String(language.id);
                const selected = selectedNativeId === id;
                return (
                  <Pressable
                    key={id}
                    testID={`edit-languages-native-${id}`}
                    accessibilityRole="radio"
                    accessibilityLabel={language.language_name}
                    accessibilityState={{ checked: selected, disabled: busy }}
                    disabled={busy}
                    onPress={() => chooseNative(id)}
                    style={({ pressed }) => [
                      editLanguagesStyles.option,
                      selected && editLanguagesStyles.selectedOption,
                      pressed && styles.pressed,
                      busy && editLanguagesStyles.disabled,
                    ]}
                  >
                    <Text accessible={false} style={editLanguagesStyles.symbol}>
                      {selected ? "◉" : "○"}
                    </Text>
                    <Text style={editLanguagesStyles.optionText}>
                      {language.language_name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {!!errors.native_language_id && (
              <Text accessibilityRole="alert" style={editLanguagesStyles.error}>
                {errors.native_language_id}
              </Text>
            )}
            <Text accessibilityRole="header" style={editLanguagesStyles.label}>
              Deine Lernsprachen
            </Text>
            <View style={editLanguagesStyles.options}>
              {languages.map((language) => {
                const id = String(language.id);
                const selected = selectedLearningIds.includes(id);
                const disabled = busy || id === selectedNativeId;
                return (
                  <Pressable
                    key={id}
                    testID={`edit-languages-learning-${id}`}
                    accessibilityRole="checkbox"
                    accessibilityLabel={language.language_name}
                    accessibilityState={{ checked: selected, disabled }}
                    disabled={disabled}
                    onPress={() => toggleLearning(id)}
                    style={({ pressed }) => [
                      editLanguagesStyles.option,
                      selected && editLanguagesStyles.selectedOption,
                      pressed && styles.pressed,
                      disabled && editLanguagesStyles.disabled,
                    ]}
                  >
                    <Text accessible={false} style={editLanguagesStyles.symbol}>
                      {selected ? "☑" : "☐"}
                    </Text>
                    <Text style={editLanguagesStyles.optionText}>
                      {language.language_name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {!!errors.learning_languages_id && (
              <Text accessibilityRole="alert" style={editLanguagesStyles.error}>
                {errors.learning_languages_id}
              </Text>
            )}
            {busy && <PreLoader />}
            <Pressable
              testID="save-languages"
              accessibilityRole="button"
              accessibilityState={{ disabled: busy || !valid, busy }}
              disabled={busy || !valid}
              onPress={save}
              style={({ pressed }) => [
                styles.button,
                pressed && !busy && styles.pressed,
                (busy || !valid) && styles.buttonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  (busy || !valid) && styles.buttonTextDisabled,
                ]}
              >
                Speichern
              </Text>
            </Pressable>
            <Pressable
              testID="cancel-edit-languages"
              accessibilityRole="button"
              disabled={busy}
              onPress={returnToProfile}
              style={({ pressed }) => [
                styles.button,
                styles.secondary,
                pressed && !busy && styles.pressed,
                busy && styles.buttonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  styles.secondaryText,
                  busy && styles.buttonTextDisabled,
                ]}
              >
                {saved && redirect === "false"
                  ? "Zu deinen Wörtern"
                  : "Zurück zum Profil"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
