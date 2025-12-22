import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';

interface ReviewImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export const ReviewImagePicker: React.FC<ReviewImagePickerProps> = ({
  images,
  onImagesChange,
  disabled = false,
  maxImages = 5,
}) => {
  // Kiểm tra và yêu cầu quyền camera cho Android
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Quyền sử dụng Camera',
          message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Error requesting camera permission:', err);
      return false;
    }
  };

  // Xử lý response từ image picker
  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    }

    if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Lỗi', response.errorMessage || 'Không thể chọn ảnh');
      return;
    }

    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        // Thêm ảnh mới vào danh sách
        onImagesChange([...images, imageUri]);
      }
    }
  };

  const handleAddImage = () => {
    if (images.length >= maxImages) {
      Alert.alert('Thông báo', `Chỉ có thể tải tối đa ${maxImages} ảnh`);
      return;
    }

    Alert.alert(
      'Chọn ảnh',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        {text: 'Hủy', style: 'cancel'},
        {text: 'Thư viện', onPress: openImageLibrary},
        {text: 'Camera', onPress: openCamera},
      ],
      {cancelable: true},
    );
  };

  const openImageLibrary = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 1,
    };

    launchImageLibrary(options, handleImagePickerResponse);
  };

  const openCamera = async () => {
    // Yêu cầu quyền camera trước khi mở
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Quyền bị từ chối',
        'Vui lòng cấp quyền camera trong cài đặt để sử dụng tính năng này',
      );
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
      cameraType: 'back',
    };

    launchCamera(options, handleImagePickerResponse);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Ảnh sản phẩm (Tùy chọn) - {images.length}/{maxImages}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.imagesContainer}>
          {/* Hiển thị ảnh đã chọn */}
          {images.map((imageUri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{uri: imageUri}} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}>
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Nút thêm ảnh */}
          {images.length < maxImages && (
            <TouchableOpacity
              style={[styles.addButton, disabled && styles.disabledButton]}
              onPress={handleAddImage}
              disabled={disabled}>
              <Text style={styles.addButtonText}>+</Text>
              <Text style={styles.addButtonLabel}>Thêm ảnh</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E53935',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 24,
    color: '#999999',
    marginBottom: 2,
  },
  addButtonLabel: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
  },
});
