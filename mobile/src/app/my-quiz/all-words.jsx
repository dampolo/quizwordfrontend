import { useState } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Pressable, Text, View } from "react-native";
import { Checkbox } from "expo-checkbox";
import EditIcon from "../../../assets/icons/edit.svg";
import { tabColors } from "../../styles/my-quiz-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import { useAuth } from "../../context/auth/useAuth";
import { styles } from "../../styles/all-words";

export default function AllWords() {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const { language } = useLocalSearchParams();
  const { userLanguages, loading, words, getFiltredConcepts } = useVocabulary();
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const activeLanguage = Array.isArray(language) ? language[0] : language;

  function handleCheckboxChange(id, checked) {
    setSelectedWordIds((previous) => checked
      ? [...previous.filter((value) => value !== id), id]
      : previous.filter((value) => value !== id));
  }

  function selectLanguage(id) {
    setSelectedWordIds([]);
    router.setParams({ language: String(id) });
    void getFiltredConcepts(id);
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
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={loading ? [] : (words?.results ?? [])}
        keyExtractor={(word) => String(word.id)}
        extraData={selectedWordIds}
        ListHeaderComponent={

        <View>
          <Text>All words</Text>

          {loading ? (
            <ActivityIndicator accessibilityLabel="Sprachen werden geladen" />
          ) : (
            <View style={styles.languages} accessibilityRole="tablist">
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
                      styles.language,
                      selected && styles.languageActive,
                      pressed && styles.languagePressed,
                    ]}
                  >
                    <Text style={[styles.languageText, selected && styles.languageTextActive]}>
                      {lang.language_name}
                    </Text>
                  </Pressable>
                );
              })}
              {userLanguages.length === 0 && (
                <Text style={styles.message}>Noch keine Lernsprachen vorhanden.</Text>
              )}
            </View>
          )}

          <View style={styles.listHead}>
            <Text style={[styles.heading, styles.checkColumn]}>+</Text>
            <Text style={[styles.heading, styles.rankColumn]}>Rang</Text>
            <Text style={[styles.heading, styles.wordColumn]}>Wort & Übersetzung</Text>
            <Text style={[styles.heading, styles.actionsColumn]}>Aktionen</Text>
          </View>
        </View>
        }
        ListEmptyComponent={loading
          ? <ActivityIndicator accessibilityLabel="Wörter werden geladen" />
          : <Text style={styles.message}>Du hast hier keine Wörter.</Text>}
        renderItem={({ item: word }) => {
          const [source, target] = word.translations ?? [];
          return (
            <View style={styles.listRow} testID={`word-${word.id}`}>
              <View style={styles.checkColumn}>
                <Checkbox
                  testID={`word-checkbox-${word.id}`}
                  accessibilityLabel={`${source?.word ?? "Wort"} auswählen`}
                  value={selectedWordIds.includes(word.id)}
                  onValueChange={(checked) => handleCheckboxChange(word.id, checked)}
                  color={tabColors.active}
                  hitSlop={12}
                />
              </View>
              <Text style={[styles.rankText, styles.rankColumn]}>#{target?.rank ?? "–"}</Text>
              <View style={styles.wordColumn}>
                <Text style={styles.sourceWord}>{source?.word ?? "–"}</Text>
                <Text style={styles.translation}>» {target?.word ?? "–"}</Text>
              </View>
              <Pressable
                style={styles.actionsColumn}
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
          <Button
            title={loggingOut ? "Logging out…" : "Log out"}
            onPress={handleLogout}
            disabled={loggingOut}
          />
        }
      />
    </SafeAreaView>
  );
}
