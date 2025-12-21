import { NotificationService } from "./notification.service.js";

export const NotificationController = {
  // Mobile gọi API này khi mở App để đăng ký token
  async registerDevice(req, res) {
    try {
      const userId = req.user.id;
      const { fcm_token, platform } = req.body;

      console.log("📱 [NOTIFICATION CONTROLLER] registerDevice called:", {
        userId,
        fcmToken: fcm_token ? fcm_token.substring(0, 20) + "..." : "null",
        platform,
      });

      if (!fcm_token) {
        console.warn("⚠️ [NOTIFICATION CONTROLLER] Missing fcm_token");
        return res.status(400).json({ error: "Thiếu fcm_token" });
      }

      await NotificationService.registerDevice(userId, fcm_token, platform);
      console.log(
        "✅ [NOTIFICATION CONTROLLER] Device registered successfully"
      );
      return res.json({ message: "Device registered" });
    } catch (err) {
      console.error(
        "❌ [NOTIFICATION CONTROLLER] registerDevice error:",
        err.message
      );
      return res.status(500).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const userId = req.user.id;
      const result = await NotificationService.getMyNotifications(
        userId,
        req.query
      );
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async markRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await NotificationService.markRead(id, userId);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
