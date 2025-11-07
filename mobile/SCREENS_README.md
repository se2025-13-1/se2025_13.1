# Mobile App - Splash & Welcome Screens

## Mô tả

App này bao gồm 2 screen chính được thiết kế theo yêu cầu:

### 1. Splash Screen

- Hiển thị logo với hiệu ứng loading
- Thời gian hiển thị: 2 giây
- Animation fade in và scale cho logo
- Loading indicator quay liên tục
- Màu nền đen với logo trắng (giống design trong ảnh)

### 2. Welcome Screen

- Hiển thị text "Define yourself in your unique way"
- Placeholder cho ảnh welcome.png
- 2 nút: "Get Started" (đăng ký) và "Already have an account? Login"
- Thiết kế sạch sẽ, hiện đại

## Cấu trúc file

```
mobile/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx          # Quản lý navigation
│   ├── screens/
│   │   ├── Splash/
│   │   │   └── SplashScreen.tsx      # Splash screen với animation
│   │   ├── Welcome/
│   │   │   └── WelcomeScreen.tsx     # Welcome screen với buttons
│   │   ├── Login/
│   │   │   └── LoginScreen.tsx       # Login screen (placeholder)
│   │   └── SignUp/
│   │       └── SignUpScreen.tsx      # Sign up screen (placeholder)
│   └── assets/
│       └── images/
│           └── welcome.png.txt       # Placeholder cho ảnh welcome
└── App.tsx                          # Entry point
```

## Cách chạy

1. Đảm bảo bạn đã cài đặt React Native environment
2. Chạy `npm install` trong thư mục mobile/
3. Chạy `npx react-native run-android` hoặc `npx react-native run-ios`

## Ghi chú

- Để sử dụng ảnh welcome.png thực, hãy thay thế placeholder trong WelcomeScreen.tsx
- Uncomment dòng Image component và comment dòng placeholder
- Đặt file welcome.png vào thư mục src/assets/images/
- Login và Sign Up screens hiện tại chỉ là placeholder, có thể phát triển thêm

## Tính năng

✅ Splash screen với animation loading
✅ Welcome screen với design theo mockup
✅ Navigation giữa các screens
✅ Responsive design
✅ TypeScript support
✅ Clean code structure
