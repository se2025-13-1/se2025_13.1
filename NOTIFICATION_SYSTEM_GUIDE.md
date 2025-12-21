# Hệ Thống Notification - Hướng Dẫn Đầy Đủ

## 🎯 Tổng Quan Hệ Thống

Hệ thống thông báo hoạt động 2 chiều:

### 1. **Push Notification từ Backend** (Firebase Cloud Messaging)

- Gửi từ backend khi order status thay đổi
- Hoạt động cả khi app đóng (terminated)
- Có âm thanh, rung động, LED

### 2. **Native Android Notification** (Khi App Mở)

- Hiển thị notification shade đẹp
- Heads-up notification (bật lên đầu màn hình)
- Tích hợp với Android notification system

## 📱 Các Trạng Thái Notification

| Status      | Event                 | Tiêu Đề                     | Màu      |
| ----------- | --------------------- | --------------------------- | -------- |
| `shipping`  | Đặt hàng → Vận chuyển | 🚚 Đơn hàng đang vận chuyển | 🔵 Blue  |
| `completed` | Vận chuyển → Hoàn tất | 📦 Đơn hàng hoàn tất        | 🟢 Green |

## 🔧 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                     │
│  - Order Service → updateOrderStatus()                  │
│  - Notification Service → sendToUser()                  │
│  - Firebase Admin SDK → send FCM Message                │
└────────────────────────┬────────────────────────────────┘
                         │ Firebase Cloud Messaging
                         ▼
┌─────────────────────────────────────────────────────────┐
│              FIREBASE (FCM Infrastructure)              │
│  - Route notifications to devices                       │
│  - Handle offline queuing                               │
└────────────────────────┬────────────────────────────────┘
                         │ Remote Message
                         ▼
┌─────────────────────────────────────────────────────────┐
│              MOBILE APP (React Native)                  │
│  1. Foreground: notificationListener()                  │
│  2. Background: setBackgroundMessageHandler()           │
│  3. Terminated: getInitialNotification()                │
│  - Display Heads-Up + Notification Shade                │
│  - Play sound + vibrate + LED                           │
└─────────────────────────────────────────────────────────┘
```

## 📱 Mobile Implementation

### 1. **Setup (App.tsx)**

```typescript
// Tự động thiết lập background handler
setupBackgroundMessageHandler();

// Lắng nghe notification tap
setupNotificationTapListener((remoteMessage) => {
  // Xử lý khi user tap vào notification
});

// Khi user đăng nhập
const hasPermission = await requestUserPermission();
if (hasPermission) {
  await getFCMToken(userToken); // Gửi FCM token lên backend
}
```

### 2. **Notification Service (`notificationService.ts`)**

Cung cấp 3 hàm chính:

```typescript
// Hiển thị notification khi app đang chạy
await NotificationService.showSystemNotification({
  title: "...",
  message: "...",
  color: "#...",
});

// Hiển thị notification đơn hàng thành công
await NotificationService.showOrderSuccessNotification(orderId);

// Hiển thị notification đơn hàng thất bại
await NotificationService.showOrderFailedNotification(errorMsg);
```

### 3. **Firebase Messaging Service** (`notificationService.ts` - notification module)

Xử lý 3 trường hợp:

```typescript
1. Foreground (App đang chạy)
   ↓
   onMessage() → handleFirebaseNotification()
   ↓
   Hiển thị notification native

2. Background (App chạy nền)
   ↓
   setBackgroundMessageHandler() → handleFirebaseNotification()
   ↓
   Hiển thị notification native

3. Terminated (App bị đóng)
   ↓
   getInitialNotification() → xử lý khi user tap
   ↓
   Navigate đến order detail
```

## 🚀 Backend Implementation

### 1. **Lưu FCM Token**

Khi user đăng nhập, mobile gửi:

```
POST /api/notifications/device
{
  "fcm_token": "eSbHpRHk...",
  "platform": "android"
}
```

Backend lưu vào table `device_tokens`:

```sql
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  fcm_token VARCHAR(500) UNIQUE,
  platform VARCHAR(50),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2. **Gửi Notification Khi Order Completed**

Trong `order.service.js`:

```javascript
async updateOrderStatus(orderId, status) {
  const result = await OrderRepository.updateStatus(orderId, status);

  // Gửi notification
  if (status === "completed") {
    await NotificationService.sendToUser(userId, {
      title: "📦 Đơn hàng hoàn tất",
      body: `Đơn hàng #${orderId} của bạn đã hoàn tất!`,
      type: "order_status_update",
      data: {
        order_id: orderId,
        status: "completed",
        notification_type: "order_status_update"
      }
    });
  }

  return result;
}
```

### 3. **Firebase Admin Setup**

```javascript
import admin from "firebase-admin";
import serviceAccount from "./service-account-key.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();
```

## 🔐 Quyền Cần Thiết

### Android (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS (Info.plist)

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

## 🧪 Testing

### Test Local

**1. Start App trên Device/Emulator**

```bash
npx react-native run-android
```

**2. Verify FCM Token được gửi**

- Xem logs: `FCM Token: eSbHpRHk...`
- Kiểm tra database: `SELECT * FROM device_tokens WHERE user_id = '...'`

**3. Test Notification**

Gọi API backend:

```bash
curl -X PATCH http://localhost:3000/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"status": "completed"}'
```

**4. Kiểm tra:**

- ✅ Notification hiển thị trên notification shade
- ✅ Âm thanh phát
- ✅ Điện thoại rung
- ✅ LED nhấp nháy

### Test Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Chọn project
3. **Cloud Messaging** → **New Campaign**
4. Tạo message test

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Admin Dashboard                        │
│             (Cập nhật Order Status)                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼ PATCH /api/orders/{id}/status
┌─────────────────────────────────────────────────────────┐
│              ORDER SERVICE (Backend)                    │
│          updateOrderStatus(id, 'completed')             │
│  ├─ Update Database                                     │
│  └─ Call NotificationService.sendToUser()               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼ NotificationService.sendToUser()
┌─────────────────────────────────────────────────────────┐
│         NOTIFICATION SERVICE (Backend)                  │
│  1. Save to DB (In-app notification)                    │
│  2. Get user's FCM tokens                               │
│  3. Send via Firebase Admin SDK                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼ admin.messaging().sendEachForMulticast()
┌─────────────────────────────────────────────────────────┐
│           FIREBASE CLOUD MESSAGING                      │
└────────────────┬────────────────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
┌─────────┐┌─────────┐┌─────────┐
│ Android ││  Apple  ││   Web   │
│ Devices ││  Devices││Clients  │
└────┬────┘└────┬────┘└────┬────┘
     │          │          │
     ▼ (3 cases)▼          ▼
   ┌──────────────────────────┐
   │ 1. Foreground            │ ✅ Hiển thị ngay
   │ 2. Background            │ ✅ Hiển thị ngay
   │ 3. Terminated            │ ✅ Hiển thị ngay
   └──────────────────────────┘
        │
        ▼ Notification Shade
   ┌──────────────────────────┐
   │ 📦 Đơn hàng hoàn tất     │
   │ Đơn hàng #f139f190...   │
   │ đã hoàn tất!             │
   │ ────────────────────     │
   │ 🔊 Sound                 │
   │ 📳 Vibration             │
   │ 💡 LED Blink (🟢 Green) │
   └──────────────────────────┘
```

## 🎯 Các Đặc Tính Chính

### ✅ Hoàn Thành

- [x] FCM integration
- [x] Notification handler (3 states)
- [x] Native Android notification
- [x] Heads-up notification
- [x] Sound + Vibration + LED
- [x] Backend notification service
- [x] Order status → Notification

### 📋 Có Thể Mở Rộng

- [ ] Notification history in-app
- [ ] Notification preferences/settings
- [ ] Rich notifications (images)
- [ ] Actionable notifications (buttons)
- [ ] Notification analytics

## 🐛 Troubleshooting

### Notification không hiển thị

**Kiểm tra:**

1. FCM token được gửi? `SELECT * FROM device_tokens`
2. Backend gửi notification? `console.log` trong NotificationService
3. Firebase config đúng? Kiểm tra `google-services.json`
4. Quyền Android? Kiểm tra AndroidManifest.xml

### Âm thanh/Rung không hoạt động

**Solution:**

1. Kiểm tra notification channel: `order_notifications`
2. Device settings: Settings → Sound & Vibration
3. App notification settings: Bật `Allow notifications`

### Token không hợp lệ

```
Error: messaging/invalid-registration-token
```

**Giải pháp:**

- Token hết hạn → Xóa khỏi DB
- App reinstall → Token cũ không còn hợp lệ
- Firebase config thay đổi → Lấy token mới

## 📚 Tài Liệu Tham Khảo

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)
- [Android Notification](https://developer.android.com/develop/ui/views/notifications)
- [NotificationCompat](https://developer.android.com/reference/androidx/core/app/NotificationCompat)
