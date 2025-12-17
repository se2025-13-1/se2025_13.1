import admin from "firebase-admin";

// Initialize Firebase Admin SDK from environment variable
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountKey) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin Initialized");
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error.message);
    process.exit(1);
  }
} else {
  console.error(
    "❌ Error: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set"
  );
  process.exit(1);
}

export const firebaseMessaging = admin.messaging();
export const firebaseAuth = admin.auth();
