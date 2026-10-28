import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import EditIcon from "../../../assets/icons/edit.svg";
import PreLoader from "../PreLoader/pre-loader";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { styles } from "../../styles/styles";
import { allWordsStyles } from "../AllWords/all-words.styles";
import { allCategoriesStyles } from "./all-categories.styles";

const allLanguages = { id: "all", language_name: "All" };
function buttonStyle({ pressed }) {
  return [styles.button, pressed && styles.pressed];
}
function addCategory() {
  router.navigate("/my-quiz/add-new-category");
}

export default function AllCategories() {
  const { language } = useLocalSearchParams();
  const activeLanguage =
    (Array.isArray(language) ? language[0] : language) || null;
  const { categories, userLanguages, getCategories, getFiltredCategories } =
    useVocabulary();
  const [loading, setLoading] = useState(true);
  const actions = useRef({ getCategories, getFiltredCategories });
  useEffect(() => {
    actions.current = { getCategories, getFiltredCategories };
  }, [getCategories, getFiltredCategories]);
  useFocusEffect(
    useCallback(() => {
      let current = true;
      setLoading(true);
      async function loadCategories() {
        try {
          if (activeLanguage)
            await actions.current.getFiltredCategories(activeLanguage);
          else await actions.current.getCategories();
        } finally {
          if (current) setLoading(false);
        }
      }
      void loadCategories();
      return () => {
        current = false;
      };
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
        testID={`category-language-${item.id}`}
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
  function renderCategory({ item }) {
    function openWords() {
      router.navigate({
        pathname: "/my-quiz/[id]/all-category-words",
        params: {
          id: String(item.category_id),
          language: String(item.language_id),
        },
      });
    }
    function editCategory() {
      router.navigate({
        pathname: "/my-quiz/all-categories/[id]/edit-category",
        params: {
          id: String(item.category_id),
          language: activeLanguage || "",
        },
      });
    }
    return (
      <View
        style={allCategoriesStyles.card}
        testID={`category-${item.category_id}`}
      >
        <View style={allCategoriesStyles.cardHeader}>
          <Text
            style={allCategoriesStyles.cardTitle}
            accessibilityRole="header"
          >
            {item.category_name}
          </Text>
          <Pressable
            testID={`edit-category-${item.category_id}`}
            accessibilityRole="button"
            accessibilityLabel={`${item.category_name} bearbeiten`}
            onPress={editCategory}
            style={allCategoriesStyles.editButton}
          >
            <EditIcon width={20} height={20} accessible={false} />
          </Pressable>
        </View>
        <View style={allCategoriesStyles.cardFooter}>
          <Pressable
            testID={`category-words-${item.category_id}`}
            accessibilityRole="link"
            accessibilityLabel={`Wörter in ${item.category_name} ansehen`}
            onPress={openWords}
            style={allCategoriesStyles.wordsButton}
          >
            <Text style={allCategoriesStyles.wordCount}>
              ▦ {item.concepts_count} Wörter
            </Text>
          </Pressable>
          <Text style={allCategoriesStyles.languageName}>
            {item.language_name}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <SafeAreaView
      style={allWordsStyles.screen}
      edges={["top", "right", "left"]}
    >
      <FlatList
        data={loading ? [] : categories}
        keyExtractor={(item) => String(item.category_id)}
        renderItem={renderCategory}
        contentContainerStyle={allCategoriesStyles.content}
        ListHeaderComponent={
          <View>
            <ScreenHeaderCustomer
              title="Kategorien"
              style={allWordsStyles.screenHeader}
            />
            <View style={allWordsStyles.vocabularyHeader}>
              <Text style={allWordsStyles.title} accessibilityRole="header">
                Vokabelkategorien
              </Text>
              <Text style={allWordsStyles.description}>
                Organisiere deinen Lernfortschritt nach Thema und
                Schwierigkeitsgrad.
              </Text>
              <Pressable
                testID="add-category"
                accessibilityRole="button"
                onPress={addCategory}
                style={buttonStyle}
              >
                <Text style={styles.buttonText}>+ Kategorie</Text>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={[allLanguages, ...userLanguages]}
              extraData={activeLanguage}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderLanguage}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={allCategoriesStyles.languages}
              accessibilityRole="tablist"
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <PreLoader />
          ) : (
            <Text style={allWordsStyles.message}>
              Du hast hier keine Kategorie erstellt.
            </Text>
          )
        }
        ListFooterComponent={
          <Pressable
            testID="add-category-card"
            accessibilityRole="button"
            onPress={addCategory}
            style={buttonStyle}
          >
            <Text style={styles.buttonText}>⊕ Neue Kategorie hinzufügen</Text>
            <Text style={styles.buttonText}>
              Erstelle eine individuelle Lernliste.
            </Text>
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}
