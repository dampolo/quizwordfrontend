# Quizword

| App | Framework versions |
| --- | --- |
| Web (`./web`) | Vite 7.2.5 (`rolldown-vite`), React 19.2.3 |
| Mobile (`./mobile`) | Expo SDK 58 (`expo` 58.0.17), React Native 0.88.0, React 19.3.0 |

## Clone the repository

Run these commands from the directory where you want to keep the project. The clone URL uses SSH, so your GitHub SSH key needs access to the repository.

```sh
git clone git@github.com:dampolo/quizwordfrontend.git
cd quizwordfrontend
```

## Install dependencies

Use Node.js 22.13 or later in the 22.x series. Run `npm install` from the repository root to install dependencies for both apps and the shared package.

```sh
npm install
```

## Configure environment variables

Create the two `.env` files below and replace the examples with values for your development environment. Restart the development server after changing either file.

### Web (`web/.env`)*

```dotenv
VITE_API_URL=https://api.example.com
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

Use the Quizword backend URL and the reCAPTCHA site key configured for your web hostname. The contact form uses this site key.

### Mobile (`mobile/.env`)*

```dotenv
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

Use a backend URL reachable from the phone or emulator. If the backend runs on your computer and you test on a physical phone, use the computer's LAN address and backend port. For Google Sign-In, use the Web application OAuth client ID configured for Quizword.

Git ignores both `.env` files. The `VITE_` and `EXPO_PUBLIC_` values are visible to app users. Keep private credentials such as the reCAPTCHA secret key and OAuth client secret on the backend.

## Start the web app

From the repository root, run:

```sh
cd ./web
npx vite --host 127.0.0.1
```

Open the local URL printed by Vite.

## Start the mobile app

In a separate terminal at the repository root, run:

```sh
cd ./mobile
npx expo start
```

To build and launch the native app locally, run `npm run android` with Android Studio set up, or `npm run ios` on macOS with Xcode set up.

* Ask Damian for the credentials.
