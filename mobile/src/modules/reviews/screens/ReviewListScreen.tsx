import React, {useState} from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ReviewHeader from '../components/ReviewHeader';
import RatingSummary from '../components/RatingSummary';
import ReviewItem from '../components/ReviewItem';
import BottomActionBar from '../../productdetails/components/BottomActionBar';

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  reviewText: string;
  timestamp: string | Date;
  verified?: boolean;
  likeCount?: number;
}

const ReviewListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userName: 'Nguyễn Văn A',
      rating: 5,
      reviewText: 'Sản phẩm rất tốt, chất lượng cao, giao hàng nhanh',
      timestamp: new Date('2025-11-05'),
      verified: true,
      likeCount: 9,
    },
    {
      id: '2',
      userName: 'Trần Thị B',
      rating: 4,
      reviewText: 'Túi đẹp, đúng như ảnh, rất hài lòng',
      timestamp: new Date('2025-11-02'),
      verified: true,
      likeCount: 5,
    },
    {
      id: '3',
      userName: 'Lê Văn C',
      rating: 5,
      reviewText: 'Chất liệu tốt, bền, đáng tiền',
      timestamp: new Date('2025-10-29'),
      verified: false,
      likeCount: 12,
    },
    {
      id: '4',
      userName: 'Phạm Minh D',
      rating: 4,
      reviewText: 'Tốt nhưng giao hàng hơi lâu một chút',
      timestamp: new Date('2025-10-25'),
      verified: true,
      likeCount: 3,
    },
    {
      id: '5',
      userName: 'Hoàng Anh E',
      rating: 5,
      reviewText: 'Rất hài lòng với sản phẩm này, sẽ mua lại',
      timestamp: new Date('2025-10-20'),
      verified: true,
      likeCount: 15,
    },
  ]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationPress = () => {
    // Xử lý thông báo
    console.log('Notification pressed');
  };

  const renderReviewItem = ({item}: {item: Review}) => (
    <ReviewItem
      id={item.id}
      userName={item.userName}
      userAvatar={item.userAvatar}
      rating={item.rating}
      reviewText={item.reviewText}
      timestamp={item.timestamp}
      verified={item.verified}
      likeCount={item.likeCount}
    />
  );

  return (
    <View style={styles.container}>
      <ReviewHeader
        onBackPress={handleBackPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
      />

      <RatingSummary
        averageRating={4.8}
        totalReviews={245}
        fiveStarCount={180}
        fourStarCount={45}
        threeStarCount={15}
        twoStarCount={3}
        oneStarCount={2}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={item => item.id}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />
      )}

      {/* Bottom Action Bar */}
      <BottomActionBar
        onFavoritePress={() => console.log('Favorite pressed')}
        onChatPress={() => console.log('Chat pressed')}
        onCartPress={() => console.log('Add to cart pressed')}
        onBuyPress={() => console.log('Buy pressed')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReviewListScreen;
