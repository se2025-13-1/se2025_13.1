# 📱 Android Development Setup

**⚠️ This project is currently configured for Android development only.**

iOS folder is preserved for future use but not actively maintained.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Android Studio
- Android SDK API 35+
- Gradle

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start Metro bundler with cache reset
npm run start:reset

# 3. In another terminal, build and run app
npm run android
```

### Common Issues

#### AsyncStorage NativeModule Error

```bash
# Clean build
cd android
gradlew clean
cd ..

# Rebuild
npm run android
```

#### Port 8081 already in use

```bash
# Kill process and restart
npm run start:reset
```

#### Gradle sync issues

```bash
# Full clean rebuild
rm -rf node_modules package-lock.json android/build
npm install
cd android
gradlew clean
cd ..
npm run android
```

## 📁 Useful Commands

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run android`     | Build and run on Android device/emulator |
| `npm run start`       | Start Metro bundler                      |
| `npm run start:reset` | Start Metro bundler with cache reset     |
| `npm run lint`        | Run ESLint                               |

## 🔐 Authentication Setup

### Google Sign-In

1. Get Web Client ID from [Google Cloud Console](https://console.cloud.google.com/)
2. Update `src/services/googleService.ts` line 10
3. Replace `google-services.json` in `android/app/`

## 📚 Project Structure

```
mobile/
├── android/                    # Android native code
├── src/
│   ├── services/              # API & Auth services
│   ├── modules/               # Feature modules
│   ├── contexts/              # React Context
│   └── ...
├── App.tsx                    # Root component
└── package.json
```
