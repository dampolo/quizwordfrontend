import { useRef, useState } from "react";
import { router } from "expo-router";
import {
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useTranslation from "@quizword/shared/translation/useTranslation";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { colors } from "../../styles/basic";
import { styles } from "../../styles/styles";
import { translateStyles } from "./translate.styles";


function getCode(language) {
  const code = (language?.language_code || language?.code || "").trim();
  const baseCode = code.toLowerCase().split(/[-_]/)[0];
  return ["de", "en", "es", "fr"].includes(baseCode) ? baseCode : code;
}


function languageKey(language) {
  return String(language.id);
}


export default function Translate() {
  const { nativeLanguage, userLanguages = [] } = useVocabulary();
  const { translate, translatedText, loading, error } = useTranslation();
  const [text, setText] = useState("");
  const [selectedSource, setSource] = useState(null);
  const [selectedTarget, setTarget] = useState(null);
  const [selection, setSelection] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const submitting = useRef(false);
  const languageOptions = [];
  for (const language of [nativeLanguage, ...userLanguages]) {
    if (
      language?.id &&
      !languageOptions.some((item) => String(item.id) === String(language.id))
    ) {
      languageOptions.push(language);
    }
  }
  const sourceId = selectedSource ?? String(nativeLanguage?.id ?? "");
  const targetId = selectedTarget ?? String(userLanguages[0]?.id ?? "");
  const sourceLanguage = languageOptions.find(
    (language) => String(language.id) === sourceId,
  );
  const targetLanguage = languageOptions.find(
    (language) => String(language.id) === targetId,
  );
  const source = getCode(sourceLanguage);
  const target = getCode(targetLanguage);
  const nativeId = String(nativeLanguage?.id ?? "");
  const includesNativeLanguage =
    submitted &&
    (submitted.sourceId === nativeId || submitted.targetId === nativeId);
  const canSubmit = !loading && Boolean(text.trim() && source && target);
  const hasResult = Boolean(
    submitted && translatedText.trim() && !loading && !error,
  );
  const canAdd =
    hasResult &&
    includesNativeLanguage &&
    submitted.sourceId !== submitted.targetId;


  async function handleSubmit() {
    if (!canSubmit || submitting.current) return;
    submitting.current = true;
    Keyboard.dismiss();
    setSubmitted({ text: text.trim(), sourceId, targetId });
    try {
      await translate({ text: text.trim(), source, target });
    } finally {
      submitting.current = false;
    }
  }


  function switchLanguages() {
    setSource(targetId);
    setTarget(sourceId);
  }


  function selectLanguage(language) {
    if (selection === "source") setSource(String(language.id));
    else setTarget(String(language.id));
    setSelection(null);
  }


  function handleAdd() {
    if (!canAdd) return;
    const nativeIsSource = submitted.sourceId === nativeId;
    router.navigate({
      pathname: "/my-quiz/add-new-word",
      params: {
        sourceWord: nativeIsSource ? submitted.text : translatedText.trim(),
        targetWord: nativeIsSource ? translatedText.trim() : submitted.text,
        targetLanguage: nativeIsSource
          ? submitted.targetId
          : submitted.sourceId,
        translationId: String(Date.now()),
      },
    });
  }


  function submitStyle({ pressed }) {
    return [
      styles.button,
      !canSubmit && styles.buttonDisabled,
      pressed && canSubmit && styles.pressed,
    ];
  }


  function addStyle({ pressed }) {
    return [
      styles.button,
      !canAdd && styles.buttonDisabled,
      pressed && canAdd && styles.pressed,
    ];
  }


  function renderLanguage({ item }) {
    const selected =
      String(item.id) === (selection === "source" ? sourceId : targetId);
    return (
      <Pressable
        testID={`translation-language-${item.id}`}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        style={[
          translateStyles.option,
          selected && translateStyles.selectedOption,
        ]}
        onPress={() => selectLanguage(item)}
      >
        <Text style={translateStyles.body}>{item.language_name}</Text>
      </Pressable>
    );
  }


  return (
    <SafeAreaView
      style={translateStyles.screen}
      edges={["top", "right", "left"]}
    >
      <ScrollView
        contentContainerStyle={translateStyles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <ScreenHeaderCustomer
          title="Übersetzer"
          style={translateStyles.header}
        />
        <View style={translateStyles.card}>
          <Text style={styles.subtitle} accessibilityRole="header">
            Text übersetzen
          </Text>
          <View style={translateStyles.field}>
            <Text style={translateStyles.label}>Text</Text>
            <TextInput
              testID="translation-text"
              accessibilityLabel="Text zum Übersetzen"
              style={translateStyles.input}
              value={text}
              onChangeText={setText}
              multiline
              editable={!loading}
              autoComplete="off"
              placeholder="Text eingeben …"
              placeholderTextColor={colors.qwBodyTextColor}
            />
          </View>
          <View style={translateStyles.field}>
            <Text style={translateStyles.label}>Ausgangssprache</Text>
            <Pressable
              testID="translation-source"
              accessibilityRole="button"
              accessibilityLabel="Ausgangssprache auswählen"
              disabled={loading}
              style={translateStyles.select}
              onPress={() => setSelection("source")}
            >
              <Text style={translateStyles.body}>
                {sourceLanguage?.language_name || "Wähle Sprache"}
              </Text>
              <Text style={translateStyles.body}>⌄</Text>
            </Pressable>
          </View>
          <Pressable
            testID="translation-switch"
            accessibilityRole="button"
            accessibilityLabel="Sprachen tauschen"
            disabled={loading}
            style={[styles.button, translateStyles.switchButton]}
            onPress={switchLanguages}
          >
            <Text style={styles.buttonText}>⇅</Text>
          </Pressable>
          <View style={translateStyles.field}>
            <Text style={translateStyles.label}>Zielsprache</Text>
            <Pressable
              testID="translation-target"
              accessibilityRole="button"
              accessibilityLabel="Zielsprache auswählen"
              disabled={loading}
              style={translateStyles.select}
              onPress={() => setSelection("target")}
            >
              <Text style={translateStyles.body}>
                {targetLanguage?.language_name || "Wähle Sprache"}
              </Text>
              <Text style={translateStyles.body}>⌄</Text>
            </Pressable>
          </View>
          {Boolean(sourceId && targetId && (!source || !target)) && (
            <Text style={translateStyles.error} accessibilityRole="alert">
              Für eine ausgewählte Sprache fehlt der Sprachcode. Bitte lade die
              Sprachen erneut.
            </Text>
          )}
          <Pressable
            testID="translation-submit"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit, busy: loading }}
            disabled={!canSubmit}
            style={submitStyle}
            onPress={handleSubmit}
          >
            <Text
              style={[
                styles.buttonText,
                !canSubmit && styles.buttonTextDisabled,
              ]}
            >
              {loading ? "Wird übersetzt…" : "Übersetzen"}
            </Text>
          </Pressable>
          {Boolean(error && submitted) && (
            <Text style={translateStyles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <View
            style={translateStyles.result}
            accessibilityLiveRegion="polite"
            accessibilityState={{ busy: loading }}
          >
            <Text style={styles.subtitle} accessibilityRole="header">
              Übersetzung
            </Text>
            <Text selectable style={translateStyles.body}>
              {hasResult ? translatedText : "---"}
            </Text>
            {hasResult && !includesNativeLanguage && (
              <Text style={translateStyles.body}>
                Zum Hinzufügen muss eine der Sprachen deine Muttersprache sein.
              </Text>
            )}
            {hasResult && submitted.sourceId === submitted.targetId && (
              <Text style={translateStyles.body}>
                Zum Hinzufügen bitte zwei verschiedene Sprachen wählen.
              </Text>
            )}
            <Pressable
              testID="translation-add"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canAdd }}
              disabled={!canAdd}
              style={addStyle}
              onPress={handleAdd}
            >
              <Text
                style={[
                  styles.buttonText,
                  !canAdd && styles.buttonTextDisabled,
                ]}
              >
                + Wort hinzufügen
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={Boolean(selection)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelection(null)}
      >
        <View style={translateStyles.backdrop}>
          <View style={translateStyles.dialog} accessibilityViewIsModal>
            <Text style={styles.subtitle} accessibilityRole="header">
              {selection === "source" ? "Ausgangssprache" : "Zielsprache"}
            </Text>
            <FlatList
              data={languageOptions}
              renderItem={renderLanguage}
              keyExtractor={languageKey}
              extraData={selection === "source" ? sourceId : targetId}
              ListEmptyComponent={
                <Text style={translateStyles.body}>
                  Keine Sprachen verfügbar.
                </Text>
              }
            />
            <Pressable
              accessibilityRole="button"
              style={styles.button}
              onPress={() => setSelection(null)}
            >
              <Text style={styles.buttonText}>Schließen</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
