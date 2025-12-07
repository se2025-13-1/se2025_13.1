import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
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

interface ProductVariantsProps {
  colors?: Variant[];
  sizes?: Size[];
  onColorSelect?: (colorId: string) => void;
  onSizeSelect?: (sizeId: string) => void;
  selectedColor?: string;
  selectedSize?: string;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
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
  onColorSelect,
  onSizeSelect,
  selectedColor = '1',
  selectedSize = '2',
}) => {
  const [activeColor, setActiveColor] = useState(selectedColor);
  const [activeSize, setActiveSize] = useState(selectedSize);

  const handleColorPress = (colorId: string) => {
    setActiveColor(colorId);
    onColorSelect?.(colorId);
  };

  const handleSizePress = (sizeId: string) => {
    setActiveSize(sizeId);
    onSizeSelect?.(sizeId);
  };

  return (
    <View style={styles.container}>
      {/* Color Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Màu sắc:</Text>
          {colors.find(c => c.id === activeColor) && (
            <Text style={styles.selectedLabel}>
              {colors.find(c => c.id === activeColor)?.name}
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
                activeColor === color.id && styles.colorOptionActive,
              ]}
              onPress={() => handleColorPress(color.id)}>
              <Image source={{uri: color.image}} style={styles.colorImage} />
              {activeColor === color.id && (
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
            {sizes.find(s => s.id === activeSize)?.label}{' '}
            {sizes.find(s => s.id === activeSize)?.weight}
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
                activeSize === size.id && styles.sizeOptionActive,
                index !== sizes.length - 1 && styles.sizeOptionMargin,
              ]}
              onPress={() => handleSizePress(size.id)}>
              <Text
                style={[
                  styles.sizeLabel,
                  activeSize === size.id && styles.sizeLabelActive,
                ]}>
                {size.label} {size.weight && `${size.weight}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
    marginBottom: 10,
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
  sizeContentWrapper: {
    display: 'none',
  },
  sizeInfoRight: {
    display: 'none',
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
  sizeWeight: {
    display: 'none',
  },
});

export default ProductVariants;
