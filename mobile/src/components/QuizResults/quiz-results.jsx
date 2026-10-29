import { FlatList, Pressable, Text, View } from "react-native";
import { styles } from "../../styles/styles";
import { quizResultsStyles } from "./quiz-results.styles";


function buttonStyle({ pressed }) {
  return [styles.button, pressed && styles.pressed];
}


function resultKey(item, index) {
  return `${item.word_id ?? "word"}-${index}`;
}


function renderResult({ item }) {
  const correct = Boolean(item.is_correct);

  return (
    <View
      testID={`quiz-result-${item.word_id}`}
      style={[quizResultsStyles.row, !correct && quizResultsStyles.wrongRow]}
    >
      <View style={quizResultsStyles.status}>
        <Text
          accessibilityLabel={correct ? "Richtig" : "Falsch"}
          style={[
            quizResultsStyles.statusIcon,
            correct ? quizResultsStyles.successIcon : quizResultsStyles.errorIcon,
          ]}
        >
          {correct ? "✓" : "✕"}
        </Text>
        <Text style={correct ? quizResultsStyles.correct : quizResultsStyles.incorrectStatus}>
          {correct ? "Richtig" : "Falsch"}
        </Text>
      </View>
      <View style={quizResultsStyles.column}>
        <Text style={quizResultsStyles.label}>Wort</Text>
        <Text style={quizResultsStyles.word}>{item.source_word}</Text>
      </View>
      <View style={quizResultsStyles.column}>
        <Text style={quizResultsStyles.label}>Deine Antwort</Text>
        <Text style={[
          quizResultsStyles.answer,
          correct ? quizResultsStyles.correct : quizResultsStyles.incorrect,
        ]}>
          {item.user_answer}
        </Text>
      </View>
      <View style={quizResultsStyles.column}>
        <Text style={quizResultsStyles.label}>Richtig</Text>
        <Text style={[quizResultsStyles.answer, quizResultsStyles.correct]}>
          {item.correct_answer}
        </Text>
      </View>
    </View>
  );
}


export default function QuizResults({ result, quizName, onRepeat, onClose }) {
  const details = Array.isArray(result?.results) ? result.results : [];
  const correctCount = details.filter((entry) => entry.is_correct).length;

  return (
    <FlatList
      data={details}
      keyExtractor={resultKey}
      renderItem={renderResult}
      contentContainerStyle={quizResultsStyles.content}
      ListHeaderComponent={
        <View style={quizResultsStyles.header}>
          <View style={quizResultsStyles.headingRow}>
            <Text style={quizResultsStyles.title} accessibilityRole="header">Deine Ergebnisse</Text>
            <Text style={quizResultsStyles.badge}>{details.length} Wörter</Text>
          </View>
          <Text style={quizResultsStyles.message}>{quizName}</Text>
          <Text style={quizResultsStyles.summary}>
            {details.length ? `${correctCount} von ${details.length} richtig` : "Dein Test wurde abgegeben."}
          </Text>
        </View>
      }
      ListFooterComponent={
        <View style={quizResultsStyles.footer}>
          <Pressable testID="repeat-test-quiz" accessibilityRole="button" onPress={onRepeat} style={buttonStyle}>
            <Text style={styles.buttonText}>Wiederholen</Text>
          </Pressable>
          <Pressable testID="close-test-results" accessibilityRole="button" onPress={onClose} style={buttonStyle}>
            <Text style={styles.buttonText}>Zurück</Text>
          </Pressable>
        </View>
      }
    />
  );
}
