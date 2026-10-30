import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Tooltip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import PreLoader from "../PreLoader/pre-loader";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { allWordsStyles } from "../AllWords/all-words.styles";
import { allQuizzesStyles } from "./all-quizzes.styles";
import { styles } from "../../styles/styles";
import { colors } from "../../styles/basic";
import { allCategoriesStyles } from "../AllCategories/all-categories.styles";
import EditIcon from "../../../assets/icons/edit.svg";
import LearnIcon from "../../../assets/icons/learn-quiz.svg";
import WriteIcon from "../../../assets/icons/write.svg";
import PreviewIcon from "../../../assets/icons/preview-quiz.svg";
import PreviewQuiz from "../PreviewQuiz/preview-quiz";
import FlipCardIcon from "../../../assets/icons/flip-card.svg";
import RepeatIcon from "../../../assets/icons/repead.svg";
import HearIcon from "../../../assets/icons/hear.svg";
import FlipCardReverseIcon from "../../../assets/icons/flip-card-reverse.svg";
import RepeatReverseIcon from "../../../assets/icons/repead-reverse.svg";

const allLanguages = { id: "all", language_name: "All" };


function languageKey(item) {
  return String(item.id);
}


function quizKey(item) {
  return String(item.quiz_id);
}


function renderQuiz({ item }) {
  return <QuizCard item={item} />;
}


function QuizCard({ item }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const createdAt = new Date(item.created_at);
  const date = Number.isNaN(createdAt.getTime())
    ? "–"
    : createdAt.toLocaleDateString("de-DE");


  function openLearnQuiz() {
    router.push({
      pathname: "/my-quiz/(all-quizzes)/learn-quiz",
      params: {
        id: String(item.quiz_id),
        language: item.target_language == null ? "" : String(item.target_language),
        redirect: "true",
      },
    });
  }


  function openPlayTestQuiz() {
    router.push({
      pathname: "/my-quiz/(all-quizzes)/play-test-quiz",
      params: {
        id: String(item.quiz_id),
        language: item.target_language == null ? "" : String(item.target_language),
        redirect: "true",
      },
    });
  }


  function openHearQuiz() {
    router.push({
      pathname: "/my-quiz/(all-quizzes)/hear-quiz",
      params: {
        id: String(item.quiz_id),
        language: item.target_language == null ? "" : String(item.target_language),
        redirect: "true",
      },
    });
  }


  function openFlipCardQuiz() {
    router.push({
      pathname: "/my-quiz/(all-quizzes)/flip-card-quiz",
      params: {
        id: String(item.quiz_id),
        language: item.target_language == null ? "" : String(item.target_language),
        redirect: "true",
      },
    });
  }


  function openReverseFlipCardQuiz() {
    router.push({
      pathname: "/my-quiz/(all-quizzes)/flip-card-quiz-reverse",
      params: {
        id: String(item.quiz_id),
        language: item.target_language == null ? "" : String(item.target_language),
        redirect: "true",
      },
    });
  }


  function openWordAudioLoop() {
    router.push({
      pathname: "/my-quiz/(all-quizzes)/word-audio-loop",
      params: {
        id: String(item.quiz_id),
        language: item.target_language == null ? "" : String(item.target_language),
        redirect: "true",
      },
    });
  }


  function openReverseWordAudioLoop() {
    router.push({
      pathname: "/my-quiz/(all-quizzes)/word-audio-loop-reverse",
      params: {
        id: String(item.quiz_id),
        language: item.target_language == null ? "" : String(item.target_language),
        redirect: "true",
      },
    });
  }


  return (
    <View style={allQuizzesStyles.card} testID={`quiz-${item.quiz_id}`}>
      <View style={allQuizzesStyles.cardHeader}>
        <Text style={allQuizzesStyles.cardTitle} accessibilityRole="header">
          {item.quiz_name}
        </Text>
        <Tooltip title="Quiz bearbeiten">
          <Pressable
            testID={`edit-quiz-${item.quiz_id}`}
            accessibilityRole="button"
            accessibilityLabel="Quiz bearbeiten"
            style={allCategoriesStyles.editButton}
          >
            <EditIcon width={20} height={20} accessible={false} />
          </Pressable>
        </Tooltip>
      </View>
      <View style={allQuizzesStyles.actions}>
        <View style={allQuizzesStyles.actionRow}>
          <Tooltip title="Lernen">
            <Pressable
              testID="quiz-action-learn"
              onPress={openLearnQuiz}
              accessibilityRole="button"
              accessibilityLabel="Lernen"
              style={allQuizzesStyles.action}
            >
              <LearnIcon
                width={40}
                height={40}
                color={colors.qwColorHeading}
                accessible={false}
              />
            </Pressable>
          </Tooltip>
          <Tooltip title="Test schreiben">
            <Pressable
              testID="quiz-action-write"
              onPress={openPlayTestQuiz}
              accessibilityRole="button"
              accessibilityLabel="Test schreiben"
              style={allQuizzesStyles.action}
            >
              <WriteIcon
                width={40}
                height={40}
                color={colors.qwColorHeading}
                accessible={false}
              />
            </Pressable>
          </Tooltip>
          <Tooltip title="Vorschau">
            <Pressable
              testID="quiz-action-preview"
              onPress={() => setPreviewOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Vorschau"
              style={allQuizzesStyles.action}
            >
              <PreviewIcon
                width={40}
                height={40}
                color={colors.qwColorHeading}
                accessible={false}
              />
            </Pressable>
          </Tooltip>
          <Tooltip title="Karteikarten">
            <Pressable
              testID="quiz-action-flip-card"
              onPress={openFlipCardQuiz}
              accessibilityRole="button"
              accessibilityLabel="Karteikarten"
              style={allQuizzesStyles.action}
            >
              <FlipCardIcon
                width={40}
                height={40}
                color={colors.qwColorHeading}
                accessible={false}
              />
            </Pressable>
          </Tooltip>
        </View>
        <View style={allQuizzesStyles.actionRow}>
          <Tooltip title="Lernen und hören">
            <Pressable
              testID="quiz-action-audio-loop"
              onPress={openWordAudioLoop}
              accessibilityRole="button"
              accessibilityLabel="Lernen und hören"
              style={allQuizzesStyles.action}
            >
              <RepeatIcon
                width={40}
                height={40}
                color={colors.qwColorHeading}
                accessible={false}
              />
            </Pressable>
          </Tooltip>
          <Tooltip title="Hören">
            <Pressable
              testID="quiz-action-hear"
                onPress={openHearQuiz}
              accessibilityRole="button"
              accessibilityLabel="Hören"
              style={allQuizzesStyles.action}
            >
              <HearIcon
                width={40}
                height={40}
                color={colors.qwColorHeading}
                accessible={false}
              />
            </Pressable>
          </Tooltip>
          <Tooltip title="Karteikarten rückwärts">
            <Pressable
              testID="quiz-action-flip-card-reverse"
              onPress={openReverseFlipCardQuiz}
              accessibilityRole="button"
              accessibilityLabel="Karteikarten rückwärts"
              style={allQuizzesStyles.action}
            >
              <FlipCardReverseIcon
                width={40}
                height={40}
                color={colors.qwColorHeading}
                accessible={false}
              />
            </Pressable>
          </Tooltip>
          <Tooltip title="Lernen und hören rückwärts">
            <Pressable
              testID="quiz-action-audio-loop-reverse"
              onPress={openReverseWordAudioLoop}
              accessibilityRole="button"
              accessibilityLabel="Lernen und hören rückwärts"
              style={allQuizzesStyles.action}
            >
              <RepeatReverseIcon
                width={40}
                height={40}
                color={colors.qwColorHeading}
                accessible={false}
              />
            </Pressable>
          </Tooltip>
        </View>
      </View>
      <View style={allQuizzesStyles.cardFooter}>
        <Text style={allQuizzesStyles.metadata}>
          {item.concepts_count} Wörter
        </Text>
        <Text style={allQuizzesStyles.metadata}>Erstellt: {date}</Text>
      </View>
      {previewOpen && (
        <PreviewQuiz quizId={item.quiz_id} onClose={() => setPreviewOpen(false)} />
      )}
    </View>
  );
}


export default function AllQuizzes() {
  const { language } = useLocalSearchParams();
  const activeLanguage =
    (Array.isArray(language) ? language[0] : language) || null;
  const { userLanguages } = useVocabulary();
  const { quizzes, loading, getQuizzes, getFiltredQuizzes } = useQuiz();
  const actions = useRef({ getQuizzes, getFiltredQuizzes });

  useEffect(() => {
    actions.current = { getQuizzes, getFiltredQuizzes };
  }, [getQuizzes, getFiltredQuizzes]);

  useFocusEffect(
    useCallback(() => {
      if (activeLanguage)
        void actions.current.getFiltredQuizzes(activeLanguage);
      else void actions.current.getQuizzes();
    }, [activeLanguage]),
  );


  function renderLanguage({ item }) {
    const selected =
      item.id === "all"
        ? activeLanguage === null
        : String(item.id) === activeLanguage;


    function selectLanguage() {
      router.setParams({ language: item.id === "all" ? "" : String(item.id) });
    }


    function filterStyle({ pressed }) {
      return [
        allWordsStyles.language,
        selected && allWordsStyles.languageActive,
        pressed && styles.pressed,
      ];
    }

    return (
      <Pressable
        testID={`quiz-language-${item.id}`}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        onPress={selectLanguage}
        style={filterStyle}
      >
        <Text
          style={[
            allWordsStyles.languageText,
            selected && allWordsStyles.languageTextActive,
          ]}
        >
          {item.language_name}
        </Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView
      style={allQuizzesStyles.screen}
      edges={["top", "right", "left"]}
    >
      <FlatList
        data={loading ? [] : quizzes}
        keyExtractor={quizKey}
        renderItem={renderQuiz}
        contentContainerStyle={allQuizzesStyles.content}
        ListHeaderComponent={
          <View>
            <ScreenHeaderCustomer
              title="Quizze"
              style={allWordsStyles.screenHeader}
            />
            <View style={allWordsStyles.vocabularyHeader}>
              <Text style={allWordsStyles.title} accessibilityRole="header">
                Aktive Quizze
              </Text>
              <Text style={allWordsStyles.description}>
                Setze deinen Lernfortschritt fort. Teste dein Wissen mit
                kürzlich hinzugefügten Vokabeln oder konzentriere dich auf deine
                Schwachstellen.
              </Text>
            </View>
            <FlatList
              horizontal
              data={[allLanguages, ...userLanguages]}
              extraData={activeLanguage}
              keyExtractor={languageKey}
              renderItem={renderLanguage}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={allQuizzesStyles.languages}
              accessibilityRole="tablist"
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <PreLoader />
          ) : (
            <Text style={allWordsStyles.message}>
              Du hast hier kein Quiz erstellt.
            </Text>
          )
        }
        ListFooterComponent={
          <View style={allQuizzesStyles.footer}>
            <View style={allQuizzesStyles.card}>
              <Text
                style={allQuizzesStyles.cardTitle}
                accessibilityRole="header"
              >
                Zufällige Karteikarten
              </Text>
              <Text style={allQuizzesStyles.metadata}>
                Starte die Karteikarten eines zufälligen Quizzes.
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled
                accessibilityState={{ disabled: true }}
                style={[styles.button, styles.buttonDisabled]}
              >
                <Text style={[styles.buttonText, styles.buttonTextDisabled]}>
                  Start
                </Text>
              </Pressable>
            </View>
            <View style={allQuizzesStyles.card}>
              <Text
                style={allQuizzesStyles.cardTitle}
                accessibilityRole="header"
              >
                Letztes Quiz
              </Text>
              <Text style={allQuizzesStyles.metadata}>
                Setze deinen Lernfortschritt fort.
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled
                accessibilityState={{ disabled: true }}
                style={[styles.button, styles.buttonDisabled]}
              >
                <Text style={[styles.buttonText, styles.buttonTextDisabled]}>
                  Fortsetzen
                </Text>
              </Pressable>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
