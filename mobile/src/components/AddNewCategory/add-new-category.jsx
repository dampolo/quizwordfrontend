import { useRef, useState } from "react";
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
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { styles } from "../../styles/styles";
import { editCategoryStyles } from "../EditCategory/edit-category.styles";


function secondaryStyle({ pressed }) {
  return [styles.button, styles.secondary, pressed && styles.pressed];
}


function languageInputStyle({ pressed }) {
  return [editCategoryStyles.input, pressed && styles.pressed];
}


function languageKey(item) {
  return String(item.id);
}


export default function AddNewCategory() {
  const { createCategory, userLanguages } = useVocabulary();
  const [name, setName] = useState("");
  const [languageId, setLanguageId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);
  const selectedLanguage = userLanguages.find(isSelectedLanguage);
  const canSave = name.trim().length >= 3 && Boolean(languageId);


  function isSelectedLanguage(language) {
    return String(language.id) === languageId;
  }


  function openLanguages() {
    if (!submittingRef.current) setDialogOpen(true);
  }


  function closeLanguages() {
    setDialogOpen(false);
  }


  function cancel() {
    if (submittingRef.current) return;
    router.navigate("/my-quiz/all-categories");
  }


  function saveStyle({ pressed }) {
    return [
      styles.button,
      pressed && canSave && !submitting && styles.pressed,
      (!canSave || submitting) && styles.buttonDisabled,
    ];
  }


  async function save() {
    if (!canSave || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      await createCategory({ category_name: name.trim(), language_id: Number(languageId) });
      router.navigate({
        pathname: "/my-quiz/all-categories",
        params: { language: languageId },
      });
    } catch (failure) {
      const detail = failure.response?.category_name ?? failure.response?.language_id ?? failure.response?.detail;
      const message = Array.isArray(detail) ? detail.join(" ") : detail;
      setError(typeof message === "string" ? message : "Die Kategorie konnte nicht erstellt werden. Bitte versuche es erneut.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }


  function renderLanguage({ item }) {
    const selected = String(item.id) === languageId;


    function select() {
      setLanguageId(String(item.id));
      closeLanguages();
    }


    function optionStyle({ pressed }) {
      return [editCategoryStyles.option, selected && editCategoryStyles.selected, pressed && styles.pressed];
    }

    return (
      <Pressable
        testID={`new-category-language-${item.id}`}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        onPress={select}
        style={optionStyle}
      >
        <Text style={editCategoryStyles.label}>{item.language_name}</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={editCategoryStyles.screen} edges={["top", "right", "left"]}>
      <KeyboardAvoidingView style={editCategoryStyles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={editCategoryStyles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeaderCustomer title="Neue Kategorie" fallbackHref="/my-quiz/all-categories" style={editCategoryStyles.header} />
          <View style={editCategoryStyles.card}>
            <Text style={editCategoryStyles.title} accessibilityRole="header">Neue Kategorie hinzufügen</Text>
            <Text style={editCategoryStyles.description}>Erstelle eine individuelle Lernliste und ordne sie einer Sprache zu.</Text>
            {!!error && <Text style={editCategoryStyles.error} accessibilityRole="alert">{error}</Text>}
            <View style={editCategoryStyles.field}>
              <Text style={editCategoryStyles.label}>Sprache *</Text>
              <Pressable testID="new-category-language" accessibilityRole="button" accessibilityLabel="Sprache auswählen" disabled={submitting} onPress={openLanguages} style={languageInputStyle}>
                <Text style={editCategoryStyles.label}>{selectedLanguage?.language_name || "Wähle Sprache"} ▾</Text>
              </Pressable>
            </View>
            <View style={editCategoryStyles.field}>
              <Text style={editCategoryStyles.label}>Kategoriename *</Text>
              <TextInput testID="new-category-name" accessibilityLabel="Kategoriename" value={name} onChangeText={setName} editable={!submitting} style={editCategoryStyles.input} placeholder="z. B. Geschäftsreisen" returnKeyType="done" onSubmitEditing={save} />
              <Text style={editCategoryStyles.description}>Verwende mindestens drei Zeichen.</Text>
            </View>
            <View style={editCategoryStyles.actions}>
              <Pressable testID="save-new-category" accessibilityRole="button" accessibilityState={{ disabled: !canSave || submitting, busy: submitting }} disabled={!canSave || submitting} onPress={save} style={saveStyle}>
                <Text style={[styles.buttonText, (!canSave || submitting) && styles.buttonTextDisabled]}>{submitting ? "Wird gespeichert …" : "Speichern"}</Text>
              </Pressable>
              <Pressable testID="cancel-new-category" accessibilityRole="button" disabled={submitting} onPress={cancel} style={secondaryStyle}>
                <Text style={[styles.buttonText, styles.secondaryText]}>Abbrechen</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={dialogOpen} transparent animationType="fade" onRequestClose={closeLanguages}>
        <View style={editCategoryStyles.backdrop}>
          <View style={editCategoryStyles.dialog} accessibilityViewIsModal>
            <Text style={editCategoryStyles.title} accessibilityRole="header">Sprache auswählen</Text>
            <FlatList
              data={userLanguages}
              extraData={languageId}
              keyExtractor={languageKey}
              renderItem={renderLanguage}
              ListEmptyComponent={<Text style={editCategoryStyles.description}>Keine Lernsprachen vorhanden.</Text>}
            />
            <Pressable testID="close-new-category-languages" accessibilityRole="button" onPress={closeLanguages} style={secondaryStyle}>
              <Text style={[styles.buttonText, styles.secondaryText]}>Abbrechen</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
