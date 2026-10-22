# Shared Quizword code

Both apps import authentication from @quizword/shared. Install dependencies with npm install from the repository root. Start apps with npm run dev:web or npm run dev:mobile.

AuthProvider accepts api (the backend URL including its trailing slash), children, optional session ({ fetch }), and optional onProfileError. The session fetch function must follow the Fetch API contract. Browser authentication continues using backend cookies; no tokens are stored in localStorage. Native token persistence is intentionally not invented: supply a native session adapter when the backend token contract is available. Do not put database credentials in either app.

Mobile uses EXPO_PUBLIC_API_URL. Without it, authentication initialization is skipped and public screens still work. Use an address reachable from the device, not the development computer's localhost. Login screens and native persistent login are not implemented yet.

## Shared contexts

Both apps can import api, auth, dialog, quiz, translation, and vocabulary from @quizword/shared or their explicit subpaths (for example @quizword/shared/quiz/provider and @quizword/shared/quiz/useQuiz).

Wrap the app with ApiProvider api={backendUrl}. Quiz, translation, and vocabulary providers accept optional api, request (a fetch-compatible session adapter), apiFetch, and onError(message) props. Web supplies its existing request service and toast notifications.

DialogProvider owns state and actions. Supply renderDialog({ open, options, closeDialog, handleConfirm }) for platform UI, or consume those values with useDialog. Material UI stays in web.

VocabularyProvider accepts onLanguagesLoaded(userData) for navigation and speak(word, languageCode, { onStart, onEnd }) for speech. Call onEnd on completion or failure. Web supplies React Router and browser speech. Mount vocabulary inside the authenticated app; it loads languages and concepts on mount.

Web-only menu and confirmation state stay in the web auth wrapper. Navigation, screens, styles, and assets stay in each app. Mobile can import the shared providers; its existing screens are not rewired by this extraction.

Both apps initialize their i18next instance through initializeI18n from @quizword/shared/i18n, supplying their installed React i18next plugin. German and English resources, including the mobile-specific MOBILE keys, live in src/i18n.
