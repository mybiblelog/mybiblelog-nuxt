# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Environment / build-time config

This app supports build-time configuration via `EXPO_PUBLIC_*` environment variables.

- **API base URL**: `EXPO_PUBLIC_API_BASE_URL`
- **Google Sign-In (Expo Go)**: `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
- **Google Sign-In (web)**: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (use a **Web application** OAuth client in Google Cloud Console)
- **Config accessor**: `src/config.ts` exports `API_BASE_URL`

### Google Sign-In on web: fixing `redirect_uri_mismatch`

When you sign in with Google on web, Google must allow the redirect URI your app uses. Add it in [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → open your **Web application** OAuth 2.0 client → **Authorized redirect URIs** → **Add URI**.

To see the exact URI your app uses: run the app on web, open the browser **Developer Console** (F12 → Console). On the Login screen you’ll see a log like:

`[Google Sign-In] Add this exact URL to ... Authorized redirect URIs: https://localhost:8081`

Add that **exact** URL (including port and path if present). For local dev it’s often `http://localhost:8081` or `https://localhost:8081` (port can vary). For production, add your real origin (e.g. `https://yourapp.com`).

### Google Sign-In on web: COOP console messages

After signing in with Google on web you may see console messages like `Cross-Origin-Opener-Policy policy would block the window.closed call`. These come from the browser’s security rules when the auth popup redirects back; the OAuth flow still completes. You can ignore them. If login fails, the usual cause is the API base URL (see below).

### API connection (e.g. `net::ERR_CONNECTION_REFUSED`)

The app sends requests to the URL in `EXPO_PUBLIC_API_BASE_URL` (or the default). If you see `POST ... net::ERR_CONNECTION_REFUSED`:

- **Default** is `http://localhost:3000` (for use with Nuxt dev, which proxies `/api` to the backend).
- If you run the **API server by itself** (e.g. from the `api` folder on port 8080), set in `.env`:  
  `EXPO_PUBLIC_API_BASE_URL=http://localhost:8080`  
  or run:  
  `EXPO_PUBLIC_API_BASE_URL=http://localhost:8080 npx expo start --web`.

Restart the Expo dev server after changing `.env`.

Example (local dev):

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000 npx expo start
```

You can also copy `.env.example` to `.env` and edit it (Expo will pick up `EXPO_PUBLIC_*` vars):

```bash
cp .env.example .env
```

**Important:** The `.env` file must live in the **project root** (same folder as `package.json`). Expo does not load `.env` from `src/` or other subfolders, so if your Google or API vars are undefined, move `.env` to the root and restart the dev server.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
