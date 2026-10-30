import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import EditIcon from "../../../assets/icons/edit.svg";
import PreLoader from "../PreLoader/pre-loader";
import CloseIcon from "../../../assets/icons/xbox.svg";
import { previewQuizStyles } from "./preview-quiz.styles";
import { styles } from "../../styles/styles";

function conceptKey(concept) {
  return String(concept.id);
}

export default function PreviewQuiz({ quizId, onClose }) {
  const { getQuizWords } = useQuiz();
  const loadQuiz = useRef(getQuizWords);
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    loadQuiz.current = getQuizWords;
  }, [getQuizWords]);

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      try {
        const quiz = await loadQuiz.current(quizId);
        if (active) {
          setConcepts(quiz?.concepts ?? []);
        }
      } catch {
        if (active) {
          setError("Die Quizvorschau konnte nicht geladen werden.");
          Alert.alert(
            "Vorschau",
            "Die Quizvorschau konnte nicht geladen werden.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPreview();
    return () => {
      active = false;
    };
  }, [quizId, attempt]);

  function closeStyle({ pressed }) {
    return [previewQuizStyles.closeButton, pressed && styles.pressed];
  }

  function retry() {
    setError("");
    setLoading(true);
    setAttempt((previous) => previous + 1);
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={previewQuizStyles.backdrop}>
        <View
          style={previewQuizStyles.dialog}
          accessibilityViewIsModal
          testID="preview-quiz"
        >
          <View style={previewQuizStyles.header}>
            <Text style={previewQuizStyles.title} accessibilityRole="header">
              Wort & Übersetzung
            </Text>
            <Pressable
              testID="close-preview-quiz"
              accessibilityRole="button"
              accessibilityLabel="Vorschau schließen"
              onPress={onClose}
              style={closeStyle}
            >
             <CloseIcon width={25} height={25} accessible={false} />
            </Pressable>
          </View>
          {loading ? (
            <PreLoader />
          ) : error ? (
            <View style={previewQuizStyles.message}>
              <Text
                accessibilityRole="alert"
                style={previewQuizStyles.translation}
              >
                {error}
              </Text>
              <Pressable
                testID="retry-preview-quiz"
                onPress={retry}
                accessibilityRole="button"
                style={styles.button}
              >
                <Text style={styles.buttonText}>Erneut versuchen</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={concepts}
              keyExtractor={conceptKey}
              renderItem={({ item }) => {
                const source = item.translations?.[0];
                const target = item.translations?.[1];

                function editWord() {
                  onClose();
                  router.push({
                    pathname: "/my-quiz/edit-word",
                    params: {
                      id: String(item.id),
                      targetWord: String(target.id),
                      language: String(target.language),
                    },
                  });
                }

                return (
                  <View style={previewQuizStyles.row}>
                    <View style={previewQuizStyles.words}>
                      <Text style={previewQuizStyles.source}>{source?.word ?? "—"}</Text>
                      <Text style={previewQuizStyles.translation}>
                        » {target?.word ?? "—"}
                      </Text>
                    </View>
                    <Pressable
                      testID={`preview-edit-word-${item.id}`}
                      accessibilityRole="button"
                      accessibilityLabel="Wort bearbeiten"
                      disabled={!target}
                      onPress={editWord}
                      style={({ pressed }) => [
                        previewQuizStyles.action,
                        pressed && styles.pressed,
                      ]}
                    >
                      <EditIcon width={22} height={22} accessible={false} />
                    </Pressable>
                  </View>
                );
              }}
              style={previewQuizStyles.list}
              ListEmptyComponent={
                <Text style={previewQuizStyles.message}>
                  Dieses Quiz enthält keine Wörter.
                </Text>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
