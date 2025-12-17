# Firebase Google Sign-In Setup - Complete ✅

## 📊 Setup Status

| Step | Status  | Component                                      |
| ---- | ------- | ---------------------------------------------- |
| 1    | ✅ DONE | Firebase Project Created (se2025-44d9c)        |
| 2    | ✅ DONE | Google Authentication Enabled                  |
| 3    | ✅ DONE | Service Account Key Generated                  |
| 4    | ✅ DONE | Backend .env configured                        |
| 5    | ✅ DONE | Web Client ID obtained                         |
| 6    | ✅ DONE | Mobile .env created                            |
| 7    | ✅ DONE | FirebaseGoogleService created                  |
| 8    | ✅ DONE | Google Web Client ID updated in mobile service |

---

## 🔑 Configuration Files

### Backend (.env)

```
File: docker/.env
✅ FIREBASE_SERVICE_ACCOUNT_KEY added
   - Project ID: se2025-44d9c
   - Contains: private_key, client_email, etc.
```

### Mobile (.env)

```
File: mobile/.env
✅ GOOGLE_WEB_CLIENT_ID=790984624622-he9b234vc0r0uj08k9l9bmt7gp4gvic8.apps.googleusercontent.com
✅ FIREBASE_PROJECT_ID=se2025-44d9c
✅ BACKEND_URL=http://10.0.2.2:3000
```

---

## 📱 Mobile Services

### FirebaseGoogleService

```
File: mobile/src/services/firebaseGoogleService.ts
Methods:
  ✅ initialize() - Setup Google Sign-In config
  ✅ signUpWithGoogle() - Main sign-in flow
  ✅ verifyWithBackend() - Send ID token to backend
  ✅ getCurrentUser() - Get signed-in user
  ✅ signOut() - Sign out user
  ✅ revokeAccess() - Revoke Google access
```

### GoogleService (Updated)

```
File: mobile/src/services/googleService.ts
✅ Updated Web Client ID to: 790984624622-he9b234vc0r0uj08k9l9bmt7gp4gvic8.apps.googleusercontent.com
```

---

## 🔧 Backend Implementation

### Config

```
File: backend/src/config/firebase.js
✅ firebaseAuth exported for token verification
```

### Controller

```
File: backend/src/modules/auth/auth.controller.js
✅ firebaseGoogle() - Handle POST /api/auth/firebase
```

### Service

```
File: backend/src/modules/auth/auth.service.js
✅ verifyFirebaseGoogle() - Verify ID token and create/login user
```

### Repository

```
File: backend/src/modules/auth/auth.repository.js
✅ findByFirebaseUid() - Find user by Firebase UID
✅ linkFirebaseUid() - Link Firebase UID to user
✅ createUserFromFirebase() - Create new user from Firebase info
```

### Route

```
File: backend/src/modules/auth/auth.routes.js
✅ POST /api/auth/firebase - Google Firebase endpoint
```

---

## 🚀 Flow Diagram

```
Mobile App
    ↓
1. User clicks "Sign in with Google"
    ↓
2. GoogleSignin.signIn() - Open Google Sign-In UI
    ↓
3. Get ID Token from Google
    ↓
4. POST /api/auth/firebase { idToken }
    ↓
Backend (Firebase Verification)
    ↓
5. firebaseAuth.verifyIdToken(idToken)
    ↓
6. Extract: email, name, picture, firebase_uid
    ↓
7. Check if user exists by Firebase UID
    ├─ YES: Return existing user + JWT
    └─ NO: Create new user + JWT
    ↓
8. Return { user, accessToken, refreshToken }
    ↓
Mobile App
    ↓
9. Save tokens in AsyncStorage
    ↓
10. User logged in ✅
```

---

## 📋 To Run / Test

### 1. Start Backend

```bash
cd backend
npm install  # if not done
npm start    # or npm run dev
```

### 2. Start Mobile Dev Server

```bash
cd mobile
npm start
```

### 3. Test on Android Emulator

```bash
# Terminal 1: Start React Native bundler
npm start

# Terminal 2: Run Android
npm run android
```

### 4. Test Sign-In

- Open app
- Click "Sign in with Google"
- Select Google account
- Should automatically redirect to home
- Check console for logs

---

## ✅ What Auto-Creates

When user signs in with Google for first time:

```javascript
// Database Auto-Created:

// 1. auth_users
{
  id: 'uuid-123',
  email: 'user@gmail.com',
  password_hash: NULL,  // No password for Google users
  role: 'customer',
  is_active: TRUE
}

// 2. user_profiles
{
  user_id: 'uuid-123',
  full_name: 'Nguyễn Văn A',
  avatar_url: 'https://lh3.googleusercontent.com/...',
  gender: NULL,
  birthday: NULL,
  phone: NULL
}

// 3. auth_providers
{
  user_id: 'uuid-123',
  provider: 'firebase',
  provider_user_id: 'firebase_uid_xxxxx',
  access_token: NULL
}
```

---

## 🔒 Security

- ✅ ID Token verified on backend with Firebase Admin SDK
- ✅ No client-side token storage (only JWT)
- ✅ Firebase credentials in .env (not in code)
- ✅ Service account key kept secret
- ✅ Web Client ID can be public (not secret)

---

## 🆘 Troubleshooting

### "Firebase not initialized"

```
Check: FIREBASE_SERVICE_ACCOUNT_KEY in .env
Format must be: JSON as single line
```

### "Google Sign-In failed"

```
Check:
- @react-native-google-signin/google-signin installed
- Web Client ID correct in googleService.ts
- Play Services enabled on device
```

### "Backend verification failed"

```
Check:
- Backend running on http://10.0.2.2:3000
- Firebase Service Account Key valid
- Network connection working
```

### "User created but no profile data"

```
Fixed: createUserFromFirebase() creates profile automatically
```

---

## 📦 Dependencies

### Backend

- ✅ firebase-admin (already installed)

### Mobile

- ✅ @react-native-google-signin/google-signin (already installed)

---

## 🎯 Next Steps (Optional)

1. **Add "Sign in with Google" button to LoginScreen**

   - Already exists via `handleGoogleSignIn()`
   - Just use `FirebaseGoogleService.signUpWithGoogle()`

2. **Add profile completion flow**

   - After first login, ask for phone number
   - Allow user to update profile

3. **Add account linking**

   - Allow user to link email + Google to same account

4. **Add logout button**
   - Use `FirebaseGoogleService.signOut()`

---

## 📞 API Endpoint

### POST /api/auth/firebase

**Request:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5NWUxYTIzMjg..."
}
```

**Response (New User):**

```json
{
  "user": {
    "id": "uuid-123",
    "email": "user@gmail.com",
    "full_name": "Nguyễn Văn A",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "role": "customer",
    "addresses": []
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Existing User):**

```json
{
  "user": {
    "id": "uuid-123",
    "email": "user@gmail.com",
    "full_name": "Nguyễn Văn A",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "role": "customer",
    "addresses": [...]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🎉 Summary

**Tất cả setup đã hoàn thành!**

- ✅ Firebase Project created
- ✅ Google Authentication enabled
- ✅ Backend Firebase config added
- ✅ Backend endpoints implemented
- ✅ Mobile environment configured
- ✅ Mobile services created
- ✅ Google Sign-In ready to use

**Chỉ cần bắt đầu backend + mobile app là có thể test!** 🚀
