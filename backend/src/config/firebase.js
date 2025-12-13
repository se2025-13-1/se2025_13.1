import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Đường dẫn đến file json bạn vừa tải về
const serviceAccountPath = path.resolve("../../service-account.json");

// Kiểm tra xem file có tồn tại không để tránh crash app
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin Initialized");
} else {
  console.warn(
    "⚠️ Warning: service-account.json not found. Push notifications will not work."
  );
}

export const firebaseMessaging = admin.messaging();
