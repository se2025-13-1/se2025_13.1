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
      const {NotificationModule} = NativeModules;

      if (
        NotificationModule &&
        NotificationModule.showOrderSuccessNotification
      ) {
        await NotificationModule.showOrderSuccessNotification(orderId);
      } else {
        // Fallback
        await NotificationService.showSystemNotification({
          title: '✅ Đặt hàng thành công',
          message: `Đơn hàng #${orderId} của bạn đã được tạo thành công!`,
          channelId: 'order_notifications',
          color: '#4CAF50',
        });
      }
    } catch (error) {
      console.error('Error showing order success notification:', error);
      Alert.alert(
        'Đặt hàng thành công',
        `Đơn hàng #${orderId} của bạn đã được tạo thành công!`,
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
