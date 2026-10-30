import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import EditIcon from "../../../assets/icons/edit.svg";
import TrashIcon from "../../../assets/icons/trash.svg";
import { allQuizWordsStyles } from "./all-quiz-words.styles";
import CloseIcon from "../../../assets/icons/xbox.svg";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import PreLoader from "../PreLoader/pre-loader";

function editStyle({ pressed }) {
  return [
    allQuizWordsStyles.actionsColumn,
    allQuizWordsStyles.editButton,
    pressed && allQuizWordsStyles.pressed,
  ];
}

export default function AllQuizWords() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const language = Array.isArray(params.language)
    ? params.language[0]
    : params.language;
  const { getQuizWords, getAttemptQuizScore, getAttemptDetails, deleteQuiz } = useQuiz();
  const deletingRef = useRef(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const actions = useRef({
    getQuizWords,
    getAttemptQuizScore,
    getAttemptDetails,
  });
  const detailRequest = useRef(0);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    actions.current = { getQuizWords, getAttemptQuizScore, getAttemptDetails };
  }, [getQuizWords, getAttemptQuizScore, getAttemptDetails]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError("");
      setQuiz(null);
      setAttempts([]);

      async function loadWords() {
        try {
          if (!id) {
            throw new Error("Missing quiz id");
          }
          const [result, scores] = await Promise.all([
            actions.current.getQuizWords(id),
            actions.current.getAttemptQuizScore(id),
          ]);
          if (active) {
            setQuiz(result);
            setAttempts(
              Array.isArray(scores) ? scores : (scores?.results ?? []),
            );
          }
        } catch {
          if (active) {
            const message =
              "Die Quizwörter konnten nicht geladen werden. Bitte versuche es erneut.";
            setError(message);
            Alert.alert("Quizwörter", message);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadWords();
      return () => {
        active = false;
        detailRequest.current += 1;
        setDetailsVisible(false);
      };
      // The attempt counter deliberately reloads the same quiz after a failed request.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, attempt]),
  );

  function retry() {
    setAttempt((previous) => previous + 1);
  }


  function handleDelete() {
    setDeleteError("");
    setDeleteVisible(true);
  }


  function closeDelete() {
    if (!deletingRef.current) {
      setDeleteVisible(false);
    }
  }


  async function deleteCurrentQuiz() {
    if (!id || deletingRef.current) {
      return;
    }
    deletingRef.current = true;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteQuiz(id);
      setDeleteVisible(false);
      router.replace({
        pathname: "/my-quiz/(all-quizzes)/all-quizzes",
        params: { language: quiz?.target_language ?? language ?? "" },
      });
    } catch {
      const message = "Das Quiz konnte nicht gelöscht werden. Bitte versuche es erneut.";
      setDeleteError(message);
      Alert.alert("Quiz löschen", message);
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  }


  function closeDetails() {
    detailRequest.current += 1;
    setDetailsVisible(false);
  }

  async function openAttemptDetails(attemptId) {
    const request = ++detailRequest.current;
    setSelectedAttemptId(attemptId);
    setSelectedAttempt(null);
    setDetailsVisible(true);
    setDetailsLoading(true);
    setDetailsError("");
    try {
      const result = await actions.current.getAttemptDetails(attemptId);
      if (request === detailRequest.current) {
        setSelectedAttempt(result);
      }
    } catch {
      if (request === detailRequest.current) {
        const message = "Die Einzelheiten konnten nicht geladen werden.";
        setDetailsError(message);
        Alert.alert("Quizversuch", message);
      }
    } finally {
      if (request === detailRequest.current) {
        setDetailsLoading(false);
      }
    }
  }

  function renderAnswer(answer) {
    return (
      <View
        key={answer.id}
        style={[
          allQuizWordsStyles.resultRow,
          !answer.is_correct && allQuizWordsStyles.resultWrongRow,
        ]}
      >
        <View
          accessibilityLabel={answer.is_correct ? "Richtig" : "Falsch"}
          style={[
            allQuizWordsStyles.resultStatus,
            answer.is_correct
              ? allQuizWordsStyles.resultStatusCorrect
              : allQuizWordsStyles.resultStatusIncorrect,
          ]}
        >
          <Text style={allQuizWordsStyles.resultStatusSymbol}>
            {answer.is_correct ? "✓" : "✕"}
          </Text>
        </View>
        <View style={allQuizWordsStyles.resultColumn}>
          <Text style={allQuizWordsStyles.resultLabel}>Wort</Text>
          <Text style={allQuizWordsStyles.resultWord}>
            {answer.correct_answer}
          </Text>
        </View>
        <View style={allQuizWordsStyles.resultColumn}>
          <Text style={allQuizWordsStyles.resultLabel}>Antwort</Text>
          <Text
            style={[
              allQuizWordsStyles.resultAnswer,
              !answer.is_correct && allQuizWordsStyles.resultIncorrect,
            ]}
          >
            {answer.user_answer}
          </Text>
        </View>
        <View style={allQuizWordsStyles.resultColumn}>
          <Text style={allQuizWordsStyles.resultLabel}>Richtig</Text>
          <Text
            style={[
              allQuizWordsStyles.resultAnswer,
              allQuizWordsStyles.resultCorrect,
            ]}
          >
            {answer.correct_answer}
          </Text>
        </View>
      </View>
    );
  }

  function renderWord(concept) {
    const translations = concept.translations ?? [];
    const targetLanguage = quiz?.target_language ?? language;
    const target =
      translations.find(
        (translation) =>
          String(translation.language) === String(targetLanguage),
      ) ?? translations[1];
    const source =
      translations.find((translation) => translation !== target) ??
      translations[0];

    function editWord() {
      if (!target) {
        return;
      }
      router.push({
        pathname: "/my-quiz/(all-words)/edit-word",
        params: {
          id: String(concept.id),
          targetWord: String(target.id),
          language: String(target.language),
        },
      });
    }

    return (
      <View
        key={concept.id}
        testID={`quiz-word-${concept.id}`}
        style={allQuizWordsStyles.listRow}
      >
        <Text
          style={[allQuizWordsStyles.rankText, allQuizWordsStyles.rankColumn]}
        >
          #{target?.rank ?? "—"}
        </Text>
        <View style={allQuizWordsStyles.wordColumn}>
          <Text style={allQuizWordsStyles.translation}>
            <Text style={allQuizWordsStyles.sourceWord}>
              {source?.word ?? "—"}
            </Text>
            <Text style={allQuizWordsStyles.translationArrow}> » </Text>
            {target?.word ?? "—"}
          </Text>
        </View>
        <Pressable
          testID={`edit-quiz-word-${concept.id}`}
          accessibilityRole="button"
          accessibilityLabel="Wort bearbeiten"
          disabled={!target}
          onPress={editWord}
          style={editStyle}
        >
          <EditIcon width={19} height={19} accessible={false} />
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={allQuizWordsStyles.screen}
      edges={["top", "left", "right"]}
    >
      <ScrollView contentContainerStyle={allQuizWordsStyles.content}>
        <ScreenHeaderCustomer
          style={allQuizWordsStyles.screenHeader}
          title={quiz?.quiz_name ? `Quiz: ${quiz.quiz_name}` : "Quizwörter"}
          fallbackHref={{
            pathname: "/my-quiz/(all-quizzes)/all-quizzes",
            params: { language: quiz?.target_language ?? language ?? "" },
          }}
        />
        <View style={allQuizWordsStyles.listHead}>
          <Text
            style={[allQuizWordsStyles.heading, allQuizWordsStyles.rankColumn]}
          >
            Rang
          </Text>
          <Text
            style={[allQuizWordsStyles.heading, allQuizWordsStyles.wordColumn]}
          >
            Wort & Übersetzung
          </Text>
          <Text
            style={[
              allQuizWordsStyles.heading,
              allQuizWordsStyles.actionsColumn,
            ]}
          >
            Aktionen
          </Text>
        </View>
        {loading ? (
          <View
            style={[allQuizWordsStyles.listRow, allQuizWordsStyles.loadingRow]}
          >
            <PreLoader />
          </View>
        ) : error ? (
          <View>
            <Text accessibilityRole="alert" style={allQuizWordsStyles.message}>
              {error}
            </Text>
            <Pressable
              testID="retry-quiz-words"
              accessibilityRole="button"
              onPress={retry}
              style={allQuizWordsStyles.button}
            >
              <Text style={allQuizWordsStyles.buttonText}>
                Erneut versuchen
              </Text>
            </Pressable>
          </View>
        ) : quiz?.concepts?.length ? (
          quiz.concepts.map(renderWord)
        ) : (
          <Text style={allQuizWordsStyles.message}>
            Dieses Quiz enthält keine Wörter.
          </Text>
        )}
        {!loading && !error && (
          <View style={allQuizWordsStyles.section}>
            <Text style={allQuizWordsStyles.title} accessibilityRole="header">
              Quizversuche
            </Text>
            <View>
              <View style={allQuizWordsStyles.detailsHeader}>
                <Text
                  style={[
                    allQuizWordsStyles.heading,
                    allQuizWordsStyles.wordColumn,
                  ]}
                >
                  Punktzahl
                </Text>
                <Text
                  style={[
                    allQuizWordsStyles.heading,
                    allQuizWordsStyles.wordColumn,
                  ]}
                >
                  Richtung
                </Text>
                <Text
                  style={[
                    allQuizWordsStyles.heading,
                    allQuizWordsStyles.wordColumn,
                  ]}
                >
                  Datum
                </Text>
                <Text
                  style={[
                    allQuizWordsStyles.heading,
                    allQuizWordsStyles.wordColumn,
                  ]}
                >
                  Einzelheiten
                </Text>
              </View>
              {attempts.length ? (
                attempts.map((score) => (
                  <View key={score.id} style={allQuizWordsStyles.detailsRow}>
                    <Text
                      style={[
                        allQuizWordsStyles.rankText,
                        allQuizWordsStyles.wordColumn,
                      ]}
                    >
                      #{score.score}
                    </Text>
                    <Text
                      style={[
                        allQuizWordsStyles.translation,
                        allQuizWordsStyles.wordColumn,
                      ]}
                    >
                      {score.direction}
                    </Text>
                    <Text
                      style={[
                        allQuizWordsStyles.description,
                        allQuizWordsStyles.wordColumn,
                      ]}
                    >
                      {new Date(score.finished_at).toLocaleDateString("de-DE")}
                    </Text>
                    <Pressable
                      testID={`attempt-details-${score.id}`}
                      accessibilityRole="button"
                      accessibilityLabel="Einzelheiten anzeigen"
                      onPress={() => openAttemptDetails(score.id)}
                      style={allQuizWordsStyles.detailsAction}
                    >
                      <Text>🔍</Text>
                    </Pressable>
                  </View>
                ))
              ) : (
                <Text style={allQuizWordsStyles.message}>
                  Du hast bis jetzt keine Quizversuche gemacht.
                </Text>
              )}
            </View>
          </View>
        )}
        {!loading && !error && quiz && (
          <Pressable
            testID="delete-quiz"
            accessibilityRole="button"
            accessibilityLabel="Quiz löschen"
            onPress={handleDelete}
            disabled={deleting}
            style={({ pressed }) => [allQuizWordsStyles.deleteButton, pressed && allQuizWordsStyles.pressed]}
          >
            <TrashIcon width={24} height={24} accessible={false} />
          </Pressable>
        )}
      </ScrollView>
      <Modal visible={deleteVisible} transparent animationType="fade" onRequestClose={closeDelete}>
        <SafeAreaView style={allQuizWordsStyles.detailsBackdrop}>
          <View style={allQuizWordsStyles.detailsDialog} accessibilityViewIsModal>
            <View style={allQuizWordsStyles.detailsHeader}>
              <Text style={allQuizWordsStyles.detailsTitle} accessibilityRole="header">Quiz löschen?</Text>
            </View>
            <View style={allQuizWordsStyles.detailsMessage}>
              <Text style={allQuizWordsStyles.description}>
                Quiz „{quiz?.quiz_name}“ löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </Text>
              {!!deleteError && <Text accessibilityRole="alert" style={allQuizWordsStyles.description}>{deleteError}</Text>}
              <View style={allQuizWordsStyles.deleteActions}>
                <Pressable testID="cancel-delete-quiz" accessibilityRole="button" accessibilityState={{ disabled: deleting }} disabled={deleting} onPress={closeDelete} style={({ pressed }) => [allQuizWordsStyles.cancelDeleteButton, pressed && !deleting && allQuizWordsStyles.pressed, deleting && allQuizWordsStyles.deleteButtonDisabled]}>
                  <Text style={[allQuizWordsStyles.cancelDeleteText, deleting && allQuizWordsStyles.deleteButtonTextDisabled]}>Abbrechen</Text>
                </Pressable>
                <Pressable testID="confirm-delete-quiz" accessibilityRole="button" accessibilityState={{ disabled: deleting, busy: deleting }} disabled={deleting} onPress={deleteCurrentQuiz} style={({ pressed }) => [allQuizWordsStyles.button, pressed && !deleting && allQuizWordsStyles.pressed, deleting && allQuizWordsStyles.deleteButtonDisabled]}>
                  <Text style={[allQuizWordsStyles.buttonText, deleting && allQuizWordsStyles.deleteButtonTextDisabled]}>{deleting ? "Wird gelöscht…" : "Löschen"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDetails}
      >
        <SafeAreaView style={allQuizWordsStyles.detailsBackdrop}>
          <View
            style={allQuizWordsStyles.detailsDialog}
            accessibilityViewIsModal
          >
            <View style={allQuizWordsStyles.detailsHeader}>
              <Text
                style={allQuizWordsStyles.detailsTitle}
                accessibilityRole="header"
              >
                Vokabeldetails
              </Text>
              <Pressable
                testID="close-attempt-details"
                accessibilityRole="button"
                accessibilityLabel="Einzelheiten schließen"
                onPress={closeDetails}
                style={allQuizWordsStyles.closeButton}
              >
                <CloseIcon width={25} height={25} accessible={false} />
              </Pressable>
            </View>
            <ScrollView
              style={allQuizWordsStyles.detailsList}
              contentContainerStyle={allQuizWordsStyles.detailsMessage}
            >
              {detailsLoading ? (
                <PreLoader />
              ) : detailsError ? (
                <View>
                  <Text
                    accessibilityRole="alert"
                    style={allQuizWordsStyles.message}
                  >
                    {detailsError}
                  </Text>
                  <Pressable
                    testID="retry-attempt-details"
                    accessibilityRole="button"
                    onPress={() => openAttemptDetails(selectedAttemptId)}
                    style={allQuizWordsStyles.button}
                  >
                    <Text style={allQuizWordsStyles.buttonText}>
                      Erneut versuchen
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View>
                  {selectedAttempt?.started_at && (
                    <Text style={allQuizWordsStyles.description}>
                      {new Date(selectedAttempt.started_at).toLocaleString(
                        "de-DE",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </Text>
                  )}
                  <Text style={allQuizWordsStyles.message}>
                    {selectedAttempt?.answers?.length ?? 0} Wörter insgesamt
                  </Text>
                  {selectedAttempt?.answers?.length ? (
                    selectedAttempt.answers.map(renderAnswer)
                  ) : (
                    <Text style={allQuizWordsStyles.message}>
                      Für diesen Versuch sind keine Antworten vorhanden.
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
