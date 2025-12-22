import {Alert, NativeModules, Platform} from 'react-native';

interface NotificationOptions {
  title: string;
  message: string;
  channelId?: string;
  smallIcon?: string;
  largeIcon?: string;
  color?: string;
}

export const NotificationService = {
  /**
   * Lấy dãy số đầu tiên từ order ID
   * Ví dụ: "550e8400-e29b-41d4-a716-446655440000" -> "550e8400"
   */
  getOrderIdPrefix: (orderId: string): string => {
    if (!orderId) return 'N/A';
    // Lấy phần đầu tiên (trước dấu gạch ngang đầu tiên) hoặc 8 ký tự đầu
    const prefix = orderId.split('-')[0] || orderId.substring(0, 8);
    return prefix.toUpperCase();
  },

  /**
   * Hiển thị thông báo hệ thống cho Android (Heads-Up Notification)
   * Tương tự thông báo trên Facebook, Instagram, etc.
   *
   * Đặc điểm:
   * - Hiển thị trên đầu màn hình khi ứng dụng chạy
   * - Xuất hiện trong notification shade
   * - Có âm thanh mặc định
   * - Có rung động
   * - Có LED indicator
   *
   * @param options Các tùy chọn thông báo
   */
  showSystemNotification: async (options: NotificationOptions) => {
    try {
      if (Platform.OS === 'android') {
        const {NotificationModule} = NativeModules;

        if (NotificationModule && NotificationModule.showNotification) {
          await NotificationModule.showNotification({
            title: options.title,
            message: options.message,
            channelId: options.channelId || 'order_notifications',
            smallIcon: options.smallIcon || 'ic_launcher',
            largeIcon: options.largeIcon,
            color: options.color || '#E53935',
          });
        } else {
          console.warn(
            'NotificationModule not available, falling back to Alert',
          );
          Alert.alert(options.title, options.message);
        }
      } else if (Platform.OS === 'ios') {
        Alert.alert(options.title, options.message);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      Alert.alert(options.title, options.message);
    }
  },

  /**
   * Hiển thị thông báo khi đặt hàng thành công
   * - Hiển thị ngay trên notification shade
   * - Có âm thanh, rung động, LED
   * - Màu xanh (thành công)
   *
   * @param orderId ID của đơn hàng
   */
  showOrderSuccessNotification: async (orderId: string) => {
    try {
      const orderIdPrefix = NotificationService.getOrderIdPrefix(orderId);

      // Luôn dùng systemNotification để đảm bảo hiển thị prefix đúng
      await NotificationService.showSystemNotification({
        title: '✅ Đặt hàng thành công',
        message: `Đơn hàng #${orderIdPrefix} của bạn đã được tạo thành công!`,
        channelId: 'order_notifications',
        color: '#4CAF50',
      });
    } catch (error) {
      console.error('Error showing order success notification:', error);
      const orderIdPrefix = NotificationService.getOrderIdPrefix(orderId);
      Alert.alert(
        'Đặt hàng thành công',
        `Đơn hàng #${orderIdPrefix} của bạn đã được tạo thành công!`,
      );
    }
  },

  /**
   * Hiển thị thông báo khi đặt hàng thất bại
   * @param errorMessage Thông báo lỗi
   */
  showOrderFailedNotification: async (errorMessage: string) => {
    await NotificationService.showSystemNotification({
      title: '❌ Đặt hàng thất bại',
      message: errorMessage || 'Không thể tạo đơn hàng. Vui lòng thử lại.',
      channelId: 'order_notifications',
      color: '#E53935',
    });
  },

  /**
   * Hủy thông báo hiện tại
   */
  dismissNotification: async () => {
    try {
      const {NotificationModule} = NativeModules;

      if (NotificationModule && NotificationModule.dismissNotification) {
        await NotificationModule.dismissNotification();
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  },
};
