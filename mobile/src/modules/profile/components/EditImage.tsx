import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';

interface EditImageProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress?: () => void;
  onGalleryPress?: () => void;
}

const EditImage: React.FC<EditImageProps> = ({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress,
}) => {
  const handleCameraPress = () => {
    onCameraPress?.();
    onClose();
  };

  const handleGalleryPress = () => {
    onGalleryPress?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Overlay */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Title with Cancel Icon */}
            <View style={styles.titleContainer}>
              <View style={styles.titleSpacer} />
              <Text style={styles.modalTitle}>Chọn tập tin</Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}>
                <Image
                  source={require('../../../assets/icons/Cancel.png')}
                  style={styles.cancelIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Camera Option */}
            <TouchableOpacity
              style={styles.option}
              onPress={handleCameraPress}
              activeOpacity={0.7}>
              <Text style={styles.optionText}>Mây ảnh</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.optionDivider} />

            {/* Gallery Option */}
            <TouchableOpacity
              style={styles.option}
              onPress={handleGalleryPress}
              activeOpacity={0.7}>
              <Text style={styles.optionText}>Thư viện ảnh</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalView: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingBottom: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    flex: 1,
  },
  titleSpacer: {
    width: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  cancelButton: {
    padding: 0,
  },
  cancelIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
});

export default EditImage;
