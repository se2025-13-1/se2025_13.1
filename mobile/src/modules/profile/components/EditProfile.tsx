import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

interface EditProfileProps {
  visible: boolean;
  title: string;
  initialValue: string;
  onClose: () => void;
  onSave: (value: string) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({
  visible,
  title,
  initialValue,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState(initialValue);

  if (!visible) {
    return null;
  }

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const handleClear = () => {
    setValue('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={setValue}
            placeholder="Nhập thông tin"
            placeholderTextColor="#CCCCCC"
          />
          {value && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
    fontWeight: '300',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    paddingVertical: 12,
  },
  clearButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  saveButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EditProfile;
