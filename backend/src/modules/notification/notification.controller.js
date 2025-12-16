import { NotificationService } from "./notification.service.js";

export const NotificationController = {
  // Mobile gọi API này khi mở App để đăng ký token
  async registerDevice(req, res) {
    try {
      const userId = req.user.id;
      const { fcm_token, platform } = req.body;

      if (!fcm_token) return res.status(400).json({ error: "Thiếu fcm_token" });

      await NotificationService.registerDevice(userId, fcm_token, platform);
      return res.json({ message: "Device registered" });
    } catch (err) {
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
