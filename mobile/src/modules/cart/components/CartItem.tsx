import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import CartVariantSelector from './CartVariantSelector';

interface CartItemProps {
  id: string;
  image: string;
  name: string;
  size: string;
  originalPrice?: number;
  price: number;
  discount?: string;
  quantity: number;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  image,
  name,
  size,
  originalPrice,
  price,
  discount,
  quantity,
  onQuantityChange,
  onRemove,
  selected = false,
  onSelectChange,
}) => {
  const [itemSelected, setItemSelected] = useState(selected);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);

  const handleSelectChange = () => {
    const newSelected = !itemSelected;
    setItemSelected(newSelected);
    onSelectChange?.(newSelected);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      onQuantityChange?.(newQuantity);
    } else {
      onRemove?.();
    }
  };

  const handleVariantConfirm = (
    color: string,
    selectedSize: string,
    newQuantity: number,
  ) => {
    onQuantityChange?.(newQuantity);
    setShowVariantSelector(false);
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có chắc chắn muốn xóa "${name}" khỏi giỏ hàng?`,
      [
        {
          text: 'Hủy',
          onPress: () => {
            console.log('[CartItem] Delete cancelled');
          },
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: () => {
            console.log('[CartItem] Delete confirmed, id:', id);
            onRemove?.();
          },
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Delete Button - Top Right */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
        <Image
          source={require('../../../assets/icons/Trash.png')}
          style={styles.trashIcon}
        />
      </TouchableOpacity>

      {/* Checkbox */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={handleSelectChange}>
        <View
          style={[styles.checkbox, itemSelected && styles.checkboxSelected]}>
          {itemSelected && (
            <Image
              source={require('../../../assets/icons/Tick.png')}
              style={[styles.tickIcon, {tintColor: '#fff'}]}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{uri: image}}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        <TouchableOpacity
          style={styles.sizeButton}
          onPress={() => setShowVariantSelector(true)}>
          <View style={styles.sizeButtonContent}>
            <Text style={styles.sizeText}>{size}</Text>
            <Image
              source={require('../../../assets/icons/Chevron.png')}
              style={styles.chevronIcon}
            />
          </View>
        </TouchableOpacity>

        {/* Price Section */}
        <View style={styles.priceQuantityRow}>
          <Text style={styles.price}>{price.toLocaleString('vi-VN')}₫</Text>

          {/* Quantity Controls */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity - 1)}>
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{quantity}</Text>
            </View>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity + 1)}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Badges */}
      </View>

      {/* Modal - Thông tin chi tiết */}
      <Modal
        visible={showSizeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSizeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin sản phẩm</Text>
              <TouchableOpacity onPress={() => setShowSizeModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kích thước:</Text>
                <Text style={styles.infoValue}>{size}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Giá:</Text>
                <Text style={styles.infoValue}>
                  {price.toLocaleString('vi-VN')}₫
                </Text>
              </View>
              {originalPrice && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Giá gốc:</Text>
                  <Text style={[styles.infoValue, styles.originalPriceText]}>
                    {originalPrice.toLocaleString('vi-VN')}₫
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số lượng:</Text>
                <Text style={styles.infoValue}>{quantity}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowSizeModal(false)}>
              <Text style={styles.closeModalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CartVariantSelector Modal */}
      {showVariantSelector && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowVariantSelector(false)}>
          <CartVariantSelector
            onClose={() => setShowVariantSelector(false)}
            onConfirm={handleVariantConfirm}
            price={price}
            originalPrice={originalPrice}
            currentQuantity={quantity}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
  trashIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FF6B6B',
  },
  checkboxContainer: {
    paddingRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  tickIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  imageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 70,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  detailsContainer: {
    flex: 1,
    paddingRight: 28,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    marginRight: 4,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sizeButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sizeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sizeText: {
    fontSize: 12,
    color: '#333',
  },
  size: {
    fontSize: 12,
    color: '#999',
  },
  chevronButton: {
    padding: 4,
  },
  chevronIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 8,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  saveBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  saveText: {
    color: '#FF6B6B',
    fontSize: 10,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  quantityButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityDisplay: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
  modalBody: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  originalPriceText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  closeModalButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CartItem;
