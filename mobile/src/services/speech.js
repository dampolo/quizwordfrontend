import * as Speech from "expo-speech";
import { Alert } from "react-native";

let speechRequest = 0;
let endCurrentSpeech;

export async function stopSpeaking() {
  endCurrentSpeech?.();
  speechRequest += 1;
  endCurrentSpeech = undefined;
  await Speech.stop();
}

export async function speak(word, language, { onStart, onEnd }) {
  endCurrentSpeech?.();
  const request = ++speechRequest;
  endCurrentSpeech = undefined;
  let finished = false;
  const finish = () => {
    if (request !== speechRequest || finished) return;
    finished = true;
    endCurrentSpeech = undefined;
    onEnd();
  };
  endCurrentSpeech = finish;
  try {
    await Speech.stop();
    if (request !== speechRequest) return;
    const languageCode = String(language || "").trim().replace(/_/g, "-").toLowerCase();
    if (!languageCode) {
      finish();
      Alert.alert("Aussprache nicht verfügbar", "Für dieses Wort fehlt der Sprachcode.");
      return;
    }
    const voices = await Speech.getAvailableVoicesAsync();
    if (request !== speechRequest) return;
    const baseLanguage = languageCode.split("-")[0];
    let selectedVoice;
    let bestScore = -1;
    for (const voice of voices) {
      const voiceLanguage = voice.language.trim().replace(/_/g, "-").toLowerCase();
      if (voiceLanguage.split("-")[0] !== baseLanguage) continue;
      const score = (voiceLanguage === languageCode ? 2 : 0) +
        (voice.quality === Speech.VoiceQuality.Enhanced ? 1 : 0);
      if (score > bestScore) {
        selectedVoice = voice;
        bestScore = score;
      }
    }
    if (!selectedVoice) {
      finish();
      Alert.alert(
        "Aussprache nicht verfügbar",
        `Für ${languageCode} ist keine passende Stimme verfügbar. Bitte aktiviere eine Stimme für diese Sprache in den Spracheinstellungen deines Geräts.`,
      );
      return;
    }

    onStart();
    Speech.speak(word, {
      language: selectedVoice.language,
      voice: selectedVoice.identifier,
      onDone: finish,
      onStopped: finish,
      onError: () => {
        if (request !== speechRequest) return;
        finish();
        Alert.alert("Aussprache fehlgeschlagen", "Bitte versuche es erneut.");
      },
    });
  } catch {
    if (request !== speechRequest) return;
    finish();
    Alert.alert("Aussprache fehlgeschlagen", "Bitte versuche es erneut.");
  }
}
