import { NotificationRepository } from "./notification.repository.js";
import { firebaseMessaging } from "../../config/firebase.js";

export const NotificationService = {
  // Hàm quan trọng nhất: Gửi thông báo cho User
  async sendToUser(userId, { title, body, type, data }) {
    try {
      // 1. Lưu vào Database (In-App Notification)
      const notification = await NotificationRepository.create({
        userId,
        title,
        body,
        type,
        data,
      });

      // 2. Lấy danh sách Token của User
      const tokens = await NotificationRepository.getUserTokens(userId);

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

        const response = await firebaseMessaging.sendEachForMulticast(
          fcmPayload
        );

        // 4. Dọn dẹp token chết (Optional nhưng nên làm)
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              // Nếu lỗi là token không hợp lệ -> Xóa khỏi DB
              const errCode = resp.error.code;
              if (
                errCode === "messaging/invalid-registration-token" ||
                errCode === "messaging/registration-token-not-registered"
              ) {
                NotificationRepository.removeDevice(tokens[idx]);
              }
            }
          });
        }
      }

      return notification;
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
