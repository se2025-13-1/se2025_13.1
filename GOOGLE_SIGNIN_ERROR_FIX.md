# 🔧 Google Sign-In Error Troubleshooting - Android

## ❌ Error

```
Google sign-in error: [com.google.android.gms.common.api.ApiException: A non-recoverable sign in failure occurred]
```

---

## 🎯 Common Causes & Solutions

### **Issue 1: Web Client ID Không Đúng** ⭐ (Most Common)

**Check:**

```typescript
// mobile/src/services/googleService.ts

GoogleSignin.configure({
  webClientId:
    "790984624622-he9b234vc0r0uj08k9l9bmt7gp4gvic8.apps.googleusercontent.com",
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  scopes: ["profile", "email"],
});
```

**Verify:**

- ✅ Không có khoảng trắng thừa
- ✅ ID đúng từ Firebase Console
- ✅ Không phải OAuth 2.0 Client ID (loại Android)

---

### **Issue 2: SHA-1 Fingerprint Không Match** ⭐⭐ (Most Likely)

Android yêu cầu **SHA-1 fingerprint** match với Firebase configuration.

#### Step 1: Get SHA-1 Fingerprint

```bash
cd d:\SE2025\se_project\se2025_13.1\mobile\android

# Run this command
./gradlew signingReport
```

**Output sẽ như này:**

```
...
Variant: debug
Config: debug
Store: C:\Users\[username]\.android\debug.keystore
Alias: AndroidDebugKey
MD5: xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx
SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
SHA-256: ...
```

**Copy SHA1 value:** `AA:BB:CC:DD:EE:FF:...`

#### Step 2: Add SHA-1 to Firebase

1. Go: **[console.firebase.google.com](https://console.firebase.google.com)**
2. Select project: **se2025-44d9c**
3. Go: **Project Settings** (⚙️) → **General**
4. Scroll: **Your apps** section
5. Click: **Android app** (or add if not exists)
6. Paste SHA-1 fingerprint in: **SHA certificate fingerprints**
7. Click: **Save**

---

### **Issue 3: google-services.json Missing or Wrong**

#### Check if file exists:

```
d:\SE2025\se_project\se2025_13.1\mobile\android\app\google-services.json
```

If **NOT exist**:

1. Go: **[Firebase Console](https://console.firebase.google.com)**
2. Project: **se2025-44d9c**
3. Settings (⚙️)
4. Your apps → Android
5. Download **google-services.json**
6. Place in: `mobile/android/app/google-services.json`

---

### **Issue 4: Android Build.gradle Configuration**

Check: `mobile/android/app/build.gradle`

```gradle
android {
  // ... existing config ...
}

dependencies {
  // Google Play Services
  implementation 'com.google.android.gms:play-services-auth:20.7.0'
  implementation 'com.google.android.gms:play-services-base:18.3.0'

  // Firebase
  implementation 'com.google.firebase:firebase-auth:22.3.1'
  // ... other dependencies ...
}

// At the bottom of file:
apply plugin: 'com.google.gms.google-services'
```

---

### **Issue 5: Google Cloud Console - OAuth Consent Screen**

1. Go: **[Google Cloud Console](https://console.cloud.google.com)**
2. Select project: **se2025-44d9c**
3. Go: **APIs & Services** → **OAuth consent screen**
4. Check: Is it configured?

**If NOT:**

- Click: **Configure Consent Screen**
- User type: **External**
- App name: `SE2025 Shopping App`
- Support email: [your email]
- Save

---

### **Issue 6: Enable Google+ API**

1. Go: **[Google Cloud Console](https://console.cloud.google.com)**
2. Go: **APIs & Services** → **Enabled APIs**
3. Search: **Google+ API**
4. If **NOT enabled**: Click and enable

---

## 🔍 Debug Steps

### Step 1: Verify Web Client ID

```bash
cd d:\SE2025\se_project\se2025_13.1\mobile

# Check current config
cat src/services/googleService.ts | grep webClientId
```

Should show: `790984624622-he9b234vc0r0uj08k9l9bmt7gp4gvic8.apps.googleusercontent.com`

### Step 2: Get Android SHA-1

```bash
cd android
./gradlew signingReport
# Copy SHA1 value
```

### Step 3: Verify Firebase Android App Config

```
Firebase Console
  └─ se2025-44d9c
     └─ Project Settings
        └─ Your apps
           └─ Android app
              ├─ Package name: com.mobile (or your package name)
              ├─ SHA certificate fingerprint: [PASTE SHA1 HERE]
              └─ Save
```

### Step 4: Check google-services.json

```bash
# Verify file exists
ls -la mobile/android/app/google-services.json

# Check content
cat mobile/android/app/google-services.json | head -20
```

### Step 5: Rebuild and Test

```bash
cd mobile

# Clean build
npm run android -- --build

# Or if using gradle directly
cd android
./gradlew clean
./gradlew assembleDebug
cd ..

# Run app
npm run android
```

---

## 📋 Complete Checklist

- [ ] SHA-1 fingerprint added to Firebase
- [ ] google-services.json downloaded and placed correctly
- [ ] Web Client ID correct in googleService.ts
- [ ] OAuth Consent Screen configured
- [ ] Google+ API enabled
- [ ] build.gradle has required dependencies
- [ ] Plugin applied: `com.google.gms.google-services`
- [ ] Clean rebuild done (`npm run android -- --build`)

---

## 🚨 Quick Fix (Most Common)

**99% of the time it's:**

1. **SHA-1 Fingerprint not added to Firebase**

   ```bash
   # Get SHA-1
   cd android && ./gradlew signingReport
   ```

   Then add to Firebase Console → Project Settings → Android App

2. **Rebuild app**
   ```bash
   npm run android -- --build
   ```

---

## 📱 Test Again

After fixing, test:

```bash
# 1. Clean install
cd mobile
npm run android -- --build

# 2. Click "Sign in with Google" button
# 3. Select Google account
# 4. Should work now! ✅
```

---

## 🆘 If Still Not Working

Try this debug version:

```typescript
// mobile/src/services/googleService.ts

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

export const initializeGoogleSignIn = () => {
  try {
    GoogleSignin.configure({
      webClientId:
        "790984624622-he9b234vc0r0uj08k9l9bmt7gp4gvic8.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ["profile", "email"],
    });

    console.log("✅ Google Sign-In initialized");

    // Debug: Check current config
    GoogleSignin.getCurrentUser()
      .then((user) => {
        console.log("Current user:", user);
      })
      .catch((err) => {
        console.log("No user signed in (expected):", err);
      });
  } catch (error) {
    console.error("❌ Error initializing Google Sign-In:", error);
  }
};

export const handleGoogleSignIn = async () => {
  try {
    console.log("🔐 Starting Google Sign-In...");

    // Check Play Services
    console.log("📱 Checking Play Services...");
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log("✅ Play Services available");

    // Sign in
    console.log("🔓 Attempting sign in...");
    const userInfo = await GoogleSignin.signIn();
    console.log("✅ Sign in successful:", userInfo);

    // Get tokens
    const tokens = await GoogleSignin.getTokens();
    console.log("✅ Got tokens");

    return {
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
      userInfo: userInfo.user,
    };
  } catch (error: any) {
    console.error("❌ Google Sign-In Error:", error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log("User cancelled sign in");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log("Sign in already in progress");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log("Play Services not available");
    } else {
      console.log("Unknown error:", error);
    }

    throw error;
  }
};
```

Then check console logs carefully.

---

## ✅ Summary

| Step | Action                                       |
| ---- | -------------------------------------------- |
| 1    | Run: `cd android && ./gradlew signingReport` |
| 2    | Copy SHA-1 fingerprint                       |
| 3    | Firebase Console → Android App → Add SHA-1   |
| 4    | Verify google-services.json exists           |
| 5    | Run: `npm run android -- --build`            |
| 6    | Test Google Sign-In again                    |

**Most likely solution: Add SHA-1 to Firebase + Rebuild** 🚀
