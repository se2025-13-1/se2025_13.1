# Hướng Dẫn Sử Dụng Notification Service

## Tổng Quan

Notification Service cung cấp chức năng hiển thị thông báo hệ thống cho Android khi người dùng đặt hàng thành công hoặc thất bại.

## Các File Được Tạo

### 1. TypeScript/React Native Service

- **`mobile/src/services/notificationService.ts`**: Service quản lý thông báo

### 2. Native Android Modules

- **`mobile/android/app/src/main/java/com/mobile/NotificationModule.java`**: Native module để gọi API Android notification
- **`mobile/android/app/src/main/java/com/mobile/NotificationPackage.java`**: React Package để đăng ký NotificationModule

### 3. Configuration Updates

- **`mobile/android/app/src/main/java/com/mobile/MainApplication.kt`**: Đăng ký NotificationPackage
- **`mobile/android/app/src/main/AndroidManifest.xml`**: Thêm quyền POST_NOTIFICATIONS

### 4. Integration in Payment Screen

- **`mobile/src/modules/payment/screens/PaymentScreen.tsx`**: Tích hợp notification khi đặt hàng thành công/thất bại

## Cách Sử Dụng

### 1. Hiển Thị Thông Báo Đặt Hàng Thành Công

```typescript
import {NotificationService} from '../../../services/notificationService';

// Khi đơn hàng tạo thành công
await NotificationService.showOrderSuccessNotification('ORDER_ID_123');
```

### 2. Hiển Thị Thông Báo Đặt Hàng Thất Bại

```typescript
await NotificationService.showOrderFailedNotification('Lỗi kết nối mạng');
```

### 3. Hiển Thị Thông Báo Tùy Chỉnh

```typescript
await NotificationService.showSystemNotification({
  title: 'Tiêu đề',
  message: 'Nội dung thông báo',
  color: '#FF0000',
});
```

## Quyền Cần Thiết

- `android.permission.POST_NOTIFICATIONS` - Quyền để post notification (Android 13+)

## Notification Channels

Hệ thống tạo 2 notification channels:

1. **order_notifications** (IMPORTANCE_HIGH):

   - Dành cho thông báo đơn hàng
   - Độ ưu tiên cao
   - Có âm thanh và rung

2. **default** (IMPORTANCE_DEFAULT):
   - Dành cho thông báo chung
   - Độ ưu tiên bình thường

## Xây Dựng và Chạy

```bash
# Xây dựng APK
cd mobile/android
./gradlew clean build

# Chạy trên emulator
cd ..
npm run android
```

## Kiểm Tra

1. Mở ứng dụng
2. Đi đến màn hình thanh toán
3. Hoàn tất thanh toán
4. Xem thông báo hệ thống trên notification shade của Android

## Fallback Behavior

- Trên iOS: Hiển thị Alert thay vì notification
- Nếu NotificationModule không khả dụng: Fallback sang Alert

## Lưu Ý

- Thông báo chỉ hiển thị khi ứng dụng chạy hoặc chạy nền
- Cần đảm bảo quyền POST_NOTIFICATIONS được cấp trên Android 13+
- Notification ID được sử dụng là `1001` (có thể thay đổi nếu cần)
