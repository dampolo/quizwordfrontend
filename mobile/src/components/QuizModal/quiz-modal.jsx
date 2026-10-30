import { Pressable, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../../styles/styles";
import { quizModalStyles } from "./quiz-modal.styles";


export default function QuizModal({
  visible,
  mode = "create",
  error,
  quizName,
  selectedWordsCount,
  submitting,
  onQuizNameChange,
  onSubmit,
  onClose,
}) {
  const disabled = submitting || quizName.trim().length < 3;


  function close() {
    if (!submitting) {
      onClose();
    }
  }


  function submit() {
    if (!disabled) {
      onSubmit();
    }
  }


  function cancelStyle({ pressed }) {
    return [quizModalStyles.dialogButton, quizModalStyles.dialogCancelButton, pressed && styles.pressed, submitting && styles.buttonDisabled];
  }


  function saveStyle({ pressed }) {
    return [styles.button, pressed && !disabled && styles.pressed, disabled && styles.buttonDisabled];
  }


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={quizModalStyles.dialogBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={quizModalStyles.dialogScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={quizModalStyles.dialog}
            accessibilityViewIsModal
          >
            <Text
              style={quizModalStyles.title}
              accessibilityRole="header"
            >
              {mode === "edit" ? "Quiz bearbeiten" : "Erstelle dein Quiz"}
            </Text>
            <Text style={quizModalStyles.description}>
              {mode === "edit" ? "Du kannst den Namen des Quizzes ändern." : `${selectedWordsCount} Wörter ausgewählt`}
            </Text>
            <TextInput
              style={quizModalStyles.input}
              accessibilityLabel="Quizname"
              placeholder="Quizname (mindestens 3 Zeichen)"
              testID="quiz-name"
              value={quizName}
              onChangeText={onQuizNameChange}
              editable={!submitting}
            />
            {error ? <Text style={quizModalStyles.description} accessibilityRole="alert">{error}</Text> : null}
            <View style={quizModalStyles.dialogActions}>
              <Pressable
                testID={mode === "edit" ? "cancel-edit-quiz" : "cancel-create-quiz"}
                accessibilityRole="button"
                accessibilityState={{ disabled: submitting }}
                onPress={close}
                disabled={submitting}
                style={cancelStyle}
              >
                <Text style={[
                  quizModalStyles.dialogButtonText,
                  quizModalStyles.dialogCancelText,
                  submitting && styles.buttonTextDisabled,
                ]}>Abbrechen</Text>
              </Pressable>
              <Pressable
                testID={mode === "edit" ? "save-edit-quiz" : "save-create-quiz"}
                accessibilityRole="button"
                accessibilityState={{ disabled, busy: submitting }}
                onPress={submit}
                disabled={disabled}
                style={saveStyle}
              >
                <Text style={[
                  styles.buttonText,
                  disabled && styles.buttonTextDisabled,
                ]}>{submitting ? "Wird gespeichert …" : "Speichern"}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
