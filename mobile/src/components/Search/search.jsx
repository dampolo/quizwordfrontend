import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, View } from "react-native";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import { allWordsStyles } from "../AllWords/all-words.styles";

export default function Search() {
  const { searchVocabulary } = useVocabulary();
  const [search, setSearch] = useState("");
  const [searchState, setSearchState] = useState({ query: "", results: [], loading: false, error: "" });
  const query = search.trim();

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
                  <View key={`${word.concept_id}-${word.target_language}-${word.target_word}`} style={allWordsStyles.searchResult}>
                    <Text style={allWordsStyles.translation}>{word.native_word} » {word.target_word}</Text>
                    <Text style={allWordsStyles.description}>{word.native_language} → {word.target_language}</Text>
                  </View>
                ))}
        </View>
      )}
    </View>
  );
}
