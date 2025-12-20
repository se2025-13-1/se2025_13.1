import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
// Using react-native's built-in ImagePicker alternative
// For now, we'll use a simple implementation without external libraries

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
    // TODO: Implement image picker when react-native-image-picker is installed
    Alert.alert('Thông báo', 'Tính năng chọn ảnh sẽ được cập nhật sau');

    // Placeholder implementation - would use launchImageLibrary here
    // launchImageLibrary(
    //   {
    //     mediaType: 'photo',
    //     quality: 0.7,
    //     maxWidth: 800,
    //     maxHeight: 800,
    //   },
    //   (response: any) => {
    //     if (response.assets && response.assets[0]) {
    //       const imageUri = response.assets[0].uri;
    //       if (imageUri) {
    //         onImagesChange([...images, imageUri]);
    //       }
    //     }
    //   }
    // );
  };

  const openCamera = () => {
    // TODO: Implement camera when react-native-image-picker is installed
    Alert.alert('Thông báo', 'Tính năng chụp ảnh sẽ được cập nhật sau');

    // Placeholder implementation - would use launchCamera here
    // launchCamera(
    //   {
    //     mediaType: 'photo',
    //     quality: 0.7,
    //     maxWidth: 800,
    //     maxHeight: 800,
    //   },
    //   (response: any) => {
    //     if (response.assets && response.assets[0]) {
    //       const imageUri = response.assets[0].uri;
    //       if (imageUri) {
    //         onImagesChange([...images, imageUri]);
    //       }
    //     }
    //   }
    // );
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
