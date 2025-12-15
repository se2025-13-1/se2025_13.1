# SDK Configuration Guide

## 🔧 Setup Instructions

Your mobile authentication app is now ready for social login integration! Follow these steps to complete the setup:

## ✅ Completed Tasks (8/8)

1. ✅ **OTP verification removal** from SignUpScreen
2. ✅ **Login API call implementation** with error handling
3. ✅ **Social login code structure** - Facebook and Google integration ready
4. ✅ **Token persistence** with AsyncStorage
5. ✅ **Logout functionality** via AuthContext
6. ✅ **Auth context global state** management
7. ✅ **Google Sign-In SDK configuration** - Ready for credentials
8. ✅ **Facebook SDK configuration** - Ready for App ID

## 🚀 Final Setup Steps

### Google Sign-In Setup

**⚠️ Important: Backend requires Google accessToken for verification**

1. **Get Google Cloud Credentials:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable **Google Sign-In API** and **Google+ API**
   - Go to **Credentials > Create credentials > OAuth 2.0 Client IDs**
   - Create **TWO** client IDs:
     - **Android** application type (for mobile app)
     - **Web** application type (for backend verification)
   - Add your app's SHA-1 fingerprint to Android client
   - Download the `google-services.json` file

2. **Critical Configuration:**
   - Replace `mobile/android/app/google-services.json` with your downloaded file
   - Update `src/services/googleService.ts` line 9: Replace `'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com'` with your **WEB CLIENT ID** (not Android client ID)
   - The Web Client ID is required to get accessToken that backend can verify
   - For iOS: Add the REVERSED_CLIENT_ID from GoogleService-Info.plist to `ios/mobile/Info.plist`

**Why Web Client ID is needed:**
The backend verifies Google tokens by calling Google's API with Bearer token. This requires the Web Client ID configuration to generate proper access tokens.

### Facebook SDK Setup

1. **Get Facebook App ID:**

   - Go to [Facebook Developers](https://developers.facebook.com/apps/)
   - Create a new app or use existing one
   - Get your **App ID** and **Client Token**

2. **Update Configuration:**
   - Replace `YOUR_FACEBOOK_APP_ID` in:
     - `android/app/src/main/res/values/strings.xml` (2 places)
     - `ios/mobile/Info.plist` (2 places)
     - `src/services/facebookService.ts` (1 place)
   - Replace `YOUR_FACEBOOK_CLIENT_TOKEN` in:
     - `android/app/src/main/res/values/strings.xml` (1 place)
     - `ios/mobile/Info.plist` (1 place)
     - `src/services/facebookService.ts` (1 place)

## 🏗️ Build & Run

After completing the configuration:

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios
```

## 📁 Key Files Modified

- ✅ `android/build.gradle` - Google Services classpath added
- ✅ `android/app/build.gradle` - Dependencies and plugin added
- ✅ `android/app/google-services.json` - Placeholder created (needs replacement)
- ✅ `android/app/src/main/res/values/strings.xml` - Facebook config added
- ✅ `android/app/src/main/AndroidManifest.xml` - Facebook activities added
- ✅ `ios/Podfile` - Google and Facebook pods added
- ✅ `ios/mobile/Info.plist` - URL schemes and config added
- ✅ `src/services/googleService.ts` - Complete Google Sign-In service
- ✅ `src/services/facebookService.ts` - Complete Facebook Login service
- ✅ `src/modules/auth/screens/LoginScreen.tsx` - Social login integrated
- ✅ `src/modules/auth/screens/SignUpScreen.tsx` - Social signup integrated
- ✅ `App.tsx` - SDK initialization on startup

## 🎯 What Works Now

- ✅ Email/password login and registration
- ✅ Token-based authentication with auto-login
- ✅ Global auth state management
- ✅ Proper error handling and loading states
- ✅ Social login buttons with configuration detection
- ✅ Logout functionality
- ✅ Native SDK initialization on app startup

## 🔍 Testing

1. **Email Login**: Working ✅
2. **Registration**: Working ✅
3. **Auto-login**: Working ✅
4. **Logout**: Working ✅
5. **Social Login**: Ready for credentials (shows "Setup Required" alert) ⏳

Once you complete the credential setup, your social logins will work seamlessly!

---

**Need help?** All TODO comments in the code files indicate exactly what needs to be replaced with your actual credentials.
