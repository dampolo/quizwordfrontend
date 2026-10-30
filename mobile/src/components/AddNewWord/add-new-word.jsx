import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
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
import { quizModalStyles } from "../QuizModal/quiz-modal.styles";
import { addNewWordStyles } from "./add-new-word.styles";
import { styles } from "../../styles/styles";


export default function AddNewWord() {
  const { sourceWord, targetWord, targetLanguage, translationId } = useLocalSearchParams();
  const appliedTranslation = useRef(null);
  const {
    categories,
    loading,
    nativeLanguage,
    userLanguages,
    clearCategories,
    getFiltredCategories,
    createConcept,
    getFiltredConcepts,
  } = useVocabulary();
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
  const pendingSave = useRef(false);
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

  useEffect(() => {
    clearCategories();
  }, [clearCategories]);

  useEffect(() => {
    if (
      typeof translationId !== "string" ||
      appliedTranslation.current === translationId ||
      typeof sourceWord !== "string" ||
      typeof targetWord !== "string" ||
      typeof targetLanguage !== "string" ||
      !nativeLanguage?.id ||
      !userLanguages.some((language) => String(language.id) === targetLanguage)
    ) return;
    appliedTranslation.current = translationId;
    setFormData({
      category: "",
      translations: [
        { language: nativeLanguage.id, word: sourceWord, tip: "", sentence: "" },
        { language: targetLanguage, word: targetWord, tip: "", sentence: "" },
      ],
    });
    setRequiredError(null);
    clearCategories();
    categoriesLoadingRef.current = true;
    setCategoriesLoading(true);
    void getFiltredCategories(targetLanguage).finally(() => {
      categoriesLoadingRef.current = false;
      setCategoriesLoading(false);
    });
    router.setParams({ sourceWord: undefined, targetWord: undefined, targetLanguage: undefined, translationId: undefined });
  }, [translationId, sourceWord, targetWord, targetLanguage, nativeLanguage?.id, userLanguages, clearCategories, getFiltredCategories]);

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
  const busy = submitting || loading || categoriesLoading || Boolean(notice);


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
      return;
    }
    if (categoriesLoadingRef.current) return;
    updateTranslation(1, { language: value });
    setFormData((previous) => ({ ...previous, category: "" }));
    clearCategories();
    if (!value) return;
    categoriesLoadingRef.current = true;
    setCategoriesLoading(true);
    try {
      await getFiltredCategories(value);
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


  function submitTextStyle(){
    return [styles.buttonText,
    busy && styles.buttonTextDisabled]
  }


  function finishSave() {
    if (pendingSave.current) {
      setFormData((previous) => ({
        ...previous,
        translations: [
          {
            language: previous.translations[0].language,
            word: "",
            tip: "",
            sentence: "",
          },
          {
            language: previous.translations[1].language,
            word: "",
            tip: "",
            sentence: "",
          },
        ],
      }));
    } else {
      void getFiltredConcepts(formData.translations[1].language);
      router.replace({
        pathname: "/my-quiz/all-words",
        params: { language: String(formData.translations[1].language) },
      });
    }
  }


  async function saveWord(addAnother, allowNewMeaning = false) {
    if (submittingRef.current || loading || categoriesLoadingRef.current)
      return;
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
    if (!nativeLanguage?.id) {
      setNotice({
        title: "Sprache fehlt",
        message:
          "Deine Muttersprache konnte nicht geladen werden. Bitte versuche es erneut.",
      });
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    pendingSave.current = addAnother;
    try {
      const payload = {
        ...formData,
        translations: [
          { ...formData.translations[0], language: nativeLanguage.id },
          { ...formData.translations[1] },
        ],
      };
      if (allowNewMeaning) payload.allow_new_meaning = true;
      const data = await createConcept(payload);
      if (data.requires_confirmation) {
        setNotice({
          title: "Weitere Bedeutung hinzufügen?",
          message: "Für dieses Wort existiert bereits eine Übersetzung.",
          confirm: true,
        });
      } else if (data.info?.length > 0) {
        setNotice({ title: "Hinweis", message: data.info[0] });
      } else {
        setNotice({
          title: "Wort hinzugefügt",
          message: `Wort "${formData.translations[1].word}" wurde hinzugefügt!`,
          saved: true,
        });
      }
    } catch (error) {
      const detail =
        error.response?.translations?.[0] || error.response?.detail;
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
      style={addNewWordStyles.screen}
      edges={["top", "right", "left"]}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={addNewWordStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View ref={contentRef} collapsable={false}>
          <ScreenHeaderCustomer
            title="Neues Wort"
            style={addNewWordStyles.screenHeader}
          />

          <View style={addNewWordStyles.pageHeader}>
            <Text
              style={quizModalStyles.title}
              accessibilityRole="header"
            >
              Neues Wort hinzufügen
            </Text>
            <Text style={quizModalStyles.description}>
              Erweitere deinen Wortschatz mit Kontext und Eselsbrücken.
            </Text>
          </View>

          <View style={addNewWordStyles.card}>
            <View style={addNewWordStyles.field}>
              <Text style={addNewWordStyles.label}>Kategorie</Text>
              <Pressable
                testID="word-category"
                style={addNewWordStyles.select}
                accessibilityRole="button"
                accessibilityLabel="Kategorie auswählen"
                disabled={busy || !formData.translations[1].language}
                onPress={() => setSelection("category")}
              >
                <Text style={addNewWordStyles.inputText}>
                  {categoriesLoading
                    ? "Kategorien werden geladen …"
                    : selectedCategory?.label || "Wähle Kategorie"}
                </Text>
                <Text style={addNewWordStyles.inputText}>⌄</Text>
              </Pressable>
            </View>

            <View style={addNewWordStyles.panel}>
              <Text
                style={addNewWordStyles.panelTitle}
                accessibilityRole="header"
              >
                Ausgangswort
              </Text>
              <Text style={addNewWordStyles.label}>Begriff *</Text>
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
                  quizModalStyles.input,
                  requiredError?.field === "source-word" &&
                    addNewWordStyles.invalidField,
                ]}
                placeholder="z. B. Resilience"
              />
              {requiredError?.field === "source-word" && (
                <Text
                  testID="source-word-error"
                  accessibilityLiveRegion="polite"
                  style={addNewWordStyles.requiredError}
                >
                  Fülle dieses Feld aus.
                </Text>
              )}
              <Text style={addNewWordStyles.label}>Sprache</Text>
              <View style={addNewWordStyles.select}>
                <Text style={addNewWordStyles.inputText}>
                  {nativeLanguage?.language_name || "Muttersprache"}
                </Text>
              </View>
              {moreSource && (
                <View style={addNewWordStyles.field}>
                  <Text style={addNewWordStyles.label}>Tipp (Optional)</Text>
                  <TextInput
                    testID="source-tip"
                    value={formData.translations[0].tip}
                    onChangeText={(tip) => updateTranslation(0, { tip })}
                    editable={!busy}
                    accessibilityLabel="Ausgangswort: Tipp"
                    style={quizModalStyles.input}
                    placeholder="Stell dir eine Feder vor, die zurückspringt"
                  />
                  <Text style={addNewWordStyles.label}>
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
                      quizModalStyles.input,
                      addNewWordStyles.textarea,
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
                style={addNewWordStyles.moreButton}
              >
                <Text style={addNewWordStyles.moreText}>
                  {moreSource ? "weniger" : "mehr"}
                </Text>
              </Pressable>
            </View>

            <View
              style={[addNewWordStyles.panel, addNewWordStyles.targetPanel]}
            >
              <Text
                style={[
                  addNewWordStyles.panelTitle,
                  addNewWordStyles.targetTitle,
                ]}
                accessibilityRole="header"
              >
                Zielwort
              </Text>
              <Text style={addNewWordStyles.label}>Begriff *</Text>
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
                  quizModalStyles.input,
                  requiredError?.field === "target-word" &&
                    addNewWordStyles.invalidField,
                ]}
                placeholder="z. B. Resiliencia"
              />
              {requiredError?.field === "target-word" && (
                <Text
                  testID="target-word-error"
                  accessibilityLiveRegion="polite"
                  style={addNewWordStyles.requiredError}
                >
                  Fülle dieses Feld aus.
                </Text>
              )}
              <Text style={addNewWordStyles.label}>Sprache</Text>
              <Pressable
                testID="target-language"
                ref={targetLanguageRef}
                accessibilityHint={
                  requiredError?.field === "target-language"
                    ? "Wähle eine Sprache aus."
                    : undefined
                }
                style={[
                  addNewWordStyles.select,
                  requiredError?.field === "target-language" &&
                    addNewWordStyles.invalidField,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Zielsprache auswählen"
                disabled={busy}
                onPress={() => setSelection("language")}
              >
                <Text style={addNewWordStyles.inputText}>
                  {selectedLanguage?.label || "Wähle Sprache"}
                </Text>
                <Text style={addNewWordStyles.inputText}>⌄</Text>
              </Pressable>
              {requiredError?.field === "target-language" && (
                <Text
                  testID="target-language-error"
                  accessibilityLiveRegion="polite"
                  style={addNewWordStyles.requiredError}
                >
                  Wähle eine Sprache aus.
                </Text>
              )}
              {moreTarget && (
                <View style={addNewWordStyles.field}>
                  <Text style={addNewWordStyles.label}>Tipp (Optional)</Text>
                  <TextInput
                    testID="target-tip"
                    value={formData.translations[1].tip}
                    onChangeText={(tip) => updateTranslation(1, { tip })}
                    editable={!busy}
                    accessibilityLabel="Zielwort: Tipp"
                    style={quizModalStyles.input}
                    placeholder="Stell dir eine Feder vor, die zurückspringt"
                  />
                  <Text style={addNewWordStyles.label}>
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
                      quizModalStyles.input,
                      addNewWordStyles.textarea,
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
                style={addNewWordStyles.moreButton}
              >
                <Text style={addNewWordStyles.moreText}>
                  {moreTarget ? "weniger" : "mehr"}
                </Text>
              </Pressable>
            </View>

            <View style={addNewWordStyles.proTip}>
              <Text style={addNewWordStyles.panelTitle}>💡 Profi-Tipp</Text>
              <Text style={quizModalStyles.description}>
                Ein Beispielsatz hilft unserer KI dabei, bessere
                Karteikartenvarianten für deine nächste Lerneinheit zu
                erstellen.
              </Text>
            </View>

            <View style={quizModalStyles.dialogActions}>
              <Pressable
                testID="cancel-add-word"
                disabled={busy}
                onPress={() => router.replace("/my-quiz/all-words")}
                accessibilityRole="button"
                style={[
                  quizModalStyles.dialogButton,
                  quizModalStyles.dialogCancelButton,
                ]}
              >
                <Text
                  style={[
                    quizModalStyles.dialogButtonText,
                    quizModalStyles.dialogCancelText,
                  ]}
                >
                  Abbrechen
                </Text>
              </Pressable>
              <Pressable
                testID="save-word"
                disabled={busy}
                onPress={() => saveWord(false)}
                accessibilityRole="button"
                style={getSubmitStyle}
              >
                <Text style={submitTextStyle}>
                  {submitting ? "Wird gespeichert …" : "Speichern"}
                </Text>
              </Pressable>
              <Pressable
                testID="save-another-word"
                disabled={busy}
                onPress={() => saveWord(true)}
                accessibilityRole="button"
                accessibilityLabel="Speichern und neues Wort hinzufügen"
                style={getSubmitStyle}
              >
                <Text style={submitTextStyle}>Speichern +</Text>
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
        <View style={addNewWordStyles.modalBackdrop}>
          <View style={addNewWordStyles.optionDialog} accessibilityViewIsModal>
            <Text
              style={quizModalStyles.title}
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
                      quizModalStyles.dialogButton,
                      quizModalStyles.dialogCancelButton,
                    ]}
                  >
                    <Text
                      style={[
                        quizModalStyles.dialogButtonText,
                        quizModalStyles.dialogCancelText,
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
                    addNewWordStyles.option,
                    String(item.value) === String(selectedValue) &&
                      addNewWordStyles.selectedOption,
                  ]}
                >
                  <Text style={addNewWordStyles.inputText}>{item.label}</Text>
                </Pressable>
              )}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelection(null)}
              style={[
                quizModalStyles.dialogButton,
                quizModalStyles.dialogCancelButton,
              ]}
            >
              <Text
                style={[
                  quizModalStyles.dialogButtonText,
                  quizModalStyles.dialogCancelText,
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
        <View style={addNewWordStyles.modalBackdrop}>
          <View style={quizModalStyles.dialog} accessibilityViewIsModal>
            <Text
              style={quizModalStyles.title}
              accessibilityRole="header"
            >
              {notice?.title}
            </Text>
            <Text style={quizModalStyles.description}>
              {notice?.message}
            </Text>
            {notice?.confirm && (
              <Pressable
                testID="confirm-new-meaning"
                accessibilityRole="button"
                onPress={() => {
                  setNotice(null);
                  void saveWord(pendingSave.current, true);
                }}
                style={[
                  quizModalStyles.dialogButton,
                  quizModalStyles.dialogSaveButton,
                ]}
              >
                <Text
                  style={[
                    quizModalStyles.dialogButtonText,
                    quizModalStyles.dialogSaveText,
                  ]}
                >
                  Hinzufügen
                </Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={closeNotice}
              style={[
                quizModalStyles.dialogButton,
                quizModalStyles.dialogCancelButton,
              ]}
            >
              <Text
                style={[
                  quizModalStyles.dialogButtonText,
                  quizModalStyles.dialogCancelText,
                ]}
              >
                {notice?.confirm ? "Abbrechen" : "OK"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
