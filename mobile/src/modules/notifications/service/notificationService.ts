import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';

// 👇 Thay bằng IP máy tính của bạn (VD: 192.168.1.5)
// Nếu chạy máy ảo Android Emulator thì dùng: 10.0.2.2
const BACKEND_URL = 'http://10.0.2.2:3000/api';

export const requestUserPermission = async () => {
  // 1. Xin quyền cho Android 13+ (API 33+)
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Quyền thông báo bị từ chối');
      return false;
    }
  }

  // 2. Xin quyền cho iOS (và Android cũ)
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  return false;
};

export const getFCMToken = async (userToken: string) => {
  try {
    // Lấy token từ Firebase
    const fcmToken = await messaging().getToken();

    if (fcmToken) {
      console.log('🔥 FCM Token:', fcmToken);

      // Gửi về Backend để lưu
      await registerTokenToBackend(fcmToken, userToken);
    }
  } catch (error) {
    console.error('Lỗi lấy FCM token:', error);
  }
};

const registerTokenToBackend = async (fcmToken: string, userToken: string) => {
  try {
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

    const data = await response.json();
    console.log('✅ Đã gửi token lên server:', data);
  } catch (error) {
    console.error('❌ Lỗi gửi token lên server:', error);
  }
};

// Lắng nghe thông báo khi App đang mở (Foreground)
export const notificationListener = () => {
  return messaging().onMessage(async remoteMessage => {
    console.log('📩 Nhận thông báo mới (Foreground):', remoteMessage);

    // Ở đây bạn có thể dùng thư viện như 'react-native-toast-message' để hiện thông báo đẹp hơn
    // Hoặc đơn giản là Alert
    // Alert.alert(remoteMessage.notification?.title, remoteMessage.notification?.body);
  });
};
