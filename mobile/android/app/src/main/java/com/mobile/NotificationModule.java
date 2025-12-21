package com.mobile;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class NotificationModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "NotificationModule";
    private NotificationManager notificationManager;
    private static final int NOTIFICATION_ID = 1001;

    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        notificationManager =
                (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * Tạo notification channel cho Android 8.0+
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Order notifications channel - IMPORTANCE_HIGH để hiển thị heads-up
            NotificationChannel orderChannel = new NotificationChannel(
                    "order_notifications",
                    "Thông báo đơn hàng",
                    NotificationManager.IMPORTANCE_HIGH
            );
            orderChannel.setDescription("Thông báo về đơn hàng của bạn");
            // Thêm âm thanh notification
            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            android.media.AudioAttributes audioAttributes = new android.media.AudioAttributes.Builder()
                    .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                    .build();
            orderChannel.setSound(soundUri, audioAttributes);
            // Bật rung động
            orderChannel.enableVibration(true);
            orderChannel.setVibrationPattern(new long[]{0, 250, 250, 250});
            // Bật LED nếu có
            orderChannel.enableLights(true);
            orderChannel.setLightColor(0xFF4CAF50);
            notificationManager.createNotificationChannel(orderChannel);

            // Default channel
            NotificationChannel defaultChannel = new NotificationChannel(
                    "default",
                    "Thông báo mặc định",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            defaultChannel.setDescription("Thông báo chung");
            notificationManager.createNotificationChannel(defaultChannel);
        }
    }

    /**
     * Hiển thị thông báo hệ thống
     *
     * @param options Đối tượng ReadableMap chứa:
     *               - title: Tiêu đề thông báo
     *               - message: Nội dung thông báo
     *               - channelId: ID của notification channel
     *               - color: Màu sắc của thông báo (RGB)
     * @param promise Callback Promise
     */
    @ReactMethod
    public void showNotification(ReadableMap options, Promise promise) {
        try {
            String title = options.getString("title");
            String message = options.getString("message");
            String channelId = options.hasKey("channelId")
                    ? options.getString("channelId")
                    : "default";
            int color = options.hasKey("color")
                    ? android.graphics.Color.parseColor(options.getString("color"))
                    : android.graphics.Color.parseColor("#E53935");

            NotificationCompat.Builder builder = new NotificationCompat.Builder(
                    getReactApplicationContext(),
                    channelId
            )
                    .setContentTitle(title)
                    .setContentText(message)
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setColor(color)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_SOCIAL)
                    .setStyle(new NotificationCompat.BigTextStyle()
                            .bigText(message));

            // Cấu hình để hiển thị heads-up notification
            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            builder.setSound(soundUri);
            builder.setVibrate(new long[]{0, 250, 250, 250});

            notificationManager.notify(NOTIFICATION_ID, builder.build());
            promise.resolve("Notification shown successfully");
        } catch (Exception e) {
            promise.reject("NOTIFICATION_ERROR", e.getMessage());
        }
    }

    /**
     * Hiển thị thông báo đặt hàng thành công
     *
     * @param orderId ID của đơn hàng
     * @param promise Callback Promise
     */
    @ReactMethod
    public void showOrderSuccessNotification(String orderId, Promise promise) {
        try {
            String title = "✅ Đặt hàng thành công";
            String message = "Đơn hàng #" + orderId + " của bạn đã được tạo thành công!";

            NotificationCompat.Builder builder = new NotificationCompat.Builder(
                    getReactApplicationContext(),
                    "order_notifications"
            )
                    .setContentTitle(title)
                    .setContentText(message)
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setColor(android.graphics.Color.parseColor("#4CAF50"))
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_SOCIAL)
                    .setStyle(new NotificationCompat.BigTextStyle()
                            .bigText(message));

            // Cấu hình âm thanh, rung động, LED cho heads-up notification
            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            builder.setSound(soundUri);
            builder.setVibrate(new long[]{0, 250, 250, 250});
            builder.setLights(0xFF4CAF50, 500, 500);

            notificationManager.notify(NOTIFICATION_ID, builder.build());
            promise.resolve("Order success notification shown");
        } catch (Exception e) {
            promise.reject("NOTIFICATION_ERROR", e.getMessage());
        }
    }

    /**
     * Hủy thông báo
     *
     * @param promise Callback Promise
     */
    @ReactMethod
    public void dismissNotification(Promise promise) {
        try {
            notificationManager.cancel(NOTIFICATION_ID);
            promise.resolve("Notification dismissed");
        } catch (Exception e) {
            promise.reject("NOTIFICATION_ERROR", e.getMessage());
        }
    }
}
