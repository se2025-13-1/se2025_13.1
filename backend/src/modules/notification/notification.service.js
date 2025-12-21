import { NotificationRepository } from "./notifocation.repository.js";
import { firebaseMessaging } from "../../config/firebase.js";

export const NotificationService = {
  // Hàm quan trọng nhất: Gửi thông báo cho User
  async sendToUser(userId, { title, body, type, data }) {
    try {
      console.log("🔔 NotificationService.sendToUser called:", {
        userId,
        title,
        body,
        type,
        data,
      });

      // 1. Thử lưu vào Database (In-App Notification) - nhưng không fail nếu có lỗi
      let notification = null;
      try {
        notification = await NotificationRepository.create({
          userId,
          title,
          body,
          type,
          data,
        });
        console.log("✅ Notification saved to DB");
      } catch (dbError) {
        console.warn(
          "⚠️ Failed to save notification to DB (continuing anyway):",
          dbError.message
        );
        // Tiếp tục với FCM dù DB fail
      }

      // 2. Lấy danh sách Token của User
      const tokens = await NotificationRepository.getUserTokens(userId);
      console.log("📱 Found tokens for user:", {
        userId,
        tokenCount: tokens.length,
        tokens: tokens.map((t) => t.substring(0, 20) + "..."),
      });

      if (tokens.length > 0) {
        // 3. Gửi qua Firebase (Push Notification)
        // Lưu ý: data trong FCM phải là String hết
        const fcmPayload = {
          notification: { title, body },
          data: {
            type: type || "system",
            payload: JSON.stringify(data || {}),
          },
          tokens: tokens,
        };

        console.log("📤 Sending FCM payload:", {
          title,
          body,
          data,
          tokenCount: tokens.length,
        });

        const response = await firebaseMessaging.sendEachForMulticast(
          fcmPayload
        );

        console.log("✅ FCM Response:", {
          successCount: response.successCount,
          failureCount: response.failureCount,
        });

        // 4. Dọn dẹp token chết (Optional nhưng nên làm)
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.warn("❌ FCM Send failed for token:", {
                token: tokens[idx].substring(0, 20) + "...",
                error: resp.error.message,
                code: resp.error.code,
              });

              // Nếu lỗi là token không hợp lệ -> Xóa khỏi DB
              const errCode = resp.error.code;
              if (
                errCode === "messaging/invalid-registration-token" ||
                errCode === "messaging/registration-token-not-registered"
              ) {
                console.log(
                  "🗑️ Removing invalid token:",
                  tokens[idx].substring(0, 20) + "..."
                );
                NotificationRepository.removeDevice(tokens[idx]);
              }
            }
          });
        }
      } else {
        console.warn("⚠️ No tokens found for user:", userId);
      }

      return notification || { title, body, type };
    } catch (err) {
      console.error("❌ Notification Error:", err.message);
      // Không throw error để tránh làm chết luồng chính (ví dụ luồng đặt hàng)
    }
  },

  async registerDevice(userId, token, platform) {
    return await NotificationRepository.registerDevice(userId, token, platform);
  },

  async getMyNotifications(userId, query) {
    const limit = Number(query.limit) || 20;
    const offset = Number(query.page - 1) * limit || 0;

    const [notifications, unreadCount] = await Promise.all([
      NotificationRepository.listByUser(userId, limit, offset),
      NotificationRepository.countUnread(userId),
    ]);

    return { notifications, unread_count: unreadCount };
  },

  async markRead(id, userId) {
    return await NotificationRepository.markAsRead(id, userId);
  },
};
