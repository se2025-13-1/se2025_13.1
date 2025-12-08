import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';

interface ProductDescriptionProps {
  description?: string;
  onToggle?: (isExpanded: boolean) => void;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description = 'Đây là mô tả chi tiết của sản phẩm. Bao gồm các thông tin về chất liệu, kích thước, cách sử dụng, bảo quản và những đặc điểm nổi bật khác của sản phẩm này.',
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotation] = useState(new Animated.Value(0));

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggle?.(!isExpanded);

    Animated.timing(rotation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={handleToggle}
        activeOpacity={0.7}>
        <Text style={styles.title}>Thông tin chi tiết sản phẩm</Text>
        <Animated.View style={{transform: [{rotate: rotateInterpolate}]}}>
          <Image
            source={require('../../../assets/icons/Chevron.png')}
            style={styles.chevron}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Description Content */}
      {isExpanded && (
        <View style={styles.contentContainer}>
          <Text style={styles.description}>{description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  chevron: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: '#666666',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 20,
  },
});

export default ProductDescription;
