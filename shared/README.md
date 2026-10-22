# Shared Quizword code

Both apps import authentication from @quizword/shared. Install dependencies with npm install from the repository root. Start apps with npm run dev:web or npm run dev:mobile.

AuthProvider accepts api (the backend URL including its trailing slash), children, optional session ({ fetch }), and optional onProfileError. The session fetch function must follow the Fetch API contract. Browser authentication continues using backend cookies; no tokens are stored in localStorage. Native token persistence is intentionally not invented: supply a native session adapter when the backend token contract is available. Do not put database credentials in either app.

Mobile uses EXPO_PUBLIC_API_URL. Without it, authentication initialization is skipped and public screens still work. Use an address reachable from the device, not the development computer's localhost. Login screens and native persistent login are not implemented yet.

Web-only menu and confirmation state stay in the web wrapper. Navigation, screens, styles, and public assets stay in their apps. Other contexts can be extracted individually later.
