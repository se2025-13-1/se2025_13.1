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
import {useNavigation} from '@react-navigation/native';

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  price: number;
  stock?: number;
  stock_quantity?: number;
  thumbnail?: string;
  images?: string[];
}

interface ProductImage {
  url: string;
  color: string | null;
}

interface ProductVariantSelectorProps {
  onClose?: () => void;
  onBuy: (variant: ProductVariant, quantity: number) => void;
  variants: ProductVariant[];
  images: ProductImage[];
  productName: string;
  basePrice: number;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  onClose,
  onBuy,
  variants = [],
  images = [],
  productName = '',
  basePrice = 0,
}) => {
  const navigation = useNavigation<any>();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null,
  );
  const [quantity, setQuantity] = useState(1);

  // Lấy danh sách màu duy nhất
  const colors = Array.from(new Set(variants.map(v => v.color)));

  // Lấy danh sách size duy nhất
  const sizes = Array.from(new Set(variants.map(v => v.size)));

  // Helper: Lấy ảnh theo màu
  const getImagesByColor = (color: string): string[] => {
    const result = images
      .filter(img => img.color === color)
      .map(img => img.url);
    console.log(
      'getImagesByColor:',
      color,
      'images:',
      images,
      'result:',
      result,
    );
    return result;
  };

  const handleColorPress = (color: string) => {
    const variant = variants.find(v => v.color === color);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleSizePress = (size: string) => {
    if (!selectedVariant) return;
    const color = selectedVariant.color;
    const variant = variants.find(v => v.color === color && v.size === size);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleBuyPress = () => {
    if (!selectedVariant) {
      Alert.alert('Thông báo', 'Vui lòng chọn biến thể sản phẩm');
      return;
    }
    const stockQty =
      selectedVariant.stock ?? selectedVariant.stock_quantity ?? 0;
    if (stockQty <= 0) {
      Alert.alert('Thông báo', 'Sản phẩm này đã hết hàng');
      return;
    }

    // Add images of selected color to variant
    const colorImages = getImagesByColor(selectedVariant.color);
    console.log('handleBuyPress - selectedVariant:', selectedVariant);
    console.log('handleBuyPress - colorImages:', colorImages);

    const variantWithImages = {
      ...selectedVariant,
      thumbnail:
        colorImages.length > 0 ? colorImages[0] : selectedVariant.thumbnail,
    };

    console.log('variantWithImages:', variantWithImages);
    onBuy(variantWithImages, quantity);
  };

  const handleIncreaseQuantity = () => {
    if (selectedVariant) {
      const stockQty =
        selectedVariant.stock ?? selectedVariant.stock_quantity ?? 0;
      if (quantity < stockQty) {
        setQuantity(prev => prev + 1);
      }
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

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
          {/* Selected Variant Info */}
          <View style={styles.selectedColorSection}>
            {selectedVariant &&
              getImagesByColor(selectedVariant.color).length > 0 && (
                <Image
                  source={{uri: getImagesByColor(selectedVariant.color)[0]}}
                  style={styles.selectedColorImage}
                />
              )}
            <View style={styles.priceInfo}>
              <Text style={styles.productTitle}>{productName}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>
                  {selectedVariant
                    ? selectedVariant.price.toLocaleString()
                    : basePrice.toLocaleString()}
                  ₫
                </Text>
              </View>
              <Text style={styles.stock}>
                Kho:{' '}
                {selectedVariant
                  ? selectedVariant.stock ?? selectedVariant.stock_quantity ?? 0
                  : 0}
              </Text>
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
              {selectedVariant && (
                <Text style={styles.selectedLabel}>
                  {selectedVariant.color}
                </Text>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.variantsContainer}
              contentContainerStyle={styles.variantsContentContainer}>
              {colors.map((color, index) => (
                <TouchableOpacity
                  key={`color-${index}`}
                  style={[
                    styles.colorOption,
                    selectedVariant?.color === color &&
                      styles.colorOptionActive,
                  ]}
                  onPress={() => handleColorPress(color)}>
                  {getImagesByColor(color).length > 0 ? (
                    <Image
                      source={{uri: getImagesByColor(color)[0]}}
                      style={styles.colorImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[styles.colorImage, {backgroundColor: color}]}
                    />
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
                {selectedVariant ? selectedVariant.size : 'Chọn size'}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sizesContainer}
              scrollEnabled={true}>
              {sizes.map((size, index) => (
                <TouchableOpacity
                  key={`size-${index}`}
                  style={[
                    styles.sizeOption,
                    selectedVariant?.size === size && styles.sizeOptionActive,
                    index !== sizes.length - 1 && styles.sizeOptionMargin,
                  ]}
                  onPress={() => handleSizePress(size)}>
                  <Text
                    style={[
                      styles.sizeLabel,
                      selectedVariant?.size === size && styles.sizeLabelActive,
                    ]}>
                    {size}
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

        {/* Buy Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.buyButton,
              !selectedVariant && styles.buyButtonDisabled,
            ]}
            onPress={handleBuyPress}
            disabled={!selectedVariant}>
            <Text style={styles.buyButtonText}>Mua ngay</Text>
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
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
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
    flex: 1,
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
  buyButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProductVariantSelector;
