import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';

interface Variant {
  id: string;
  name: string;
  image?: string;
}

interface Size {
  id: string;
  label: string;
  weight: string;
}

interface CartVariantSelectorProps {
  onClose?: () => void;
  onConfirm: (color: string, size: string, quantity: number) => void;
  colors?: Variant[];
  sizes?: Size[];
  price?: number;
  originalPrice?: number;
  stock?: number;
  currentColor?: string;
  currentSize?: string;
  currentQuantity?: number;
}

const CartVariantSelector: React.FC<CartVariantSelectorProps> = ({
  onClose,
  onConfirm,
  colors = [
    {
      id: '1',
      name: 'MAU DEN',
      image: 'https://via.placeholder.com/50x50/000000/000000?text=1',
    },
    {
      id: '2',
      name: 'MAU XAM',
      image: 'https://via.placeholder.com/50x50/808080/808080?text=2',
    },
    {
      id: '3',
      name: 'MAU TRANG',
      image: 'https://via.placeholder.com/50x50/CCCCCC/CCCCCC?text=3',
    },
  ],
  sizes = [
    {id: '1', label: 'Size S', weight: '(Dưới 52kg)'},
    {id: '2', label: 'Size M', weight: '(53-60kg)'},
    {id: '3', label: 'Size L', weight: '(60-68kg)'},
    {id: '4', label: 'Size XL', weight: ''},
  ],
  price = 139920,
  originalPrice = 250000,
  stock = 966,
  currentColor = null,
  currentSize = null,
  currentQuantity = 1,
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    currentColor,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(currentSize);
  const [quantity, setQuantity] = useState(currentQuantity || 1);

  const selectedColorObj = colors.find(c => c.id === selectedColor);

  const handleConfirmPress = () => {
    if (!selectedColor) {
      Alert.alert('Thông báo', 'Vui lòng chọn màu sắc');
      return;
    }
    if (!selectedSize) {
      Alert.alert('Thông báo', 'Vui lòng chọn size');
      return;
    }
    if (quantity <= 0) {
      Alert.alert('Thông báo', 'Số lượng phải lớn hơn 0');
      return;
    }
    if (quantity > stock) {
      Alert.alert('Thông báo', `Số lượng không được vượt quá ${stock}`);
      return;
    }
    onConfirm(selectedColor, selectedSize, quantity);
    onClose?.();
  };

  const handleIncreaseQuantity = () => {
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Validation: color, size, and quantity must be within stock
  const isValidForm =
    selectedColor && selectedSize && quantity > 0 && quantity <= stock;

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Bottom Sheet */}
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Selected Color Info */}
          <View style={styles.selectedColorSection}>
            <Image
              source={{uri: selectedColorObj?.image}}
              style={styles.selectedColorImage}
            />
            <View style={styles.priceInfo}>
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>
                  {price.toLocaleString()}đ
                </Text>
              </View>
              <Text style={styles.stock}>Kho: {stock}</Text>
            </View>
            {onClose && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Color Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Màu sắc:</Text>
              {colors.find(c => c.id === selectedColor) && (
                <Text style={styles.selectedLabel}>
                  {colors.find(c => c.id === selectedColor)?.name}
                </Text>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.variantsContainer}
              contentContainerStyle={styles.variantsContentContainer}>
              {colors.map(color => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    selectedColor === color.id && styles.colorOptionActive,
                  ]}
                  onPress={() => setSelectedColor(color.id)}>
                  <Image
                    source={{uri: color.image}}
                    style={styles.colorImage}
                  />
                  {selectedColor === color.id && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Size Section */}
          <View style={styles.section}>
            <View style={styles.sizeHeader}>
              <Text style={styles.sectionTitle}>Size:</Text>
              <Text style={styles.sizeInfo}>
                {selectedSize
                  ? `${sizes.find(s => s.id === selectedSize)?.label} ${
                      sizes.find(s => s.id === selectedSize)?.weight
                    }`
                  : 'Chọn size'}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sizesContainer}
              scrollEnabled={true}>
              {sizes.map((size, index) => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.sizeOption,
                    selectedSize === size.id && styles.sizeOptionActive,
                    index !== sizes.length - 1 && styles.sizeOptionMargin,
                  ]}
                  onPress={() => setSelectedSize(size.id)}>
                  <Text
                    style={[
                      styles.sizeLabel,
                      selectedSize === size.id && styles.sizeLabelActive,
                    ]}>
                    {size.label} {size.weight && `${size.weight}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Quantity Selection */}
          <View style={styles.section}>
            <View style={styles.quantityRow}>
              <Text style={styles.sectionTitle}>Số lượng</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={handleDecreaseQuantity}>
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={handleIncreaseQuantity}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !isValidForm && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmPress}
            disabled={!isValidForm}>
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: '80%',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  selectedColorSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedColorImage: {
    width: 100,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 12,
  },
  priceInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: -20,
  },
  closeText: {
    fontSize: 24,
    color: '#666666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E53935',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  stock: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 6,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  sizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  variantsContainer: {
    flexDirection: 'row',
  },
  variantsContentContainer: {
    gap: 5,
    paddingRight: 2,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    position: 'relative',
  },
  colorOptionActive: {
    borderColor: '#FF4444',
  },
  colorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sizeInfo: {
    fontSize: 13,
    color: '#666666',
  },
  sizesContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'nowrap',
  },
  sizeOption: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeOptionMargin: {
    marginRight: 8,
  },
  sizeOptionActive: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  sizeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
  },
  sizeLabelActive: {
    color: '#FF4444',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
  },
  quantityDisplay: {
    width: 60,
    height: 32,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 1,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  spacer: {
    height: 0,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CartVariantSelector;
