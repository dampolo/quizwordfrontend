import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import EditIcon from "../../../assets/icons/edit.svg";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import PreLoader from "../PreLoader/pre-loader";
import { allWordsStyles } from "../AllWords/all-words.styles";
import { styles } from "../../styles/styles";


function wordKey(word) {
  return String(word.id);
}


function rowStyle({ pressed }) {
  return [allWordsStyles.listRow, pressed && styles.pressed];
}


function editStyle({ pressed }) {
  return [allWordsStyles.actionsColumn, allWordsStyles.editButton, pressed && styles.pressed];
}


function buttonStyle({ pressed }) {
  return [styles.button, pressed && styles.pressed];
}


export default function AllCategoryWords() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const language = Array.isArray(params.language) ? params.language[0] : params.language;
  const { getCategoryWords } = useVocabulary();
  const loadAction = useRef(getCategoryWords);
  const listRef = useRef(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ id, page: 1 });
  const currentPage = pagination.id === id ? pagination.page : 1;
  const previousDisabled = loading || !!error || !category?.previous;
  const nextDisabled = loading || !!error || !category?.next;

  useEffect(() => {
    loadAction.current = getCategoryWords;
  }, [getCategoryWords]);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");


    async function loadWords() {
      try {
        if (!id) throw new Error("Missing category id");
        const page = pagination.id === id ? pagination.page : 1;
        const result = await loadAction.current(id, page);
        if (active) setCategory(result);
      } catch {
        if (!active) return;
        const message = "Die Wörter konnten nicht geladen werden. Bitte versuche es erneut.";
        setError(message);
        setCategory(null);
        Alert.alert("Kategoriewörter", message);
      } finally {
        if (active) setLoading(false);
      }
    }


    void loadWords();
    return () => { active = false; };
  }, [id, pagination]));


  function previousPage() {
    if (previousDisabled) return;
    setPagination({ id, page: currentPage - 1 });
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }


  function nextPage() {
    if (nextDisabled) return;
    setPagination({ id, page: currentPage + 1 });
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }


  function retry() {
    setPagination({ id, page: currentPage });
  }


  function previousStyle({ pressed }) {
    return [allWordsStyles.paginationButton, previousDisabled && styles.buttonDisabled, pressed && !previousDisabled && styles.pressed];
  }


  function nextStyle({ pressed }) {
    return [allWordsStyles.paginationButton, nextDisabled && styles.buttonDisabled, pressed && !nextDisabled && styles.pressed];
  }


  function renderWord({ item }) {
    const translations = item.translations ?? [];
    const targetLanguage = category?.language_id ?? language;
    const target = translations.find(isTarget) ?? translations[1];
    const source = translations.find(isSource) ?? translations[0];


    function isTarget(translation) {
      return String(translation.language) === String(targetLanguage);
    }


    function isSource(translation) {
      return translation !== target;
    }


    function openWord() {
      if (!target) return;
      router.push({
        pathname: "/my-quiz/(all-words)/show-word",
        params: { id: String(item.id), language: String(target.language) },
      });
    }


    function editWord(event) {
      event.stopPropagation();
      if (!target) return;
      router.push({
        pathname: "/my-quiz/(all-words)/edit-word",
        params: { id: String(item.id), language: String(target.language), targetWord: String(target.id) },
      });
    }


    return (
      <Pressable testID={`category-word-${item.id}`} accessibilityRole="link" accessibilityLabel={`${source?.word ?? ""} – ${target?.word ?? ""} ansehen`} disabled={!target} onPress={openWord} style={rowStyle}>
        <Text style={[allWordsStyles.rankText, allWordsStyles.rankColumn]}>#{target?.rank ?? "—"}</Text>
        <View style={allWordsStyles.wordColumn}>
          <Text style={allWordsStyles.translation}>
            <Text style={allWordsStyles.sourceWord}>{source?.word ?? "—"}</Text>
            <Text style={allWordsStyles.translationArrow}> » </Text>
            {target?.word ?? "—"}
          </Text>
        </View>
        <Pressable testID={`edit-category-word-${item.id}`} accessibilityRole="button" accessibilityLabel="Wort bearbeiten" disabled={!target} onPress={editWord} style={editStyle}>
          <EditIcon width={19} height={19} accessible={false} />
        </Pressable>
      </Pressable>
    );
  }


  function renderEmpty() {
    if (loading) return <View style={[allWordsStyles.listRow, allWordsStyles.loadingRow]}><PreLoader /></View>;
    if (error) {
      return (
        <View>
          <Text style={allWordsStyles.message} accessibilityRole="alert">{error}</Text>
          <Pressable testID="retry-category-words" accessibilityRole="button" onPress={retry} style={buttonStyle}>
            <Text style={styles.buttonText}>Erneut versuchen</Text>
          </Pressable>
        </View>
      );
    }
    return <Text style={allWordsStyles.message}>Du hast in dieser Kategorie noch keine Wörter.</Text>;
  }


  return (
    <SafeAreaView style={allWordsStyles.screen} edges={["top", "right", "left"]}>
      <FlatList
        ref={listRef}
        data={loading || error ? [] : (category?.concepts ?? [])}
        keyExtractor={wordKey}
        renderItem={renderWord}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={allWordsStyles.content}
        ListHeaderComponent={
          <View>
            <ScreenHeaderCustomer title="Kategoriewörter" fallbackHref="/my-quiz/all-categories" style={allWordsStyles.screenHeader} />
            <View style={allWordsStyles.vocabularyHeader}>
              <Text style={allWordsStyles.title} accessibilityRole="header">Kategorie: {category?.category_name ?? "…"}</Text>
              {!!category?.language_name && <Text style={allWordsStyles.description}>{category.language_name}</Text>}
            </View>
            <View style={allWordsStyles.listHead}>
              <Text style={[allWordsStyles.heading, allWordsStyles.rankColumn]}>Rang</Text>
              <Text style={[allWordsStyles.heading, allWordsStyles.wordColumn]}>Wort & Übersetzung</Text>
              <Text style={[allWordsStyles.heading, allWordsStyles.actionsColumn]}>Aktionen</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={allWordsStyles.pagination}>
            <Text style={allWordsStyles.paginationCount}>{category?.count ?? 0} Wörter</Text>
            <View style={allWordsStyles.pages}>
              <Pressable testID="category-words-previous" accessibilityRole="button" accessibilityLabel="Vorherige Seite" accessibilityState={{ disabled: previousDisabled }} disabled={previousDisabled} onPress={previousPage} style={previousStyle}>
                <Text style={[allWordsStyles.paginationButtonText, previousDisabled && styles.buttonTextDisabled]}>{"<"}</Text>
              </Pressable>
              <Text style={allWordsStyles.pageNumber} accessibilityLabel={`Seite ${currentPage}`} accessibilityLiveRegion="polite">{currentPage}</Text>
              <Pressable testID="category-words-next" accessibilityRole="button" accessibilityLabel="Nächste Seite" accessibilityState={{ disabled: nextDisabled }} disabled={nextDisabled} onPress={nextPage} style={nextStyle}>
                <Text style={[allWordsStyles.paginationButtonText, nextDisabled && styles.buttonTextDisabled]}>{">"}</Text>
              </Pressable>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
