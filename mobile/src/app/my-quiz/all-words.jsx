import CreateQuizModal from "../../components/CreateQuizModal/create-quiz-modal";
import PreLoader from "../../components/PreLoader/pre-loader";
import Search from "../../components/Search/search";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import { useRef, useState } from "react";
import { Alert, Button, FlatList, Pressable, Text, View } from "react-native";
import { Checkbox } from "expo-checkbox";
import EditIcon from "../../../assets/icons/edit.svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import { useAuth } from "../../context/auth/useAuth";
import { allWordsStyles } from "../../styles/all-words";
import { styles } from "../../styles/styles";
import { colors } from "../../styles/basic";
import ScreenHeaderCustomer from "../../components/ScreenHeaderCustomer/ScreenHeaderCustomer";

export default function AllWords() {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const { language } = useLocalSearchParams();
  const {
    userLanguages,
    loading,
    words,
    getFiltredConcepts,
    getConcepts,
    nextPage,
    previousPage,
  } = useVocabulary();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const activeLanguage = Array.isArray(language) ? language[0] : language;

  const { createQuiz } = useQuiz();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  function handleCheckboxChange(id, checked) {
    setSelectedWordIds((previous) =>
      checked
        ? [...previous.filter((value) => value !== id), id]
        : previous.filter((value) => value !== id),
    );
  }

  function selectLanguage(id) {
    setCurrentPage(1);
    setSelectedWordIds([]);
    router.setParams({ language: String(id) });
    void getFiltredConcepts(id);
  }

  function changePage(page) {
    if (loading || page < 1) return;
    setCurrentPage(page);
    if (activeLanguage) {
      void getFiltredConcepts(activeLanguage, page);
    } else {
      void getConcepts(page);
    }
  }

  async function handleCreateQuiz() {
    if (
      submittingRef.current ||
      quizName.trim().length < 3 ||
      selectedWordIds.length < 3
    )
      return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await createQuiz({
        quiz_name: quizName.trim(),
        concepts: selectedWordIds,
        target_language: activeLanguage,
      });
      setDialogOpen(false);
      setQuizName("");
      setSelectedWordIds([]);
      Alert.alert("Quiz erstellt", "Dein Quiz wurde erstellt.");
    } catch (error) {
      Alert.alert(
        "Quiz konnte nicht erstellt werden",
        error.response?.detail || "Bitte versuche es erneut.",
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  function getSubmitStyle({ pressed }) {
    return [styles.button, pressed && styles.pressed];
  }

  function getSubmitStyleQuiz({ pressed }) {
    return [
      styles.button,
      pressed && selectedWordIds.length >= 3 && styles.pressed,
      selectedWordIds.length < 3 && styles.buttonDisabled,
    ];
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      router.replace("/quiz/(auth)/login-quiz");
    } catch {
      Alert.alert("Logout failed", "Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView
      style={allWordsStyles.screen}
      edges={["top", "right", "left"]}
    >
      <FlatList
        contentContainerStyle={allWordsStyles.content}
        keyboardShouldPersistTaps="handled"
        data={loading ? [] : (words?.results ?? [])}
        keyExtractor={(word) => String(word.id)}
        extraData={selectedWordIds}
        ListHeaderComponent={
          <View>
            <ScreenHeaderCustomer
              title="Wörter"
              style={allWordsStyles.screenHeader}
            />
            <View style={allWordsStyles.vocabularyHeader}>
              <Text style={allWordsStyles.title} accessibilityRole="header">
                Deine Vokabeln
              </Text>
              <Text style={allWordsStyles.description}>
                Organisiere und verfolge deinen Lernfortschritt. Verwalte
                Übersetzungen, Kategorien und Wiederholungspläne für alle deine
                gespeicherten Ausdrücke.
              </Text>
              <Search />
              <View style={allWordsStyles.createButtons}>
                <Pressable
                  testID="create-quiz"
                  accessibilityRole="button"
                  accessibilityHint="Wähle mindestens drei Wörter aus"
                  accessibilityState={{ disabled: selectedWordIds.length < 3 }}
                  disabled={selectedWordIds.length < 3}
                  onPress={() => setDialogOpen(true)}
                  style={getSubmitStyleQuiz}
                >
                  <Text
                    style={[
                      allWordsStyles.createButtonText,
                      selectedWordIds.length < 3 && styles.buttonTextDisabled,
                    ]}
                  >
                    + Quiz
                  </Text>
                </Pressable>
                <Pressable
                  style={getSubmitStyle}
                  testID="add-word"
                  onPress={() => router.navigate("/my-quiz/add-new-word")}
                >
                  <Text style={styles.buttonText}>+ Wort</Text>
                </Pressable>
              </View>
            </View>

            <View style={allWordsStyles.languages} accessibilityRole="tablist">
              {userLanguages.map((lang) => {
                const selected = String(lang.id) === activeLanguage;
                return (
                  <Pressable
                    key={lang.id}
                    testID={`language-${lang.id}`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => selectLanguage(lang.id)}
                    style={({ pressed }) => [
                      allWordsStyles.language,
                      selected && allWordsStyles.languageActive,
                      pressed && allWordsStyles.languagePressed,
                    ]}
                  >
                    <Text
                      style={[
                        allWordsStyles.languageText,
                        selected && allWordsStyles.languageTextActive,
                      ]}
                    >
                      {lang.language_name}
                    </Text>
                  </Pressable>
                );
              })}
              {!loading && userLanguages.length === 0 && (
                <Text style={allWordsStyles.message}>
                  Noch keine Lernsprachen vorhanden.
                </Text>
              )}
            </View>

            <View style={allWordsStyles.listHead}>
              <Text
                style={[allWordsStyles.heading, allWordsStyles.checkColumn]}
              >
                +
              </Text>
              <Text style={[allWordsStyles.heading, allWordsStyles.rankColumn]}>
                Rang
              </Text>
              <Text style={[allWordsStyles.heading, allWordsStyles.wordColumn]}>
                Wort & Übersetzung
              </Text>
              <Text
                style={[allWordsStyles.actionsColumn, allWordsStyles.heading]}
              >
                Aktionen
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={[allWordsStyles.listRow, allWordsStyles.loadingRow]}>
              <PreLoader />
            </View>
          ) : (
            <Text style={allWordsStyles.message}>
              Du hast hier keine Wörter.
            </Text>
          )
        }
        renderItem={({ item: word }) => {
          return (
            <View style={allWordsStyles.listRow} testID={`word-${word.id}`}>
              <View style={allWordsStyles.checkColumn}>
                <Checkbox
                  style={allWordsStyles.checkbox}
                  testID={`word-checkbox-${word.id}`}
                  accessibilityLabel={`${word.translations[0].word} auswählen`}
                  value={selectedWordIds.includes(word.id)}
                  onValueChange={(checked) =>
                    handleCheckboxChange(word.id, checked)
                  }
                  color={
                    selectedWordIds.includes(word.id)
                      ? colors.qwPrimary
                      : "#8b929b"
                  }
                  hitSlop={12}
                />
              </View>
              <Text
                style={[allWordsStyles.rankText, allWordsStyles.rankColumn]}
              >
                #{word.translations[1].rank}
              </Text>
              <View style={allWordsStyles.wordColumn}>
                <Text style={allWordsStyles.translation}>
                  <Text style={allWordsStyles.sourceWord}>
                    {word.translations[0].word}
                  </Text>
                  <Text style={allWordsStyles.translationArrow}> » </Text>
                  {word.translations[1].word}
                </Text>
              </View>
              <Pressable
                style={allWordsStyles.actionsColumn}
                disabled
                accessibilityRole="button"
                accessibilityLabel="Wort bearbeiten (bald verfügbar)"
                accessibilityState={{ disabled: true }}
              >
                <EditIcon width={19} height={19} accessible={false} />
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          <View>
            <View style={allWordsStyles.pagination}>
              <Text style={allWordsStyles.paginationCount}>
                {words?.count ?? 0} Wörter
              </Text>
              <View style={allWordsStyles.pages}>
                <Pressable
                  testID="previous-page"
                  accessibilityRole="button"
                  accessibilityLabel="Vorherige Seite"
                  accessibilityState={{ disabled: loading || !previousPage }}
                  disabled={loading || !previousPage}
                  onPress={() => changePage(currentPage - 1)}
                  style={[
                    allWordsStyles.paginationButton,
                    (loading || !previousPage) && styles.buttonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      allWordsStyles.paginationButtonText,
                      (loading || !previousPage) && styles.buttonTextDisabled,
                    ]}
                  >
                    {"<"}
                  </Text>
                </Pressable>
                <Text
                  style={allWordsStyles.pageNumber}
                  accessibilityLabel={`Seite ${currentPage}`}
                  accessibilityLiveRegion="polite"
                >
                  {currentPage}
                </Text>
                <Pressable
                  testID="next-page"
                  accessibilityRole="button"
                  accessibilityLabel="Nächste Seite"
                  accessibilityState={{ disabled: loading || !nextPage }}
                  disabled={loading || !nextPage}
                  onPress={() => changePage(currentPage + 1)}
                  style={[
                    allWordsStyles.paginationButton,
                    (loading || !nextPage) && styles.buttonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      allWordsStyles.paginationButtonText,
                      (loading || !nextPage) && styles.buttonTextDisabled,
                    ]}
                  >
                    {">"}
                  </Text>
                </Pressable>
              </View>
            </View>
            <Button
              title={loggingOut ? "Logging out…" : "Log out"}
              onPress={handleLogout}
              disabled={loggingOut}
            />
          </View>
        }
      />
      <CreateQuizModal
        visible={dialogOpen}
        quizName={quizName}
        selectedWordsCount={selectedWordIds.length}
        submitting={submitting}
        onQuizNameChange={setQuizName}
        onSubmit={handleCreateQuiz}
        onClose={() => setDialogOpen(false)}
      />
    </SafeAreaView>
  );
}
