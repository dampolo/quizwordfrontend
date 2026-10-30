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


function normalizeLanguage(language) {
  return String(language || "").trim().replace(/_/g, "-").toLowerCase();
}


function selectVoice(voices, languageCode) {
  const baseLanguage = languageCode.split("-")[0];
  let selectedVoice;
  let bestScore = -1;

  for (const voice of voices) {
    const voiceLanguage = normalizeLanguage(voice.language);
    if (voiceLanguage.split("-")[0] !== baseLanguage) {
      continue;
    }
    const score =
      (voiceLanguage === languageCode ? 2 : 0) +
      (voice.quality === Speech.VoiceQuality.Enhanced ? 1 : 0);
    if (score > bestScore) {
      selectedVoice = voice;
      bestScore = score;
    }
  }

  return selectedVoice;
}


function createSpeechSession(onEnd) {
  endCurrentSpeech?.();
  const request = ++speechRequest;
  endCurrentSpeech = undefined;
  let finished = false;


  function finish() {
    if (request !== speechRequest || finished) {
      return;
    }
    finished = true;
    endCurrentSpeech = undefined;
    onEnd();
  }


  endCurrentSpeech = finish;
  return { request, finish };
}


function handleSpeechError(request, finish) {
  if (request !== speechRequest) {
    return;
  }
  finish();
  Alert.alert("Aussprache fehlgeschlagen", "Bitte versuche es erneut.");
}


function startSpeaking(word, voice, onStart, onDone, request, finish) {
  onStart();
  Speech.speak(word, {
    language: voice.language,
    voice: voice.identifier,
    onDone: () => {
      if (request !== speechRequest) {
        return;
      }
      onDone?.();
      finish();
    },
    onStopped: finish,
    onError: () => handleSpeechError(request, finish),
  });
}


export async function speak(word, language, { onStart, onEnd, onDone }) {
  const { request, finish } = createSpeechSession(onEnd);
  try {
    await Speech.stop();
    if (request !== speechRequest) {
      return;
    }
    const languageCode = normalizeLanguage(language);
    if (!languageCode) {
      finish();
      Alert.alert(
        "Aussprache nicht verfügbar",
        "Für dieses Wort fehlt der Sprachcode.",
      );
      return;
    }
    const voices = await Speech.getAvailableVoicesAsync();
    if (request !== speechRequest) {
      return;
    }
    const selectedVoice = selectVoice(voices, languageCode);
    if (!selectedVoice) {
      finish();
      Alert.alert(
        "Aussprache nicht verfügbar",
        `Für ${languageCode} ist keine passende Stimme verfügbar. Bitte aktiviere eine Stimme für diese Sprache in den Spracheinstellungen deines Geräts.`,
      );
      return;
    }

    startSpeaking(word, selectedVoice, onStart, onDone, request, finish);
  } catch {
    handleSpeechError(request, finish);
  }
}
