# 🔥 Google Firebase Sign-Up Plan & Flow

## 📊 Architecture Overview

```
┌─────────────────┐
│  React Native   │
│  Mobile App     │
└────────┬────────┘
         │ 1. User clicks "Sign in with Google"
         │
         ├─────────────────────────────────────────────┐
         │                                             │
         ↓                                             ↓
┌────────────────────┐                    ┌────────────────────┐
│ @react-native-     │                    │  Google Sign-In    │
│ google-signin      │                    │  (3rd party lib)   │
└────────┬───────────┘                    └────────┬───────────┘
         │ 2. Get ID Token                         │
         └──────────────┬────────────────────────┬──┘
                        │                        │
                        ↓                        ↓
                   ┌─────────────────────────────────┐
                   │   Firebase Admin SDK            │
                   │   (Backend Verification)        │
                   │   ├─ Verify ID Token            │
                   │   ├─ Extract User Claims        │
                   │   └─ Get email, name, picture   │
                   └──────────────┬──────────────────┘
                                  │ 3. Token verified ✅
                                  ↓
                        ┌──────────────────────┐
                        │  Backend (Node.js)   │
                        │  /api/auth/firebase  │
                        │  ├─ Check user exist │
                        │  ├─ Create new user  │
                        │  ├─ Link Firebase ID │
                        │  └─ Return JWT token │
                        └──────────┬───────────┘
                                   │ 4. JWT token
                                   ↓
                        ┌──────────────────────┐
                        │  Mobile App          │
                        │  ├─ Save JWT Token   │
                        │  ├─ Save User Info   │
                        │  └─ Login Success ✅ │
                        └──────────────────────┘
```

---

## 🔄 Flow Chi Tiết: Lần Đầu Đăng Ký Google

### **Phase 1: Frontend - Initiate Google Sign-In**

```typescript
// mobile/src/services/firebaseGoogleService.ts

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { tokenService } from "./tokenService";

export const FirebaseGoogleService = {
  async signUpWithGoogle() {
    try {
      // Step 1: Configure Google Sign-In (one time)
      GoogleSignin.configure({
        webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
        offlineAccess: false,
      });

      // Step 2: Check if user has Play Services
      await GoogleSignin.hasPlayServices();

      // Step 3: Open Google Sign-In UI
      const userInfo = await GoogleSignin.signIn();

      // userInfo = {
      //   user: { id, email, name, givenName, familyName, photo },
      //   idToken: "eyJhbGciOiJSUzI1NiIs...",
      //   serverAuthCode: null (offline access disabled)
      // }

      // Step 4: Send idToken to backend
      const result = await this.verifyWithBackend(userInfo.idToken);

      // Step 5: Save JWT tokens from backend
      await tokenService.saveAccessToken(result.accessToken);
      await tokenService.saveRefreshToken(result.refreshToken);

      // Step 6: Save user info locally
      await AsyncStorage.setItem("user", JSON.stringify(result.user));

      return result.user;
    } catch (error) {
      console.error("Google Sign-Up Error:", error);
      throw error;
    }
  },

  async verifyWithBackend(idToken) {
    const response = await fetch("http://localhost:3000/api/auth/firebase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
    // Expected response:
    // {
    //   user: { id, email, full_name, avatar_url, role },
    //   accessToken: "...",
    //   refreshToken: "..."
    // }
  },

  // Later: Sign out
  async signOut() {
    try {
      await GoogleSignin.signOut();
      await tokenService.clearTokens();
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  },
};
```

---

### **Phase 2: Backend - Verify Firebase ID Token**

```javascript
// backend/src/modules/auth/auth.controller.js

export const AuthController = {
  // ... existing methods ...

  // NEW: Firebase Google Sign-Up/Login
  async firebaseGoogle(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: "Missing idToken" });
      }

      const result = await AuthService.verifyFirebaseGoogle(idToken);
      return res.status(201).json(result);
    } catch (err) {
      console.error("Firebase verification error:", err);
      return res.status(401).json({
        error: err.message || "Firebase verification failed",
      });
    }
  },
};
```

---

### **Phase 3: Backend - Firebase Admin SDK Verification**

```javascript
// backend/src/config/firebase.js

import admin from "firebase-admin";

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAdmin = admin;
export const firebaseAuth = admin.auth();
```

```javascript
// backend/src/modules/auth/auth.service.js

import { firebaseAuth } from "../../config/firebase.js";
import { AuthRepository } from "./auth.repository.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

export const AuthService = {
  // ... existing methods ...

  // NEW: Verify Firebase Google ID Token
  async verifyFirebaseGoogle(idToken) {
    try {
      // Step 1: Verify ID Token with Firebase
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);

      // Step 2: Extract user info from decoded token
      const { uid, email, name, picture } = decodedToken;

      if (!email) {
        throw new Error("Email not provided by Google account");
      }

      // Step 3: Check if user already exists by Firebase UID
      const existingUser = await AuthRepository.findByFirebaseUid(uid);

      if (existingUser) {
        // User already registered - just login
        const tokens = generateTokens(existingUser);
        return { user: existingUser, ...tokens };
      }

      // Step 4: Check if email already exists (from local auth)
      const userWithEmail = await AuthRepository.findByEmail(email);

      let user;
      if (userWithEmail) {
        // Email exists from local auth - link Firebase to existing user
        user = userWithEmail;
        await AuthRepository.linkFirebaseUid(user.id, uid);
      } else {
        // New user - Create with Firebase info
        user = await AuthRepository.createUserFromFirebase({
          firebaseUid: uid,
          email,
          fullName: name || "Google User",
          avatarUrl: picture || null,
        });
      }

      // Step 5: Generate JWT tokens
      const tokens = generateTokens(user);

      // Step 6: Return response
      return { user, ...tokens };
    } catch (error) {
      if (error.code === "auth/id-token-expired") {
        throw new Error("Google ID Token expired");
      }
      if (error.code === "auth/id-token-revoked") {
        throw new Error("Google ID Token revoked");
      }
      if (error.code === "auth/invalid-id-token") {
        throw new Error("Invalid Google ID Token");
      }
      throw error;
    }
  },
};
```

---

### **Phase 4: Backend - Database Operations**

```javascript
// backend/src/modules/auth/auth.repository.js

export const AuthRepository = {
  // ... existing methods ...

  // NEW: Find user by Firebase UID
  async findByFirebaseUid(firebaseUid) {
    const query = `
      SELECT 
        u.id, u.email, u.role,
        p.full_name, p.avatar_url, p.gender, p.birthday, p.phone,
        (
          SELECT json_agg(json_build_object(
            'id', a.id,
            'recipient_name', a.recipient_name,
            'phone', a.recipient_phone,
            'full_address', a.address_detail || ', ' || a.ward || ', ' || a.district || ', ' || a.province,
            'province', a.province,
            'district', a.district,
            'ward', a.ward,
            'is_default', a.is_default
          ))
          FROM user_addresses a
          WHERE a.user_id = u.id
        ) as addresses
      FROM auth_users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN auth_providers ap ON u.id = ap.user_id
      WHERE ap.provider = 'firebase' AND ap.provider_user_id = $1
      LIMIT 1
    `;
    const res = await pgPool.query(query, [firebaseUid]);
    return res.rows[0];
  },

  // NEW: Link Firebase UID to existing user
  async linkFirebaseUid(userId, firebaseUid) {
    const query = `
      INSERT INTO auth_providers (user_id, provider, provider_user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (provider, provider_user_id) 
      DO UPDATE SET user_id = $1
      RETURNING id, user_id, provider, provider_user_id
    `;
    const res = await pgPool.query(query, [userId, "firebase", firebaseUid]);
    return res.rows[0];
  },

  // NEW: Create user from Firebase info
  async createUserFromFirebase({
    firebaseUid,
    email,
    fullName,
    avatarUrl = null,
    role = "customer",
  }) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      // Insert into auth_users (no password_hash for Firebase users)
      const userRes = await client.query(
        `INSERT INTO auth_users (email, password_hash, role, is_active) 
         VALUES ($1, NULL, $2, true) 
         RETURNING id, email, role`,
        [email, role]
      );
      const newUser = userRes.rows[0];

      // Insert into user_profiles
      await client.query(
        `INSERT INTO user_profiles (user_id, full_name, avatar_url) 
         VALUES ($1, $2, $3)`,
        [newUser.id, fullName, avatarUrl]
      );

      // Insert into auth_providers (link Firebase)
      await client.query(
        `INSERT INTO auth_providers (user_id, provider, provider_user_id) 
         VALUES ($1, $2, $3)`,
        [newUser.id, "firebase", firebaseUid]
      );

      await client.query("COMMIT");

      return {
        ...newUser,
        full_name: fullName,
        avatar_url: avatarUrl,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
```

---

### **Phase 5: Backend - Add Firebase Route**

```javascript
// backend/src/modules/auth/auth.routes.js

import express from "express";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Auth Local
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Auth Firebase (NEW)
router.post("/firebase", AuthController.firebaseGoogle);

// Protected
router.get("/me", requireAuth, AuthController.getMe);
router.put("/profile", requireAuth, AuthController.updateProfile);

// Password Management
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

export default router;
```

---

## 📱 Mobile App Integration

```typescript
// mobile/src/modules/auth/LoginScreen.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { FirebaseGoogleService } from "../../services/firebaseGoogleService";
import { AuthContext } from "../../contexts/AuthContext";

export const LoginScreen = ({ navigation }) => {
  const { setUser, setIsAuthenticated } = React.useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const user = await FirebaseGoogleService.signUpWithGoogle();
      setUser(user);
      setIsAuthenticated(true);
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Shopping App</Text>

      <TouchableOpacity
        style={styles.emailButton}
        onPress={() => navigation.navigate("EmailLogin")}
      >
        <Text style={styles.buttonText}>Sign In with Email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
```

---

## 💾 Database Schema Changes

### Update `auth_providers` table to track Firebase

```sql
-- Already exists, just use it:
CREATE TABLE auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'firebase', 'google', 'facebook'
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

-- Example data:
-- provider='firebase' + provider_user_id='firebase_uid_123'
-- This uniquely identifies the user across Firebase and our app
```

---

## 🔐 Security Considerations

### 1. **ID Token Verification**

```
✅ Always verify ID Token on backend
❌ Never trust client-side verification
✅ Use Firebase Admin SDK (official verification)
❌ Don't manually parse JWT on backend
```

### 2. **Token Validation**

- ✅ Check `aud` (Audience) matches your Firebase Project ID
- ✅ Check `iss` (Issuer) is from Google
- ✅ Check `exp` (Expiration) - Firebase handles this
- ✅ Check `email_verified` field if available

### 3. **HTTPS Only**

```javascript
// Ensure all API calls use HTTPS in production
if (process.env.NODE_ENV === "production") {
  // Only accept HTTPS requests
}
```

### 4. **Firebase Security Rules** (optional)

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## ⚙️ Firebase Setup Checklist

### Step 1: Create Firebase Project

```bash
# Go to console.firebase.google.com
# Create new project: "E-Commerce Shopping App"
# Enable Authentication
# Enable Google Sign-In provider
```

### Step 2: Get Firebase Configuration

```javascript
// From Firebase Console > Project Settings
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ecommerce-app.firebaseapp.com",
  projectId: "ecommerce-app",
  storageBucket: "ecommerce-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

### Step 3: Get Service Account Key

```bash
# Firebase Console > Project Settings > Service Accounts
# Generate new private key (JSON)
# Set as environment variable:
# FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### Step 4: Setup Web Client ID

```bash
# Firebase Console > Authentication > Google > Web SDK configuration
# Get "Web Client ID"
# Add to mobile app configuration:
# webClientId: "123456789-abc...apps.googleusercontent.com"
```

### Step 5: Install Dependencies

**Backend:**

```bash
npm install firebase-admin
```

**Mobile:**

```bash
npm install @react-native-google-signin/google-signin
npx pod-install ios  # For iOS
```

---

## 🔄 Flow Diagram: Lần Thứ 2 Đăng Nhập (Firebase)

```
User opens app → Clicks "Sign in with Google"
    ↓
Firebase SDK returns ID Token (same Google account)
    ↓
Backend verifies token with Firebase Admin SDK
    ↓
Backend checks auth_providers table
    ↓ Found! (firebase, provider_user_id='firebase_uid_123')
    ↓
Get associated user from auth_users
    ↓
Generate JWT token
    ↓
Return user + JWT to mobile
    ↓
User logged in ✅
(No new user created - just login)
```

---

## 🚀 Implementation Order

1. ✅ **Setup Firebase Project** (console.firebase.google.com)
2. ✅ **Backend**: Configure Firebase Admin SDK
3. ✅ **Backend**: Add `firebaseGoogle()` controller method
4. ✅ **Backend**: Add `verifyFirebaseGoogle()` service method
5. ✅ **Backend**: Add repository methods (findByFirebaseUid, linkFirebaseUid, createUserFromFirebase)
6. ✅ **Backend**: Add `/api/auth/firebase` route
7. ✅ **Mobile**: Setup @react-native-google-signin
8. ✅ **Mobile**: Create FirebaseGoogleService
9. ✅ **Mobile**: Add Google sign-in button to LoginScreen
10. ✅ **Test**: End-to-end flow

---

## 📝 API Endpoint

### **POST /api/auth/firebase**

**Request:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5NWUxYTIzMjg..."
}
```

**Response (Success - New User):**

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

**Response (Success - Existing User):**

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

**Response (Error):**

```json
{
  "error": "Google ID Token expired"
}
```

---

## ✅ Benefits of This Approach

| Aspect                 | Benefit                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| **Security**           | Firebase Admin SDK ensures cryptographically secure token verification |
| **User Data**          | Automatically get profile info (email, name, avatar) from Google       |
| **Account Linking**    | Same email from local auth can be linked to Firebase account           |
| **Scalability**        | Firebase handles billions of authentication requests                   |
| **Mobile-friendly**    | Uses native Android/iOS Google Sign-In APIs                            |
| **Rate Limiting**      | Firebase provides built-in protection                                  |
| **Session Management** | Can revoke tokens server-side if needed                                |

---

## 🔄 User Scenarios

### Scenario 1: Brand New User (Google Only)

```
1. User signs up with Google
2. New user created in database
3. Firebase UID linked to user
4. JWT tokens returned
5. User logged in ✅
6. Can access all features (address, cart, etc.)
```

### Scenario 2: Existing User (Email) → Adds Google

```
1. User already registered with email: user@gmail.com
2. User tries "Sign in with Google" with same email
3. Backend detects: email exists + Firebase UID is new
4. Firebase UID linked to existing user (No duplicate created!)
5. User logged in ✅
6. User can now use both email + Google to login
```

### Scenario 3: Returning User (Google)

```
1. User signed up with Google before
2. User clicks "Sign in with Google" again
3. Backend finds: Firebase UID already linked
4. Returns existing user + JWT
5. User logged in ✅
```

---

## 🎯 Result

After implementation, users can:

- ✅ Sign up with Google in 1 click
- ✅ Get automatic profile info (name, avatar)
- ✅ Switch between email and Google login seamlessly
- ✅ No more password management hassles
- ✅ Secure Firebase verification on every login
