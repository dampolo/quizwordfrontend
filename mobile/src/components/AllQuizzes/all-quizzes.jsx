import { useCallback, useEffect, useRef } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import PreLoader from "../PreLoader/pre-loader";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { allWordsStyles } from "../AllWords/all-words.styles";
import { allQuizzesStyles } from "./all-quizzes.styles";
import { styles } from "../../styles/styles";

const allLanguages = { id: "all", language_name: "All" };
const quizActions = [
  "Lernen", "Test schreiben", "Vorschau", "Karteikarten",
  "Lernen und hören", "Hören", "Karteikarten rückwärts",
  "Lernen und hören rückwärts",
];


function languageKey(item) {
  return String(item.id);
}


function quizKey(item) {
  return String(item.quiz_id);
}


function actionKey(item) {
  return item;
}


// Enable each action when its mobile screen or dialog is implemented.
function renderAction({ item }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      disabled
      style={[styles.button, styles.buttonDisabled, allQuizzesStyles.action]}
    >
      <Text style={[styles.buttonText, styles.buttonTextDisabled]}>{item}</Text>
    </Pressable>
  );
}


function renderQuiz({ item }) {
  const createdAt = new Date(item.created_at);
  const date = Number.isNaN(createdAt.getTime()) ? "–" : createdAt.toLocaleDateString("de-DE");

  return (
    <View style={allQuizzesStyles.card} testID={`quiz-${item.quiz_id}`}>
      <View style={allQuizzesStyles.cardHeader}>
        <Text style={allQuizzesStyles.cardTitle} accessibilityRole="header">{item.quiz_name}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quiz bearbeiten"
          accessibilityState={{ disabled: true }}
          disabled
          style={[styles.button, styles.buttonDisabled]}
        >
          <Text style={[styles.buttonText, styles.buttonTextDisabled]}>Bearbeiten</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={quizActions}
        keyExtractor={actionKey}
        renderItem={renderAction}
        contentContainerStyle={allQuizzesStyles.actions}
      />
      <View style={allQuizzesStyles.cardFooter}>
        <Text style={allQuizzesStyles.metadata}>{item.concepts_count} Wörter</Text>
        <Text style={allQuizzesStyles.metadata}>Erstellt: {date}</Text>
      </View>
    </View>
  );
}


function QuizFooter() {
  return (
    <View style={allQuizzesStyles.footer}>
      <View style={allQuizzesStyles.card}>
        <Text style={allQuizzesStyles.cardTitle} accessibilityRole="header">Zufällige Karteikarten</Text>
        <Text style={allQuizzesStyles.metadata}>Starte die Karteikarten eines zufälligen Quizzes.</Text>
        <Pressable accessibilityRole="button" disabled accessibilityState={{ disabled: true }} style={[styles.button, styles.buttonDisabled]}>
          <Text style={[styles.buttonText, styles.buttonTextDisabled]}>Start</Text>
        </Pressable>
      </View>
      <View style={allQuizzesStyles.card}>
        <Text style={allQuizzesStyles.cardTitle} accessibilityRole="header">Letztes Quiz</Text>
        <Text style={allQuizzesStyles.metadata}>Setze deinen Lernfortschritt fort.</Text>
        <Pressable accessibilityRole="button" disabled accessibilityState={{ disabled: true }} style={[styles.button, styles.buttonDisabled]}>
          <Text style={[styles.buttonText, styles.buttonTextDisabled]}>Fortsetzen</Text>
        </Pressable>
      </View>
    </View>
  );
}


export default function AllQuizzes() {
  const { language } = useLocalSearchParams();
  const activeLanguage = (Array.isArray(language) ? language[0] : language) || null;
  const { userLanguages } = useVocabulary();
  const { quizzes, loading, getQuizzes, getFiltredQuizzes } = useQuiz();
  const actions = useRef({ getQuizzes, getFiltredQuizzes });

  useEffect(() => {
    actions.current = { getQuizzes, getFiltredQuizzes };
  }, [getQuizzes, getFiltredQuizzes]);

  useFocusEffect(useCallback(() => {
    if (activeLanguage) void actions.current.getFiltredQuizzes(activeLanguage);
    else void actions.current.getQuizzes();
  }, [activeLanguage]));


  function renderLanguage({ item }) {
    const selected = item.id === "all"
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
        <Text style={[allWordsStyles.languageText, selected && allWordsStyles.languageTextActive]}>
          {item.language_name}
        </Text>
      </Pressable>
    );
  }


  return (
    <SafeAreaView style={allQuizzesStyles.screen} edges={["top", "right", "left"]}>
      <FlatList
        data={loading ? [] : quizzes}
        keyExtractor={quizKey}
        renderItem={renderQuiz}
        contentContainerStyle={allQuizzesStyles.content}
        ListHeaderComponent={
          <View>
            <ScreenHeaderCustomer title="Quizze" style={allWordsStyles.screenHeader} />
            <View style={allWordsStyles.vocabularyHeader}>
              <Text style={allWordsStyles.title} accessibilityRole="header">Aktive Quizze</Text>
              <Text style={allWordsStyles.description}>
                Setze deinen Lernfortschritt fort. Teste dein Wissen mit kürzlich hinzugefügten Vokabeln oder konzentriere dich auf deine Schwachstellen.
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
        ListEmptyComponent={loading ? <PreLoader /> : <Text style={allWordsStyles.message}>Du hast hier kein Quiz erstellt.</Text>}
        ListFooterComponent={QuizFooter}
      />
    </SafeAreaView>
  );
}
