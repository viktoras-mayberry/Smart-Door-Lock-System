# Android APK Build Instructions

## Prerequisites

1. **Install EAS CLI globally:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to your Expo account:**
   ```bash
   eas login
   ```

3. **Configure the project:**
   ```bash
   eas build:configure
   ```

## Building the Android APK

### Option 1: Quick Preview Build (Recommended for testing)
```bash
npm run build:android-preview
```

### Option 2: Production Build
```bash
npm run build:android-production
```

### Option 3: Default Build
```bash
npm run build:android
```

## Build Process

1. **Start the build:**
   - Run one of the build commands above
   - EAS will upload your code to the cloud
   - The build will start automatically

2. **Monitor the build:**
   - You'll get a build URL to track progress
   - Build typically takes 5-15 minutes

3. **Download the APK:**
   - Once complete, you'll get a download link
   - The APK will be available for 30 days

## Alternative: Local Build (Advanced)

If you prefer to build locally:

1. **Install Android Studio and SDK**
2. **Set up environment variables**
3. **Run:**
   ```bash
   expo run:android --variant release
   ```

## APK Installation

1. **Enable "Unknown Sources"** on your Android device:
   - Settings → Security → Unknown Sources (enable)

2. **Download and install** the APK file

3. **Launch the app** and configure your door lock settings

## Troubleshooting

- **Build fails**: Check your internet connection and Expo account status
- **APK won't install**: Ensure "Unknown Sources" is enabled
- **App crashes**: Check device compatibility (Android 6.0+ recommended)

## File Locations

- **APK Download**: Check your Expo dashboard or the build URL
- **Local Build**: `android/app/build/outputs/apk/release/`

## Support

For build issues, check:
- Expo documentation: https://docs.expo.dev/
- EAS Build docs: https://docs.expo.dev/build/introduction/
