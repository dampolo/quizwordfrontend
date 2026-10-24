# App assets

Assets migrated from `D:/quizwordfrontend/public`:

- `icons/`: the original SVG files. Metro transforms SVG imports into `react-native-svg` components for Android, iOS, and web. Import the file directly and supply its dimensions and, for icons using `currentColor`, its color.
- `images/`: PNG and JPEG images. Use a static `require()` in React Native's `Image` component. Only referenced assets are included in native bundles.
- `fonts/Lexend/`: the original font files and license. The app loads Regular, SemiBold, Bold, and ExtraBold static faces through `expo-font`; these are registered in `src/assets/fonts.js`. Use the exported `fonts` names in text styles. Static faces avoid variable-font limitations in SDK 57.

The reusable logo is in `src/components/Logo/logo.jsx`. The header, footer, and landing page use the migrated artwork.

Web-only resources live in `public/robots.txt` and `public/assets/og-image.png`. The web favicon is configured in `app.json` using `assets/images/favicon.png`. Social metadata can reference `/assets/og-image.png` when it is configured for web.

The existing native launcher and splash artwork remains separate at the top of `assets/`; web favicon and email images are not substitutes for native launcher assets.

After changing `metro.config.js`, restart the development server with `npx expo start --clear`.
