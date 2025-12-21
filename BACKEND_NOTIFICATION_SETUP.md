# Hướng Dẫn Tích Hợp Thông Báo Đơn Hàng (Backend)

## Tổng Quan

Hệ thống notification sử dụng Firebase Cloud Messaging (FCM) để gửi thông báo cho người dùng. App mobile sẽ nhận notification cả khi đang chạy (foreground), chạy background, hoặc đã bị đóng (terminated).

## Các Endpoint Cần Triển Khai

### 1. Lưu FCM Token Của Người Dùng

**Endpoint**: `POST /api/notifications/device`

**Request**:

```json
{
  "fcm_token": "eSbHpRHkRsKeP8w7zPH...",
  "platform": "android" // hoặc "ios"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Device registered successfully"
}
```

**Implementation (Node.js/Express)**:

```javascript
router.post("/notifications/device", auth, async (req, res) => {
  const { fcm_token, platform } = req.body;
  const user_id = req.user.id;

  try {
    // Lưu token vào database
    await DeviceToken.upsert({
      user_id,
      fcm_token,
      platform,
      last_updated: new Date(),
    });

    res.json({ success: true, message: "Device registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Gửi Notification Khi Đơn Hàng Hoàn Tất

**Khi order status thay đổi thành "completed", gửi notification:**

```javascript
const admin = require("firebase-admin");

async function sendOrderCompletedNotification(orderId, userId) {
  try {
    // Lấy FCM tokens của user
    const deviceTokens = await DeviceToken.findAll({
      where: { user_id: userId },
    });

    if (deviceTokens.length === 0) {
      console.log("No device tokens found for user:", userId);
      return;
    }

    const tokens = deviceTokens.map((dt) => dt.fcm_token);

    // Chuẩn bị message
    const message = {
      notification: {
        title: "📦 Đơn hàng hoàn tất",
        body: `Đơn hàng #${orderId} của bạn đã hoàn tất!`,
      },
      data: {
        order_id: orderId,
        status: "completed",
        notification_type: "order_status_update",
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "order_notifications",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    // Gửi đến tất cả devices của user
    const response = await admin.messaging().sendMulticast({
      ...message,
      tokens: tokens,
    });

    console.log(`Sent ${response.successCount} notifications`);

    // Log errors nếu có
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to ${tokens[idx]}:`, resp.error);
          // Có thể xóa token này nếu lỗi "registration token is invalid"
        }
      });
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
```

### 3. Gửi Notification Khi Đơn Hàng Được Vận Chuyển

```javascript
async function sendOrderShippedNotification(orderId, userId) {
  try {
    const deviceTokens = await DeviceToken.findAll({
      where: { user_id: userId },
    });

    if (deviceTokens.length === 0) return;

    const tokens = deviceTokens.map((dt) => dt.fcm_token);

    const message = {
      notification: {
        title: "🚚 Đơn hàng đang vận chuyển",
        body: `Đơn hàng #${orderId} của bạn đang trên đường đến bạn!`,
      },
      data: {
        order_id: orderId,
        status: "shipped",
        notification_type: "order_shipped",
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "order_notifications",
        },
      },
    };

    await admin.messaging().sendMulticast({
      ...message,
      tokens: tokens,
    });
  } catch (error) {
    console.error("Error sending shipment notification:", error);
  }
}
```

## Cấu Hình Firebase Admin SDK

```javascript
const admin = require("firebase-admin");
const serviceAccount = require("./path-to-your-service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "your-project-id",
});
```

## Database Schema (Lưu FCM Token)

```sql
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fcm_token VARCHAR(500) NOT NULL UNIQUE,
  platform VARCHAR(50), -- 'android' or 'ios'
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index để tìm kiếm nhanh
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
```

## Kích Hoạt Notification Khi Order Status Thay Đổi

**Trong Order update endpoint hoặc order status webhook:**

```javascript
// Trong route update order status
router.patch("/orders/:id/status", auth, async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  try {
    const order = await Order.findByPk(orderId);

    order.status = status;
    await order.save();

    // 🔔 Gửi notification dựa trên status
    if (status === "completed") {
      await sendOrderCompletedNotification(orderId, order.user_id);
    } else if (status === "shipped") {
      await sendOrderShippedNotification(orderId, order.user_id);
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Các Notification Type Hỗ Trợ

| Type                  | Status     | Mô Tả                 |
| --------------------- | ---------- | --------------------- |
| `order_status_update` | completed  | Đơn hàng hoàn tất     |
| `order_shipped`       | shipped    | Đơn hàng vân chuyển   |
| (Mở rộng)             | pending    | Đơn hàng chờ xác nhận |
| (Mở rộng)             | processing | Đơn hàng đang xử lý   |

## Payload Notification Mẫu (Full)

```json
{
  "notification": {
    "title": "📦 Đơn hàng hoàn tất",
    "body": "Đơn hàng #f139f190-d9e0-48da-b187-c7c31d644771 của bạn đã hoàn tất!"
  },
  "data": {
    "order_id": "f139f190-d9e0-48da-b187-c7c31d644771",
    "status": "completed",
    "notification_type": "order_status_update",
    "timestamp": "2025-12-21T10:30:00Z"
  },
  "android": {
    "priority": "high",
    "notification": {
      "sound": "default",
      "channelId": "order_notifications"
    }
  }
}
```

## Testing

### 1. Test gửi notification từ Firebase Console

- Vào [Firebase Console](https://console.firebase.google.com)
- Chọn project
- Vào **Cloud Messaging**
- Tạo campaign để test

### 2. Test từ code

```javascript
// Gửi test notification
const testToken = "eSbHpRHkRsKeP8w7zPH...";

await admin.messaging().send({
  notification: {
    title: "Test Title",
    body: "Test Body",
  },
  data: {
    order_id: "test-123",
    notification_type: "test",
  },
  token: testToken,
});
```

## Troubleshooting

| Lỗi                             | Nguyên Nhân                     | Giải Pháp                              |
| ------------------------------- | ------------------------------- | -------------------------------------- |
| `registration token is invalid` | Token hết hạn hoặc không hợp lệ | Xóa token khỏi DB                      |
| `Mismatched sender ID`          | Firebase config sai             | Kiểm tra Service Account               |
| Notification không hiển thị     | Ứng dụng không có quyền         | Kiểm tra permissions Android/iOS       |
| Notification không âm thanh     | Channel không có sound          | Kiểm tra notification channel cấu hình |

## Ưu Tiên (Priority)

- **high**: Hiển thị ngay lập tức (heads-up)
- **normal**: Hiển thị trong notification shade bình thường

Sử dụng **high** cho order notifications để người dùng nhận biết ngay lập tức.
