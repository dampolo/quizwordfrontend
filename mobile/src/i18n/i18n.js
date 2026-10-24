import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { initializeI18n } from "@quizword/shared/i18n";

export default initializeI18n(createInstance(), initReactI18next);
