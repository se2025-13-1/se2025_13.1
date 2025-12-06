import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';

interface EditGenderProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (gender: string) => void;
  initialValue?: string;
}

const genderOptions = ['Nam', 'Nữ', 'Khác'];

const EditGender: React.FC<EditGenderProps> = ({
  visible,
  onClose,
  onSave,
  initialValue = 'Nam',
}) => {
  const [selectedGender, setSelectedGender] = useState(initialValue);

  const handleSave = () => {
    onSave?.(selectedGender);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.outsideArea}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{width: 60}} />
            <Text style={styles.headerTitle}>Giới tính</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.headerButton}>Thoát</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Gender Options */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.optionsContainer}>
              {genderOptions.map((gender, index) => (
                <TouchableOpacity
                  key={gender}
                  style={styles.optionItem}
                  onPress={() => setSelectedGender(gender)}>
                  <Text style={styles.optionText}>{gender}</Text>
                  <View
                    style={[
                      styles.checkbox,
                      selectedGender === gender && styles.checkboxSelected,
                    ]}>
                    {selectedGender === gender && (
                      <Image
                        source={require('../../../assets/icons/Tick.png')}
                        style={styles.tickIcon}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Button Confirm */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
              <Text style={styles.confirmButtonText}>Đồng ý</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  outsideArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: 300,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    minHeight: 170,
    paddingBottom: 70,
  },
  optionsContainer: {
    marginTop: 0,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333333',
    paddingRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#FF4444',
    backgroundColor: '#FF4444',
  },
  tickIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  confirmButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default EditGender;
