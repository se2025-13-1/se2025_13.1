import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

interface ReviewTextInputProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export const ReviewTextInput: React.FC<ReviewTextInputProps> = ({
  comment,
  onCommentChange,
  disabled = false,
  maxLength = 500,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nhận xét về sản phẩm (Tùy chọn)</Text>

      <TextInput
        style={[styles.textInput, disabled && styles.disabledInput]}
        value={comment}
        onChangeText={onCommentChange}
        placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm..."
        placeholderTextColor="#999999"
        multiline
        numberOfLines={4}
        maxLength={maxLength}
        textAlignVertical="top"
        editable={!disabled}
      />

      <Text style={styles.characterCount}>
        {comment.length}/{maxLength} ký tự
      </Text>
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
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333333',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    maxHeight: 120,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#999999',
  },
  characterCount: {
    fontSize: 11,
    color: '#999999',
    textAlign: 'right',
    marginTop: 5,
  },
});
