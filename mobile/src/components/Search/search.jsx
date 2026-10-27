import { useEffect, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import { allWordsStyles } from "../AllWords/all-words.styles";

export default function Search() {
  const { searchVocabulary, userLanguages, languages } = useVocabulary();
  const [search, setSearch] = useState("");
  const [searchState, setSearchState] = useState({ query: "", results: [], loading: false, error: "" });
  const query = search.trim();

  function openSearchResult(word) {
    const targetLanguage = [
      ...(userLanguages ?? []),
      ...(languages ?? []),
    ].find((item) =>
      item.language_name?.toLocaleLowerCase() === word.target_language?.toLocaleLowerCase(),
    );
    if (!targetLanguage) {
      Alert.alert("Wort konnte nicht geöffnet werden", "Die Zielsprache des Suchergebnisses konnte nicht zugeordnet werden.");
      return;
    }
    router.navigate({
      pathname: "/my-quiz/show-word",
      params: { id: String(word.concept_id), language: String(targetLanguage.id) },
    });
  }

  useEffect(() => {
    if (!query) return;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSearchState({ query, results: [], loading: true, error: "" });
      try {
        const results = await searchVocabulary(query, { signal: controller.signal });
        if (active) setSearchState({ query, results, loading: false, error: "" });
      } catch (error) {
        if (active && error.name !== "AbortError") {
          const message = "Die Vokabelsuche ist fehlgeschlagen.";
          setSearchState({ query, results: [], loading: false, error: message });
          Alert.alert("Suche fehlgeschlagen", message);
        }
      }
    }, 300);
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [query, searchVocabulary]);

  return (
    <View style={allWordsStyles.search}>
      <TextInput
        style={allWordsStyles.searchInput}
        testID="vocabulary-search"
        accessibilityLabel="Wörter und Übersetzungen suchen"
        placeholder="Wörter und Übersetzungen suchen …"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {Boolean(query) && (
        <View style={allWordsStyles.searchResults} accessibilityLiveRegion="polite">
          {searchState.query !== query || searchState.loading
            ? <ActivityIndicator accessibilityLabel="Suche läuft" />
            : searchState.error
              ? <Text style={allWordsStyles.description}>{searchState.error}</Text>
              : searchState.results.length === 0
                ? <Text style={allWordsStyles.description}>Keine Wörter gefunden.</Text>
                : searchState.results.map((word) => (
                  <Pressable
                    key={`${word.concept_id}-${word.target_language}-${word.target_word}`}
                    style={allWordsStyles.searchResult}
                    testID={`search-result-${word.concept_id}-${word.target_language}`}
                    accessibilityRole="link"
                    accessibilityLabel={`${word.native_word} – ${word.target_word} ansehen`}
                    onPress={() => openSearchResult(word)}
                  >
                    <Text style={allWordsStyles.translation}>{word.native_word} » {word.target_word}</Text>
                    <Text style={allWordsStyles.description}>{word.native_language} → {word.target_language}</Text>
                  </Pressable>
                ))}
        </View>
      )}
    </View>
  );
}
