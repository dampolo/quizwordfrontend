import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { createQuizModalStyles } from "../CreateQuizModal/create-quiz-modal.styles";
import { addNewWordStyles } from "./add-new-word.styles";
import { styles } from "../../styles/styles";

export default function AddNewWord() {
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

  useEffect(() => {
    clearCategories();
  }, [clearCategories]);

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
  const canSave = Boolean(
    nativeLanguage?.id &&
    formData.translations[0].word.trim() &&
    formData.translations[1].word.trim() &&
    formData.translations[1].language,
  );

  function updateTranslation(index, changes) {
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
      pressed && !busy && canSave && styles.pressed,
      (busy || !canSave) && styles.buttonDisabled,
    ];
  }

  const submitTextStyle = [
    styles.buttonText,
    (busy || !canSave) && styles.buttonTextDisabled,
  ];

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
    if (submittingRef.current || !canSave || categoriesLoadingRef.current)
      return;
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
        contentContainerStyle={addNewWordStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeaderCustomer
          title="Neues Wort"
          style={addNewWordStyles.screenHeader}
        />

        <View style={addNewWordStyles.pageHeader}>
          <Text style={createQuizModalStyles.title} accessibilityRole="header">
            Neues Wort hinzufügen
          </Text>
          <Text style={createQuizModalStyles.description}>
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
              value={formData.translations[0].word}
              onChangeText={(word) => updateTranslation(0, { word })}
              editable={!busy}
              accessibilityLabel="Ausgangswort: Begriff"
              style={createQuizModalStyles.input}
              placeholder="z. B. Resilience"
            />
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
                  style={createQuizModalStyles.input}
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
                    createQuizModalStyles.input,
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

          <View style={[addNewWordStyles.panel, addNewWordStyles.targetPanel]}>
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
              value={formData.translations[1].word}
              onChangeText={(word) => updateTranslation(1, { word })}
              editable={!busy}
              accessibilityLabel="Zielwort: Begriff"
              style={createQuizModalStyles.input}
              placeholder="z. B. Resiliencia"
            />
            <Text style={addNewWordStyles.label}>Sprache</Text>
            <Pressable
              testID="target-language"
              style={addNewWordStyles.select}
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
            {moreTarget && (
              <View style={addNewWordStyles.field}>
                <Text style={addNewWordStyles.label}>Tipp (Optional)</Text>
                <TextInput
                  testID="target-tip"
                  value={formData.translations[1].tip}
                  onChangeText={(tip) => updateTranslation(1, { tip })}
                  editable={!busy}
                  accessibilityLabel="Zielwort: Tipp"
                  style={createQuizModalStyles.input}
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
                    createQuizModalStyles.input,
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
            <Text style={createQuizModalStyles.description}>
              Ein Beispielsatz hilft unserer KI dabei, bessere
              Karteikartenvarianten für deine nächste Lerneinheit zu erstellen.
            </Text>
          </View>

          <View style={createQuizModalStyles.dialogActions}>
            <Pressable
              testID="cancel-add-word"
              disabled={busy}
              onPress={() => router.replace("/my-quiz/all-words")}
              accessibilityRole="button"
              style={[
                createQuizModalStyles.dialogButton,
                createQuizModalStyles.dialogCancelButton,
              ]}
            >
              <Text
                style={[
                  createQuizModalStyles.dialogButtonText,
                  createQuizModalStyles.dialogCancelText,
                ]}
              >
                Abbrechen
              </Text>
            </Pressable>
            <Pressable
              testID="save-word"
              disabled={busy || !canSave}
              onPress={() => saveWord(false)}
              accessibilityRole="button"
              style={getSubmitStyle}
            >
              <Text
                style={submitTextStyle}
              >
                {submitting ? "Wird gespeichert …" : "Speichern"}
              </Text>
            </Pressable>
            <Pressable
              testID="save-another-word"
              disabled={busy || !canSave}
              onPress={() => saveWord(true)}
              accessibilityRole="button"
              accessibilityLabel="Speichern und neues Wort hinzufügen"
              style={getSubmitStyle}
            >
              <Text
                style={submitTextStyle}
              >
                Speichern +
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
        <View style={addNewWordStyles.modalBackdrop}>
          <View style={addNewWordStyles.optionDialog} accessibilityViewIsModal>
            <Text
              style={createQuizModalStyles.title}
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
                      createQuizModalStyles.dialogButton,
                      createQuizModalStyles.dialogCancelButton,
                    ]}
                  >
                    <Text
                      style={[
                        createQuizModalStyles.dialogButtonText,
                        createQuizModalStyles.dialogCancelText,
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
                createQuizModalStyles.dialogButton,
                createQuizModalStyles.dialogCancelButton,
              ]}
            >
              <Text
                style={[
                  createQuizModalStyles.dialogButtonText,
                  createQuizModalStyles.dialogCancelText,
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
          <View style={createQuizModalStyles.dialog} accessibilityViewIsModal>
            <Text
              style={createQuizModalStyles.title}
              accessibilityRole="header"
            >
              {notice?.title}
            </Text>
            <Text style={createQuizModalStyles.description}>
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
                  createQuizModalStyles.dialogButton,
                  createQuizModalStyles.dialogSaveButton,
                ]}
              >
                <Text
                  style={[
                    createQuizModalStyles.dialogButtonText,
                    createQuizModalStyles.dialogSaveText,
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
                createQuizModalStyles.dialogButton,
                createQuizModalStyles.dialogCancelButton,
              ]}
            >
              <Text
                style={[
                  createQuizModalStyles.dialogButtonText,
                  createQuizModalStyles.dialogCancelText,
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
