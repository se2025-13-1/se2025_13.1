import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageSourcePropType,
} from 'react-native';

const {width} = Dimensions.get('window');
const BANNER_WIDTH = width - 32; // 16px padding on each side
const BANNER_GAP = 12; // Gap between banners

interface Banner {
  id: string;
  image: ImageSourcePropType;
  title: string;
}

const BANNERS: Banner[] = [
  {
    id: '1',
    image: require('../../../assets/images/banner/Banner1.png'),
    title: 'Banner 1',
  },
  {
    id: '2',
    image: require('../../../assets/images/banner/Banner2.png'),
    title: 'Banner 2',
  },
  {
    id: '3',
    image: require('../../../assets/images/banner/Banner3.png'),
    title: 'Banner 3',
  },
];

const Banner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const totalWidth = BANNER_WIDTH + BANNER_GAP;
    const index = Math.round(contentOffsetX / totalWidth);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Banner ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + BANNER_GAP}
        decelerationRate="fast"
        style={styles.bannerScroll}
        contentContainerStyle={styles.bannerContent}>
        {BANNERS.map(banner => (
          <View key={banner.id} style={styles.bannerWrapper}>
            <Image
              source={banner.image}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Indicator Dots */}
      <View style={styles.indicatorContainer}>
        {BANNERS.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={`indicator-${index}`}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  bannerScroll: {
    marginHorizontal: -16,
  },
  bannerContent: {
    paddingHorizontal: 16,
  },
  bannerWrapper: {
    width: BANNER_WIDTH,
    height: 200,
    marginRight: BANNER_GAP,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#333333',
    width: 24,
  },
  dotInactive: {
    backgroundColor: '#CCCCCC',
    width: 8,
  },
});

export default Banner;
