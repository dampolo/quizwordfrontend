import { Pressable, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../../styles/styles";
import { createQuizModalStyles } from "./create-quiz-modal.styles";


export default function CreateQuizModal({
  visible,
  quizName,
  selectedWordsCount,
  submitting,
  onQuizNameChange,
  onSubmit,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!submitting) onClose();
      }}
    >
      <KeyboardAvoidingView
        style={createQuizModalStyles.dialogBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={createQuizModalStyles.dialogScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={createQuizModalStyles.dialog}
            accessibilityViewIsModal
          >
            <Text
              style={createQuizModalStyles.title}
              accessibilityRole="header"
            >
              Erstelle dein Quiz
            </Text>
            <Text style={createQuizModalStyles.description}>
              {selectedWordsCount} Wörter ausgewählt
            </Text>
            <TextInput
              style={createQuizModalStyles.input}
              accessibilityLabel="Quizname"
              placeholder="Quizname (mindestens 3 Zeichen)"
              testID="quiz-name"
              value={quizName}
              onChangeText={onQuizNameChange}
              editable={!submitting}
            />
            <View style={createQuizModalStyles.dialogActions}>
              <Pressable
                testID="cancel-create-quiz"
                accessibilityRole="button"
                accessibilityState={{ disabled: submitting }}
                onPress={onClose}
                disabled={submitting}
                style={({ pressed }) => [
                  createQuizModalStyles.dialogButton,
                  createQuizModalStyles.dialogCancelButton,
                  pressed && styles.pressed,
                  submitting && styles.buttonDisabled,
                ]}
              >
                <Text style={[
                  createQuizModalStyles.dialogButtonText,
                  createQuizModalStyles.dialogCancelText,
                  submitting && styles.buttonTextDisabled,
                ]}>Abbrechen</Text>
              </Pressable>
              <Pressable
                testID="save-create-quiz"
                accessibilityRole="button"
                accessibilityState={{ disabled: submitting || quizName.trim().length < 3 }}
                onPress={onSubmit}
                disabled={submitting || quizName.trim().length < 3}
                style={({ pressed }) => [
                  createQuizModalStyles.dialogButton,
                  createQuizModalStyles.dialogSaveButton,
                  pressed && styles.pressed,
                  (submitting || quizName.trim().length < 3) && styles.buttonDisabled,
                ]}
              >
                <Text style={[
                  createQuizModalStyles.dialogButtonText,
                  createQuizModalStyles.dialogSaveText,
                  (submitting || quizName.trim().length < 3) && styles.buttonTextDisabled,
                ]}>{submitting ? "Wird gespeichert …" : "Speichern"}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
