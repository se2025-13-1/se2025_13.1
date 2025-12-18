import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  price: number;
  stock_quantity: number;
}

interface ProductImage {
  url: string;
  color: string | null;
}

interface ProductVariantsProps {
  variants?: ProductVariant[];
  images?: ProductImage[];
  onVariantSelect?: (variant: ProductVariant) => void;
  selectedVariant?: ProductVariant;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  variants = [],
  images = [],
  onVariantSelect,
  selectedVariant,
}) => {
  const [activeVariant, setActiveVariant] = useState<
    ProductVariant | undefined
  >(selectedVariant || variants[0]);

  // Lấy danh sách màu duy nhất
  const colors = Array.from(new Set(variants.map(v => v.color)));

  // Lấy danh sách size duy nhất
  const sizes = Array.from(new Set(variants.map(v => v.size)));

  // Helper: Lấy ảnh theo màu
  const getImagesByColor = (color: string): string[] => {
    return images.filter(img => img.color === color).map(img => img.url);
  };

  const handleColorPress = (color: string) => {
    // Tìm variant đầu tiên với màu này
    const variant = variants.find(v => v.color === color);
    if (variant) {
      setActiveVariant(variant);
      onVariantSelect?.(variant);
    }
  };

  const handleSizePress = (size: string) => {
    // Tìm variant với màu hiện tại và size này
    const color = activeVariant?.color || colors[0];
    const variant = variants.find(v => v.color === color && v.size === size);
    if (variant) {
      setActiveVariant(variant);
      onVariantSelect?.(variant);
    }
  };

  if (variants.length === 0) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      {/* Color Section */}
      {colors.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Màu sắc:</Text>
            {activeVariant && (
              <Text style={styles.selectedLabel}>{activeVariant.color}</Text>
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
                  activeVariant?.color === color && styles.colorOptionActive,
                ]}
                onPress={() => handleColorPress(color)}>
                {getImagesByColor(color).length > 0 ? (
                  <Image
                    source={{uri: getImagesByColor(color)[0]}}
                    style={styles.colorSwatch}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[styles.colorSwatch, {backgroundColor: color}]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Size Section */}
      {sizes.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sizeHeader}>
            <Text style={styles.sectionTitle}>Size:</Text>
            {activeVariant && (
              <Text style={styles.sizeInfo}>{activeVariant.size}</Text>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sizesContainer}>
            {sizes.map((size, index) => (
              <TouchableOpacity
                key={`size-${index}`}
                style={[
                  styles.sizeOption,
                  activeVariant?.size === size && styles.sizeOptionActive,
                  index !== sizes.length - 1 && styles.sizeOptionMargin,
                ]}
                onPress={() => handleSizePress(size)}>
                <Text
                  style={[
                    styles.sizeLabel,
                    activeVariant?.size === size && styles.sizeLabelActive,
                  ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  selectedLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  sizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  variantsContainer: {
    flexDirection: 'row',
  },
  variantsContentContainer: {
    gap: 8,
    paddingRight: 8,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionActive: {
    borderColor: '#FF4444',
  },
  colorSwatch: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
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
  },
  sizeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#333333',
  },
  sizeLabelActive: {
    color: '#FF4444',
  },
  colorImagesSection: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  colorImagesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  colorImagesContainer: {
    flexDirection: 'row',
  },
  colorImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  colorImage: {
    width: '100%',
    height: '100%',
  },
  noColorImageText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  stockSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  stockValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  inStock: {
    color: '#27AE60',
  },
  outOfStock: {
    color: '#E74C3C',
  },
});

export default ProductVariants;
