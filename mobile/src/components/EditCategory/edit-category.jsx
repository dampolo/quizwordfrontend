import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import PreLoader from "../PreLoader/pre-loader";
import { styles } from "../../styles/styles";
import { editCategoryStyles } from "./edit-category.styles";


function buttonStyle({ pressed }) {
  return [styles.button, pressed && styles.pressed];
}


function secondaryStyle({ pressed }) {
  return [styles.button, styles.secondary, pressed && styles.pressed];
}


function languageInputStyle({ pressed }) {
  return [editCategoryStyles.input, pressed && styles.pressed];
}


function keepDialogOpen(event) {
  event.stopPropagation();
}


export default function EditCategory() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const originalLanguage = Array.isArray(params.language)
    ? params.language[0]
    : params.language;
  const { getCategory, updateCategory, deleteCategory, userLanguages } =
    useVocabulary();
  const loadAction = useRef(getCategory);
  const busyRef = useRef(false);
  const nameRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [name, setName] = useState("");
  const [languageId, setLanguageId] = useState("");
  const [languageName, setLanguageName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    loadAction.current = getCategory;
  }, [getCategory]);

  useEffect(() => {
    let active = true;


    async function load() {
      setLoading(true);
      setLoaded(false);
      setError("");
      try {
        if (!id) throw new Error("Missing category id");
        const category = await loadAction.current(id);
        if (!active) return;
        setName(category.category_name || "");
        setLanguageId(String(category.language_id ?? ""));
        setLanguageName(category.language_name || "");
        setLoaded(true);
      } catch {
        if (active)
          setError(
            "Die Kategorie konnte nicht geladen werden. Bitte versuche es erneut.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [id, attempt]);


  function returnToCategories() {
    if (busyRef.current) return;
    router.navigate({
      pathname: "/my-quiz/all-categories",
      params: { language: originalLanguage || "" },
    });
  }


  function saveStyle({ pressed }) {
    return [
      styles.button,
      pressed && !busy && styles.pressed,
      busy && styles.buttonDisabled,
    ];
  }


  async function save() {
    if (busyRef.current || !loaded) return;
    if (name.trim().length < 3 || !languageId) {
      setError(
        "Wähle eine Sprache und gib einen Kategorienamen mit mindestens drei Zeichen ein.",
      );
      if (name.trim().length < 3) nameRef.current?.focus();
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await updateCategory(Number(id), {
        category_name: name.trim(),
        language_id: Number(languageId),
      });
      if (
        !result ||
        result.category_name !== name.trim() ||
        String(result.language_id) !== languageId
      ) {
        throw new Error("Category update failed");
      }
      busyRef.current = false;
      returnToCategories();
    } catch {
      setError(
        "Die Kategorie konnte nicht gespeichert werden. Bitte versuche es erneut.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }


  async function confirmDelete() {
    if (busyRef.current || !loaded) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await deleteCategory(Number(id));
      setDialog(null);
      busyRef.current = false;
      returnToCategories();
    } catch {
      setDialog(null);
      setError(
        "Die Kategorie konnte nicht gelöscht werden. Bitte versuche es erneut.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }


  function closeDialog() {
    if (!busyRef.current) setDialog(null);
  }


  function renderLanguage({ item }) {
    const selected = String(item.id) === languageId;


    function select() {
      setLanguageId(String(item.id));
      setLanguageName(item.language_name);
      closeDialog();
    }


    function optionStyle({ pressed }) {
      return [
        editCategoryStyles.option,
        selected && editCategoryStyles.selected,
        pressed && styles.pressed,
      ];
    }

    return (
      <Pressable
        testID={`edit-category-language-${item.id}`}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        onPress={select}
        style={optionStyle}
      >
        <Text style={editCategoryStyles.label}>{item.language_name}</Text>
      </Pressable>
    );
  }
  const selectedLanguage = userLanguages.find(
    (item) => String(item.id) === languageId,
  );
  return (
    <SafeAreaView
      style={editCategoryStyles.screen}
      edges={["top", "right", "left"]}
    >
      <KeyboardAvoidingView
        style={editCategoryStyles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={editCategoryStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeaderCustomer
            title="Kategorie bearbeiten"
            fallbackHref="/my-quiz/all-categories"
            style={editCategoryStyles.header}
          />
          {loading ? (
            <PreLoader />
          ) : (
            <View style={editCategoryStyles.card}>
              <Text style={editCategoryStyles.title} accessibilityRole="header">
                Kategorie bearbeiten
              </Text>
              <Text style={editCategoryStyles.description}>
                Ändere den Namen und die Sprache deiner Kategorie.
              </Text>
              {!!error && (
                <Text
                  style={editCategoryStyles.error}
                  accessibilityRole="alert"
                >
                  {error}
                </Text>
              )}
              {loaded ? (
                <View style={editCategoryStyles.actions}>
                  <View style={editCategoryStyles.field}>
                    <Text style={editCategoryStyles.label}>Sprache *</Text>
                    <Pressable
                      testID="edit-category-language"
                      accessibilityRole="button"
                      accessibilityLabel="Sprache auswählen"
                      disabled={busy}
                      onPress={() => setDialog("languages")}
                      style={languageInputStyle}
                    >
                      <Text style={editCategoryStyles.label}>
                        {selectedLanguage?.language_name ||
                          languageName ||
                          "Wähle Sprache"}{" "}
                        ▾
                      </Text>
                    </Pressable>
                  </View>
                  <View style={editCategoryStyles.field}>
                    <Text style={editCategoryStyles.label}>
                      Kategoriename *
                    </Text>
                    <TextInput
                      ref={nameRef}
                      testID="edit-category-name"
                      accessibilityLabel="Kategoriename"
                      value={name}
                      onChangeText={setName}
                      editable={!busy}
                      style={editCategoryStyles.input}
                      returnKeyType="done"
                      onSubmitEditing={save}
                    />
                    <Text style={editCategoryStyles.description}>
                      Verwende mindestens drei Zeichen.
                    </Text>
                  </View>
                  <Pressable
                    testID="save-category"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: busy, busy }}
                    disabled={busy}
                    onPress={save}
                    style={saveStyle}
                  >
                    <Text style={styles.buttonText}>
                      {busy ? "Bitte warten …" : "Änderungen speichern"}
                    </Text>
                  </Pressable>
                  <Pressable
                    testID="cancel-edit-category"
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={returnToCategories}
                    style={secondaryStyle}
                  >
                    <Text style={[styles.buttonText, styles.secondaryText]}>
                      Abbrechen
                    </Text>
                  </Pressable>
                  <Pressable
                    testID="delete-category"
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => setDialog("delete")}
                    style={secondaryStyle}
                  >
                    <Text style={[styles.buttonText, styles.secondaryText]}>
                      Kategorie löschen
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  testID="retry-category"
                  accessibilityRole="button"
                  onPress={() => setAttempt(attempt + 1)}
                  style={buttonStyle}
                >
                  <Text style={styles.buttonText}>Erneut versuchen</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={dialog !== null}
        transparent
        animationType="fade"
        onRequestClose={closeDialog}
      >
        <Pressable
            testID="edit-category-modal-backdrop"
            accessibilityRole="button"
            accessibilityLabel="Dialog schließen"
            disabled={busy}
            onPress={closeDialog}
            style={editCategoryStyles.backdrop}
        >
          <Pressable style={editCategoryStyles.dialog} accessibilityViewIsModal accessible={false} onPress={keepDialogOpen}>
            <Text style={editCategoryStyles.title} accessibilityRole="header">
              {dialog === "languages"
                ? "Sprache auswählen"
                : "Kategorie löschen?"}
            </Text>
            {dialog === "languages" ? (
              <FlatList
                data={userLanguages}
                extraData={languageId}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderLanguage}
                ListEmptyComponent={
                  <Text style={editCategoryStyles.description}>
                    Keine Lernsprachen vorhanden.
                  </Text>
                }
              />
            ) : (
              <View style={editCategoryStyles.actions}>
                <Text style={editCategoryStyles.description}>
                  Möchtest du die Kategorie „{name}“ wirklich löschen?
                </Text>
                <Pressable
                  testID="confirm-delete-category"
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={confirmDelete}
                  style={saveStyle}
                >
                  <Text style={styles.buttonText}>
                    {busy ? "Bitte warten …" : "Löschen"}
                  </Text>
                </Pressable>
              </View>
            )}
            <Pressable
              testID="close-category-dialog"
              accessibilityRole="button"
              disabled={busy}
              onPress={closeDialog}
              style={secondaryStyle}
            >
              <Text style={[styles.buttonText, styles.secondaryText]}>
                Abbrechen
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
