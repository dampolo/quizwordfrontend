import de from "./de.json";
import en from "./en.json";

export const resources = {
  de: { translation: de },
  en: { translation: en },
};

export function initializeI18n(i18n, reactPlugin) {
  i18n.use(reactPlugin).init({
    resources,
    lng: "de",
    fallbackLng: "de",
    supportedLngs: ["de", "en"],
    interpolation: { escapeValue: false },
  });
  return i18n;
}
