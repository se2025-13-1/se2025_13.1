import React, {useState, useRef} from 'react';
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Text,
} from 'react-native';

const {width} = Dimensions.get('window');

interface ProductImage {
  url?: string;
  image_url?: string;
  color: string | null;
  color_ref?: string | null;
}

interface ProductImageProps {
  images?: ProductImage[];
}

const ProductImage: React.FC<ProductImageProps> = ({images}) => {
  // Normalize images - hỗ trợ cả url/image_url và color/color_ref
  const normalizedImages = (images || []).map(img => ({
    url: img.url || img.image_url || '',
    color: img.color || img.color_ref || null,
  }));

  // Lấy tất cả ảnh (chung + theo màu)
  const displayImages = normalizedImages.map(img => img.url).filter(url => url);

  // Nếu không có ảnh, hiển thị placeholder
  const finalImages =
    displayImages.length > 0
      ? displayImages
      : ['https://via.placeholder.com/300x300/f0f0f0/666666?text=Product'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  const renderImage = ({item}: {item: string}) => (
    <View style={styles.imageWrapper}>
      <Image source={{uri: item}} style={styles.image} resizeMode="cover" />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Image Carousel */}
      <FlatList
        ref={flatListRef}
        data={finalImages}
        renderItem={renderImage}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
      />

      {/* Image Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1}/{finalImages.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: width,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  imageWrapper: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 2,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProductImage;

export default ProductImage;
