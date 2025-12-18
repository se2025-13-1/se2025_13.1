import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';

interface ProductItemProps {
  productName?: string;
  color?: string;
  size?: string;
  price?: number;
  quantity?: number;
  image?: string;
  note?: string;
  onPress?: () => void;
  onNoteChange?: (note: string) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({
  productName,
  color,
  size,
  price,
  quantity,
  image,
  note,
  onPress,
  onNoteChange,
}) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState(note || '');
  const [tempNoteText, setTempNoteText] = useState(note || '');

  // Validate and handle image URL
  const getImageSource = (imageUrl?: string) => {
    console.log('getImageSource - imageUrl:', imageUrl);

    if (!imageUrl) {
      console.log('No imageUrl provided, using placeholder');
      return undefined;
    }

    // Check if it's a valid URL
    if (
      typeof imageUrl === 'string' &&
      (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
    ) {
      console.log('Valid URL, using:', imageUrl);
      return {uri: imageUrl};
    }

    console.log('Invalid URL format, using placeholder');
    return undefined;
  };

  const handleMessagePress = () => {
    setTempNoteText(noteText);
    setShowNoteModal(true);
  };

  const handleConfirmNote = () => {
    setNoteText(tempNoteText);
    onNoteChange?.(tempNoteText);
    setShowNoteModal(false);
  };

  const handleCancelNote = () => {
    setTempNoteText(noteText);
    setShowNoteModal(false);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Main Content - Image and Details */}
      <View style={styles.contentRow}>
        {/* Product Image - Left */}
        {getImageSource(image) ? (
          <Image source={getImageSource(image)} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, {backgroundColor: '#E8E8E8'}]} />
        )}

        {/* Details - Right */}
        <View style={styles.detailsContainer}>
          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>

          {/* Color and Size */}
          <Text style={styles.variantText}>
            Màu sắc: {color}; Size: {size}
          </Text>

          {/* Price and Quantity Row */}
          <View style={styles.priceQuantityRow}>
            <Text style={styles.currentPrice}>
              {price ? price.toLocaleString() : '0'}đ
            </Text>
            <Text style={styles.quantity}>Số lượng: {quantity}</Text>
          </View>
        </View>
      </View>

      {/* Message Section */}
      <View style={styles.messageSection}>
        {/* Message */}
        <TouchableOpacity
          style={styles.messageRow}
          onPress={handleMessagePress}>
          <Text style={styles.messageLabel}>Lời nhắn cho cửa hàng</Text>
          <View style={styles.messageRightContent}>
            <Text style={styles.messageValue}>
              {noteText ? noteText : 'Để lại lời nhắn'}
            </Text>
            <Image
              source={require('../../../assets/icons/ArrowForward.png')}
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>

        {/* Note Modal */}
        <Modal
          visible={showNoteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelNote}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Lời nhắn cho Shop</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCancelNote}>
                  <Image
                    source={require('../../../assets/icons/Cancel.png')}
                    style={styles.closeIcon}
                  />
                </TouchableOpacity>
              </View>

              {/* Input */}
              <TextInput
                style={styles.modalInput}
                placeholder="Để lại lời nhắn"
                value={tempNoteText}
                onChangeText={setTempNoteText}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />

              {/* Confirm Button */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmNote}>
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
    lineHeight: 16,
  },
  variantText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 30,
  },
  contentRow: {
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  quantity: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  messageSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  messageLabel: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '400',
  },
  messageRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  messageValue: {
    fontSize: 12,
    color: '#999999',
  },
  arrowIcon: {
    width: 12,
    height: 12,
    tintColor: '#999999',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: '#666666',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
});

export default ProductItem;
