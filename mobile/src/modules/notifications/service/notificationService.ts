import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid, NativeModules, Alert} from 'react-native';
import {NotificationService} from '../../../services/notificationService';

// 👇 Thay bằng IP máy tính của bạn (VD: 192.168.1.5)
// Nếu chạy máy ảo Android Emulator thì dùng: 10.0.2.2
const BACKEND_URL = 'http://10.0.2.2:3000/api';

export const requestUserPermission = async () => {
  console.log(
    '🔔 requestUserPermission called, Platform:',
    Platform.OS,
    'Version:',
    Platform.Version,
  );

  // 1. Xin quyền cho Android 13+ (API 33+)
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    console.log('🔔 Requesting POST_NOTIFICATIONS for Android 13+');
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    console.log('🔔 Android notification permission result:', granted);
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn('❌ Quyền thông báo bị từ chối');
      return false;
    }
  }

  // 2. Xin quyền cho iOS (và Android cũ)
  console.log('🔔 Calling messaging().requestPermission()');
  const authStatus = await messaging().requestPermission();
  console.log('🔔 Firebase requestPermission result:', authStatus);

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  console.log('🔔 Final permission enabled:', enabled);
  if (enabled) {
    console.log('✅ Notification permission granted');
    return true;
  }
  console.warn('❌ Notification permission not enabled');
  return false;
};

export const getFCMToken = async (userToken: string) => {
  try {
    console.log('🔥 getFCMToken called');
    // Lấy token từ Firebase
    const fcmToken = await messaging().getToken();
    console.log(
      '🔥 messaging().getToken() returned:',
      fcmToken ? '✅ token' : '❌ null',
    );

    if (fcmToken) {
      console.log('🔥 FCM Token:', fcmToken);

      // Gửi về Backend để lưu
      await registerTokenToBackend(fcmToken, userToken);
    } else {
      console.warn('⚠️ Không lấy được FCM token');
    }
  } catch (error) {
    console.error('❌ Lỗi lấy FCM token:', error);
  }
};

const registerTokenToBackend = async (fcmToken: string, userToken: string) => {
  try {
    console.log('📤 Gửi FCM token lên backend:', {
      fcmToken: fcmToken.substring(0, 20) + '...',
      platform: Platform.OS,
    });

    const response = await fetch(`${BACKEND_URL}/notifications/device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`, // Token đăng nhập của user
      },
      body: JSON.stringify({
        fcm_token: fcmToken,
        platform: Platform.OS,
      }),
    });

    console.log('📤 Response status:', response.status);

    if (!response.ok) {
      const responseText = await response.text();
      console.error(
        '❌ Backend error (status ' + response.status + '):',
        responseText.substring(0, 200),
      );
      return;
    }

    const data = await response.json();
    console.log('✅ Đã gửi token lên server thành công:', {
      response: data,
      status: response.status,
    });

    if (!response.ok) {
      console.error('❌ Backend error:', data);
    }
  } catch (error) {
    console.error('❌ Lỗi gửi token lên server:', error);
  }
};

/**
 * Xử lý notification từ Firebase
 * @param remoteMessage Tin nhắn từ Firebase Cloud Messaging
 */
const handleFirebaseNotification = async (remoteMessage: any) => {
  try {
    const {title, body} = remoteMessage.notification || {};
    const {order_id, status, notification_type} = remoteMessage.data || {};

    console.log('📬 Xử lý notification:', {
      title,
      body,
      order_id,
      status,
      notification_type,
    });

    // 🔄 Clear order cache để force refresh dữ liệu mới
    if (
      notification_type === 'order_status_update' ||
      notification_type === 'order_shipped'
    ) {
      const {cacheService} = require('../../../services/cacheService');
      cacheService.clearByPrefix('user_orders');
      cacheService.clearByPrefix('user_order');
      console.log('✅ Cleared order cache - sẽ refresh dữ liệu mới');
    }

    // Xử lý notification dựa trên loại
    if (notification_type === 'order_status_update' && status === 'completed') {
      // Thông báo đơn hàng hoàn tất
      await NotificationService.showSystemNotification({
        title: title || '📦 Đơn hàng hoàn tất',
        message: body || `Đơn hàng #${order_id} của bạn đã hoàn tất!`,
        channelId: 'order_notifications',
        color: '#4CAF50',
      });
    } else if (notification_type === 'order_shipped') {
      // Thông báo đơn hàng đã vận chuyển
      await NotificationService.showSystemNotification({
        title: title || '🚚 Đơn hàng đang vận chuyển',
        message:
          body || `Đơn hàng #${order_id} của bạn đang trên đường đến bạn!`,
        channelId: 'order_notifications',
        color: '#2196F3',
      });
    } else {
      // Thông báo chung
      await NotificationService.showSystemNotification({
        title: title || 'Thông báo',
        message: body || 'Bạn có một thông báo mới',
        channelId: 'order_notifications',
        color: '#E53935',
      });
    }
  } catch (error) {
    console.error('Lỗi xử lý notification:', error);
  }
};

// Lắng nghe thông báo khi App đang mở (Foreground)
export const notificationListener = () => {
  console.log('🔔 Setting up foreground notification listener...');
  return messaging().onMessage(async remoteMessage => {
    console.log(
      '📩 ✅ Nhận thông báo FOREGROUND:',
      JSON.stringify(remoteMessage, null, 2),
    );
    await handleFirebaseNotification(remoteMessage);
  });
};

/**
 * Thiết lập Background Message Handler
 * IMPORTANT: Phải được gọi TRƯỚC khi messaging().onMessage
 * Hàm này sẽ được gọi cả khi app bị đóng
 */
export const setupBackgroundMessageHandler = () => {
  console.log('🔔 Setting up background message handler...');
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log(
      '📩 ✅ Nhận thông báo BACKGROUND/TERMINATED:',
      JSON.stringify(remoteMessage, null, 2),
    );
    await handleFirebaseNotification(remoteMessage);
  });
};

/**
 * Lắng nghe sự kiện tap vào notification khi app bị đóng
 * Được gọi khi user tap vào notification từ notification shade
 */
export const setupNotificationTapListener = (
  onNotificationTap: (remoteMessage: any) => void,
) => {
  // Khi app bị terminate và user tap vào notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('📲 App mở từ Notification (Terminated):', remoteMessage);
        onNotificationTap(remoteMessage);
      }
    });

  // Khi app chạy background và user tap vào notification
  const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage) {
      console.log('📲 App mở từ Notification (Background):', remoteMessage);
      onNotificationTap(remoteMessage);
    }
  });

  return unsubscribe;
};
