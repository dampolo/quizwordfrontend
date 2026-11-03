import { Alert } from "react-native";
import { openURL } from "expo-linking";


export function confirmContactRedirect() {
  Alert.alert(
    "Kontakt",
    "Du wirst zur Webseite von Quiz Word weitergeleitet.",
    [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Bestätigen",
        onPress: () => openURL("https://quiz-word.com/contact").catch(() => {
          Alert.alert("Kontaktseite konnte nicht geöffnet werden", "Bitte versuche es erneut.");
        }),
      },
    ],
  );
}
