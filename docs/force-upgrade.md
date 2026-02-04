# Force-upgrade strategy (React Native app)

## Goal

The React Native app depends on the backend API. If the API changes in a way that breaks older app versions, we need a **server-controlled “force upgrade”** mechanism so older apps can be blocked and directed to the app store.

This repo implements that using a **startup “support check” ping**:

- On app launch, the mobile app calls an unauthenticated endpoint with its platform and version.
- The API compares that version against a configured minimum supported version.
- If the app is below the minimum, the API returns `forceUpgrade: true`.
- The app then renders a blocking “Update required” screen with a link to the store.

## Where the compared versions come from

The API compares:

- **Current app version (client)**: read by the React Native app from `expo-constants` as `Constants.expoConfig?.version`.
  - This value comes from the Expo app config, i.e. `react-native-mobile-app/app.json` (`expo.version`) or `react-native-mobile-app/app.config.ts` at build time.
- **Minimum supported version (server)**: configured in the API’s environment variables:
  - `MOBILE_IOS_MIN_VERSION`
  - `MOBILE_ANDROID_MIN_VERSION`

The endpoint simply returns both values back in the response (`current.version` and `minimumSupported.version`) along with the computed `supported` / `forceUpgrade` booleans.

## API endpoint

`GET /api/mobile-app/support?platform=ios|android&version=x.y.z` (version must be strict SemVer `MAJOR.MINOR.PATCH`)

Example response (supported):

```json
{
  "data": {
    "platform": "ios",
    "current": { "version": "1.2.3" },
    "minimumSupported": { "version": "1.0.0" },
    "latest": { "version": "1.3.0" },
    "supported": true,
    "forceUpgrade": false,
    "storeUrl": "https://apps.apple.com/app/id1234567890"
  }
}
```

Example response (force upgrade):

```json
{
  "data": {
    "platform": "android",
    "current": { "version": "1.0.0" },
    "minimumSupported": { "version": "1.2.0" },
    "latest": { "version": "1.3.0" },
    "supported": false,
    "forceUpgrade": true,
    "storeUrl": "https://play.google.com/store/apps/details?id=com.example.app",
    "message": "This app version is no longer supported. Please update to continue."
  }
}
```

## How to force an upgrade

The API reads minimum supported versions from environment variables (see `api/config/index.ts`).

- **iOS minimum**: `MOBILE_IOS_MIN_VERSION`
- **Android minimum**: `MOBILE_ANDROID_MIN_VERSION`

To force an upgrade for a platform:

- Set that platform’s `MOBILE_*_MIN_VERSION` to a version **higher** than the currently-installed app versions.
- Deploy the API.

Optional (recommended) variables:

- **Store URLs**
  - `MOBILE_IOS_STORE_URL`
  - `MOBILE_ANDROID_STORE_URL`
- **Latest versions** (informational; not required for force upgrade)
  - `MOBILE_IOS_LATEST_VERSION`
  - `MOBILE_ANDROID_LATEST_VERSION`

## Client behavior (React Native)

The React Native app uses an `UpgradeGate` at the root layout:

- Calls the endpoint on startup.
- If `forceUpgrade` is returned, the app shows `UpgradeRequiredScreen` and blocks the rest of the UI.
- If the device is offline or the check fails, the app **does not block** unless it previously cached a `forceUpgrade` response.

Related files:

- API route: `api/router/routes/mobile-app.ts`
- App startup gate: `react-native-mobile-app/src/upgrade/UpgradeGate.tsx`
- Block screen UI: `react-native-mobile-app/src/upgrade/UpgradeRequiredScreen.tsx`
