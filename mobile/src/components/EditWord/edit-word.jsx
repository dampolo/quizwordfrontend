import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { editWordStyles } from "./edit-word.styles";
import { styles } from "../../styles/styles";


export default function EditWord() {
  const {
    categories,
    loading,
    nativeLanguage,
    userLanguages,
    clearCategories,
    getFiltredCategories,
    getConcept,
    updateWord,
    getFiltredConcepts,
  } = useVocabulary();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const language = Array.isArray(params.language) ? params.language[0] : params.language;
  const targetWord = Array.isArray(params.targetWord) ? params.targetWord[0] : params.targetWord;
  const [loadingWord, setLoadingWord] = useState(true);
  const [loadedWord, setLoadedWord] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const vocabularyActions = useRef({ getConcept, getFiltredCategories, clearCategories });
  useEffect(() => {
    vocabularyActions.current = { getConcept, getFiltredCategories, clearCategories };
  });
  const [formData, setFormData] = useState({
    category: "",
    translations: [
      { language: "", word: "", tip: "", sentence: "" },
      { language: "", word: "", tip: "", sentence: "" },
    ],
  });
  const [moreSource, setMoreSource] = useState(false);
  const [moreTarget, setMoreTarget] = useState(false);
  const [selection, setSelection] = useState(null);
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const submittingRef = useRef(false);
  const categoriesLoadingRef = useRef(false);
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const sourceWordRef = useRef(null);
  const targetWordRef = useRef(null);
  const targetLanguageRef = useRef(null);
  const [requiredError, setRequiredError] = useState(null);

  useLayoutEffect(() => {
    if (!requiredError) return;
    const fieldRef =
      requiredError.field === "source-word"
        ? sourceWordRef
        : requiredError.field === "target-word"
          ? targetWordRef
          : targetLanguageRef;
    let active = true;

    if (requiredError.field === "target-language") {
      sourceWordRef.current?.blur();
      targetWordRef.current?.blur();
    } else if (Platform.OS === "web") {
      fieldRef.current?.focus({ preventScroll: true });
    } else {
      fieldRef.current?.focus();
    }

    contentRef.current?.measure(
      (
        contentX,
        contentY,
        contentWidth,
        contentHeight,
        contentPageX,
        contentPageY,
      ) => {
        fieldRef.current?.measure(
          (fieldX, fieldY, fieldWidth, fieldHeight, fieldPageX, fieldPageY) => {
            if (active) {
              scrollRef.current?.scrollTo({
                y: Math.max(0, fieldPageY - contentPageY - 24),
                animated: true,
              });
            }
          },
        );
      },
    );

    return () => {
      active = false;
    };
  }, [requiredError]);

  useFocusEffect(useCallback(() => {
    let active = true;


    async function loadWord() {
      setLoadingWord(true);
      setLoadedWord(false);
      setLoadError("");
      setNotice(null);
      setRequiredError(null);
      setSelection(null);
      const actions = vocabularyActions.current;
      actions.clearCategories();
      try {
        if (!id || !language) throw new Error("Missing word parameters");
        const concept = await actions.getConcept(id, language);
        if (!active) return;
        const translations = concept?.translations;
        if (!Array.isArray(translations) || translations.length !== 2) {
          throw new Error("Expected two translations");
        }
        const target = translations.find((translation) =>
          targetWord ? String(translation.id) === targetWord : String(translation.language) === language,
        );
        const source = translations.find((translation) => translation !== target);
        if (!source || !target) throw new Error("Translation not found");


        function normalize(translation) {
          return {
            id: translation.id,
            language: translation.language ?? "",
            word: translation.word ?? "",
            tip: translation.tip ?? "",
            sentence: translation.sentence ?? "",
            category_id: translation.category_id ?? "",
          };
        }


        setFormData({
          category: target.category_id ?? "",
          translations: [normalize(source), normalize(target)],
        });
        setMoreSource(Boolean(source.tip || source.sentence));
        setMoreTarget(Boolean(target.tip || target.sentence));
        await actions.getFiltredCategories(target.language);
        if (active) setLoadedWord(true);
      } catch {
        if (active) setLoadError("Das Wort konnte nicht geladen werden. Bitte versuche es erneut.");
      } finally {
        if (active) setLoadingWord(false);
      }
    }


    void loadWord();
    return () => { active = false; };
  // The retry counter intentionally reloads the same route after a load failure.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, language, targetWord, loadAttempt]));

  const languageOptions = [];
  for (const language of userLanguages) {
    languageOptions.push({ value: language.id, label: language.language_name });
  }
  const categoryOptions = [];
  for (const category of categories) {
    categoryOptions.push({
      value: category.category_id,
      label: category.category_name,
    });
  }
  const selectedLanguage = languageOptions.find(
    (language) =>
      String(language.value) === String(formData.translations[1].language),
  );
  const selectedCategory = categoryOptions.find(
    (category) => String(category.value) === String(formData.category),
  );
  const options = selection === "language" ? languageOptions : categoryOptions;
  const selectedValue =
    selection === "language"
      ? formData.translations[1].language
      : formData.category;
  const busy = submitting || loading || loadingWord || !loadedWord || categoriesLoading || Boolean(notice);


  function updateTranslation(index, changes) {
    if (changes.word?.trim()) {
      const field = index === 0 ? "source-word" : "target-word";
      setRequiredError((previous) =>
        previous?.field === field ? null : previous,
      );
    }
    if (index === 1 && changes.language) {
      setRequiredError((previous) =>
        previous?.field === "target-language" ? null : previous,
      );
    }
    setFormData((previous) => {
      const translations = [...previous.translations];
      translations[index] = { ...translations[index], ...changes };
      return { ...previous, translations };
    });
  }


  async function selectOption(value) {
    setSelection(null);
    if (selection === "category") {
      setFormData((previous) => ({ ...previous, category: value }));
      updateTranslation(1, { category_id: value });
      return;
    }
    if (categoriesLoadingRef.current) return;
    updateTranslation(1, { language: value, category_id: "" });
    setFormData((previous) => ({ ...previous, category: "" }));
    clearCategories();
    if (!value) return;
    categoriesLoadingRef.current = true;
    setCategoriesLoading(true);
    try {
      await getFiltredCategories(value);
    } catch {
      setNotice({ title: "Kategorien konnten nicht geladen werden", message: "Bitte versuche es erneut." });
    } finally {
      categoriesLoadingRef.current = false;
      setCategoriesLoading(false);
    }
  }


  function getSubmitStyle({ pressed }) {
    return [
      styles.button,
      pressed && !busy && styles.pressed,
      busy && styles.buttonDisabled,
    ];
  }


  function submitTextStyle() {
    return [styles.buttonText, busy && styles.buttonTextDisabled];
  }


  function returnToWords() {
    router.replace({
      pathname: "/my-quiz/all-words",
      params: { language: String(formData.translations[1].language || language || "") },
    });
  }


  function finishSave() {
    void getFiltredConcepts(formData.translations[1].language);
    returnToWords();
  }


  async function saveWord() {
    if (submittingRef.current || busy || categoriesLoadingRef.current) return;
    if (!formData.translations[0].word.trim()) {
      setRequiredError({ field: "source-word" });
      return;
    }
    if (!formData.translations[1].word.trim()) {
      setRequiredError({ field: "target-word" });
      return;
    }
    if (!formData.translations[1].language) {
      setRequiredError({ field: "target-language" });
      setSelection("language");
      return;
    }
    setRequiredError(null);
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await updateWord(id, {
        translations: [
          { ...formData.translations[0], word: formData.translations[0].word.trim() },
          { ...formData.translations[1], word: formData.translations[1].word.trim(), category_id: formData.category },
        ],
      });
      setNotice({
        title: "Wort gespeichert",
        message: `Wort "${formData.translations[1].word}" wurde geändert!`,
        saved: true,
      });
    } catch (error) {
      const detail =
        error?.translations?.[0] || error?.detail || error?.language || error?.response?.detail;
      setNotice({
        title: "Speichern fehlgeschlagen",
        message:
          typeof detail === "string"
            ? detail
            : "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }


  function closeNotice() {
    if (notice?.saved) finishSave();
    setNotice(null);
  }


  return (
    <SafeAreaView
      style={editWordStyles.screen}
      edges={["top", "right", "left"]}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={editWordStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View ref={contentRef} collapsable={false}>
          <ScreenHeaderCustomer
            title="Wort bearbeiten"
            style={editWordStyles.screenHeader}
          />

          <View style={editWordStyles.pageHeader}>
            <Text
              style={editWordStyles.title}
              accessibilityRole="header"
            >
              Wort bearbeiten
            </Text>
            <Text style={editWordStyles.description}>
              Bearbeite dein Wort, die Übersetzung und deine Eselsbrücken.
            </Text>
          </View>

          {loadingWord && <Text style={editWordStyles.inputText} accessibilityLiveRegion="polite">Wort wird geladen …</Text>}
          {Boolean(loadError) && (
            <View style={editWordStyles.field}>
              <Text style={editWordStyles.requiredError} accessibilityRole="alert">{loadError}</Text>
              <Pressable testID="retry-edit-word" accessibilityRole="button" style={styles.button} onPress={() => setLoadAttempt((previous) => previous + 1)}>
                <Text style={styles.buttonText}>Erneut versuchen</Text>
              </Pressable>
            </View>
          )}
          <View style={editWordStyles.card}>
            <View style={editWordStyles.field}>
              <Text style={editWordStyles.label}>Kategorie</Text>
              <Pressable
                testID="word-category"
                style={editWordStyles.select}
                accessibilityRole="button"
                accessibilityLabel="Kategorie auswählen"
                disabled={busy || !formData.translations[1].language}
                onPress={() => setSelection("category")}
              >
                <Text style={editWordStyles.inputText}>
                  {categoriesLoading
                    ? "Kategorien werden geladen …"
                    : selectedCategory?.label || "Wähle Kategorie"}
                </Text>
                <Text style={editWordStyles.inputText}>⌄</Text>
              </Pressable>
            </View>

            <View style={editWordStyles.panel}>
              <Text
                style={editWordStyles.panelTitle}
                accessibilityRole="header"
              >
                Ausgangswort
              </Text>
              <Text style={editWordStyles.label}>Begriff *</Text>
              <TextInput
                testID="source-word"
                ref={sourceWordRef}
                accessibilityHint={
                  requiredError?.field === "source-word"
                    ? "Fülle dieses Feld aus."
                    : undefined
                }
                value={formData.translations[0].word}
                onChangeText={(word) => updateTranslation(0, { word })}
                editable={!busy}
                accessibilityLabel="Ausgangswort: Begriff"
                style={[
                  editWordStyles.input,
                  requiredError?.field === "source-word" &&
                    editWordStyles.invalidField,
                ]}
                placeholder="z. B. Resilience"
              />
              {requiredError?.field === "source-word" && (
                <Text
                  testID="source-word-error"
                  accessibilityLiveRegion="polite"
                  style={editWordStyles.requiredError}
                >
                  Fülle dieses Feld aus.
                </Text>
              )}
              <Text style={editWordStyles.label}>Sprache</Text>
              <View style={editWordStyles.select}>
                <Text style={editWordStyles.inputText}>
                  {nativeLanguage?.language_name || "Muttersprache"}
                </Text>
              </View>
              {moreSource && (
                <View style={editWordStyles.field}>
                  <Text style={editWordStyles.label}>Tipp (Optional)</Text>
                  <TextInput
                    testID="source-tip"
                    value={formData.translations[0].tip}
                    onChangeText={(tip) => updateTranslation(0, { tip })}
                    editable={!busy}
                    accessibilityLabel="Ausgangswort: Tipp"
                    style={editWordStyles.input}
                    placeholder="Stell dir eine Feder vor, die zurückspringt"
                  />
                  <Text style={editWordStyles.label}>
                    Beispielsatz (Optional)
                  </Text>
                  <TextInput
                    testID="source-sentence"
                    value={formData.translations[0].sentence}
                    onChangeText={(sentence) =>
                      updateTranslation(0, { sentence })
                    }
                    editable={!busy}
                    accessibilityLabel="Ausgangswort: Beispielsatz"
                    style={[
                      editWordStyles.input,
                      editWordStyles.textarea,
                    ]}
                    placeholder="Verwende den Begriff in einem Satz."
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              )}
              <Pressable
                testID="source-more"
                accessibilityRole="button"
                accessibilityLabel={
                  moreSource ? "Ausgangswort: weniger" : "Ausgangswort: mehr"
                }
                accessibilityState={{ expanded: moreSource, disabled: busy }}
                disabled={busy}
                onPress={() => setMoreSource((previous) => !previous)}
                style={editWordStyles.moreButton}
              >
                <Text style={editWordStyles.moreText}>
                  {moreSource ? "weniger" : "mehr"}
                </Text>
              </Pressable>
            </View>

            <View
              style={[editWordStyles.panel, editWordStyles.targetPanel]}
            >
              <Text
                style={[
                  editWordStyles.panelTitle,
                  editWordStyles.targetTitle,
                ]}
                accessibilityRole="header"
              >
                Zielwort
              </Text>
              <Text style={editWordStyles.label}>Begriff *</Text>
              <TextInput
                testID="target-word"
                ref={targetWordRef}
                accessibilityHint={
                  requiredError?.field === "target-word"
                    ? "Fülle dieses Feld aus."
                    : undefined
                }
                value={formData.translations[1].word}
                onChangeText={(word) => updateTranslation(1, { word })}
                editable={!busy}
                accessibilityLabel="Zielwort: Begriff"
                style={[
                  editWordStyles.input,
                  requiredError?.field === "target-word" &&
                    editWordStyles.invalidField,
                ]}
                placeholder="z. B. Resiliencia"
              />
              {requiredError?.field === "target-word" && (
                <Text
                  testID="target-word-error"
                  accessibilityLiveRegion="polite"
                  style={editWordStyles.requiredError}
                >
                  Fülle dieses Feld aus.
                </Text>
              )}
              <Text style={editWordStyles.label}>Sprache</Text>
              <Pressable
                testID="target-language"
                ref={targetLanguageRef}
                accessibilityHint={
                  requiredError?.field === "target-language"
                    ? "Wähle eine Sprache aus."
                    : undefined
                }
                style={[
                  editWordStyles.select,
                  requiredError?.field === "target-language" &&
                    editWordStyles.invalidField,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Zielsprache auswählen"
                disabled={busy}
                onPress={() => setSelection("language")}
              >
                <Text style={editWordStyles.inputText}>
                  {selectedLanguage?.label || "Wähle Sprache"}
                </Text>
                <Text style={editWordStyles.inputText}>⌄</Text>
              </Pressable>
              {requiredError?.field === "target-language" && (
                <Text
                  testID="target-language-error"
                  accessibilityLiveRegion="polite"
                  style={editWordStyles.requiredError}
                >
                  Wähle eine Sprache aus.
                </Text>
              )}
              {moreTarget && (
                <View style={editWordStyles.field}>
                  <Text style={editWordStyles.label}>Tipp (Optional)</Text>
                  <TextInput
                    testID="target-tip"
                    value={formData.translations[1].tip}
                    onChangeText={(tip) => updateTranslation(1, { tip })}
                    editable={!busy}
                    accessibilityLabel="Zielwort: Tipp"
                    style={editWordStyles.input}
                    placeholder="Stell dir eine Feder vor, die zurückspringt"
                  />
                  <Text style={editWordStyles.label}>
                    Beispielsatz (Optional)
                  </Text>
                  <TextInput
                    testID="target-sentence"
                    value={formData.translations[1].sentence}
                    onChangeText={(sentence) =>
                      updateTranslation(1, { sentence })
                    }
                    editable={!busy}
                    accessibilityLabel="Zielwort: Beispielsatz"
                    style={[
                      editWordStyles.input,
                      editWordStyles.textarea,
                    ]}
                    placeholder="Verwende den Begriff in einem Satz."
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              )}
              <Pressable
                testID="target-more"
                accessibilityRole="button"
                accessibilityLabel={
                  moreTarget ? "Zielwort: weniger" : "Zielwort: mehr"
                }
                accessibilityState={{ expanded: moreTarget, disabled: busy }}
                disabled={busy}
                onPress={() => setMoreTarget((previous) => !previous)}
                style={editWordStyles.moreButton}
              >
                <Text style={editWordStyles.moreText}>
                  {moreTarget ? "weniger" : "mehr"}
                </Text>
              </Pressable>
            </View>

            <View style={editWordStyles.proTip}>
              <Text style={editWordStyles.panelTitle}>💡 Profi-Tipp</Text>
              <Text style={editWordStyles.description}>
                Ein Beispielsatz hilft unserer KI dabei, bessere
                Karteikartenvarianten für deine nächste Lerneinheit zu
                erstellen.
              </Text>
            </View>

            <View style={editWordStyles.dialogActions}>
              <Pressable
                testID="cancel-edit-word"
                disabled={submitting}
                onPress={returnToWords}
                accessibilityRole="button"
                style={[
                  editWordStyles.dialogButton,
                  editWordStyles.dialogCancelButton,
                ]}
              >
                <Text
                  style={[
                    editWordStyles.dialogButtonText,
                    editWordStyles.dialogCancelText,
                  ]}
                >
                  Abbrechen
                </Text>
              </Pressable>
              <Pressable
                testID="save-word"
                disabled={busy}
                onPress={saveWord}
                accessibilityRole="button"
                style={getSubmitStyle}
              >
                <Text style={submitTextStyle()}>
                  {submitting ? "Wird gespeichert …" : "Speichern"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(selection)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelection(null)}
      >
        <View style={editWordStyles.modalBackdrop}>
          <View style={editWordStyles.optionDialog} accessibilityViewIsModal>
            <Text
              style={editWordStyles.title}
              accessibilityRole="header"
            >
              {selection === "language" ? "Sprache" : "Kategorie"}
            </Text>
            <FlatList
              data={[{ value: "", label: "Keine Auswahl" }, ...options]}
              keyExtractor={(item) => String(item.value)}
              extraData={selectedValue}
              ListFooterComponent={
                selection === "category" ? (
                  <Pressable
                    testID="add-category"
                    disabled
                    accessibilityRole="button"
                    style={[
                      editWordStyles.dialogButton,
                      editWordStyles.dialogCancelButton,
                    ]}
                  >
                    <Text
                      style={[
                        editWordStyles.dialogButtonText,
                        editWordStyles.dialogCancelText,
                      ]}
                    >
                      + Kategorie hinzufügen
                    </Text>
                  </Pressable>
                ) : null
              }
              renderItem={({ item }) => (
                <Pressable
                  testID={`select-option-${item.value || "empty"}`}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: String(item.value) === String(selectedValue),
                  }}
                  onPress={() => selectOption(item.value)}
                  style={[
                    editWordStyles.option,
                    String(item.value) === String(selectedValue) &&
                      editWordStyles.selectedOption,
                  ]}
                >
                  <Text style={editWordStyles.inputText}>{item.label}</Text>
                </Pressable>
              )}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelection(null)}
              style={[
                editWordStyles.dialogButton,
                editWordStyles.dialogCancelButton,
              ]}
            >
              <Text
                style={[
                  editWordStyles.dialogButtonText,
                  editWordStyles.dialogCancelText,
                ]}
              >
                Schließen
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(notice)}
        transparent
        animationType="fade"
        onRequestClose={closeNotice}
      >
        <View style={editWordStyles.modalBackdrop}>
          <View style={editWordStyles.dialog} accessibilityViewIsModal>
            <Text
              style={editWordStyles.title}
              accessibilityRole="header"
            >
              {notice?.title}
            </Text>
            <Text style={editWordStyles.description}>
              {notice?.message}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={closeNotice}
              style={[
                editWordStyles.dialogButton,
                editWordStyles.dialogCancelButton,
              ]}
            >
              <Text
                style={[
                  editWordStyles.dialogButtonText,
                  editWordStyles.dialogCancelText,
                ]}
              >
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
