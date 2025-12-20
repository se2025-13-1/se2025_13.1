import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import ReviewHeader from '../components/ReviewHeader';
import RatingSummary from '../components/RatingSummary';
import ReviewItem from '../components/ReviewItem';
import BottomActionBar from '../../productdetails/components/BottomActionBar';
import {ReviewApi, ProductReview} from '../services/review.api';

type ReviewListRouteProps = RouteProp<{params: {productId: string}}, 'params'>;

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
  const route = useRoute<ReviewListRouteProps>();
  const {productId} = route.params;

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Rating summary data calculated from reviews
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0,
  });

  useEffect(() => {
    fetchProductReviews();
  }, [productId]);

  const fetchProductReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ReviewApi.getProductReviews(productId, {
        page: 1,
        limit: 50, // Load more reviews for better overview
      });

      // Map backend ProductReview to frontend Review interface
      const mappedReviews: Review[] = response.reviews.map(
        (review: ProductReview) => ({
          id: review.id,
          userName: review.user_name || 'Người dùng',
          userAvatar: review.user_avatar,
          rating: review.rating,
          reviewText: review.comment || '',
          timestamp: new Date(review.created_at),
          verified: review.is_approved, // Verified purchase = approved review
          likeCount: 0, // Backend doesn't support likes yet
        }),
      );

      setReviews(mappedReviews);
      calculateRatingSummary(mappedReviews);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Không thể tải đánh giá');
      Alert.alert('Lỗi', err.message || 'Không thể tải đánh giá sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const calculateRatingSummary = (reviewsList: Review[]) => {
    const totalReviews = reviewsList.length;

    if (totalReviews === 0) {
      setRatingSummary({
        averageRating: 0,
        totalReviews: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0,
      });
      return;
    }

    // Count ratings using a type-safe approach
    const ratingCounts = {
      '5Star': 0,
      '4Star': 0,
      '3Star': 0,
      '2Star': 0,
      '1Star': 0,
      total: 0,
    };

    reviewsList.forEach(review => {
      const ratingKey = `${review.rating}Star` as keyof typeof ratingCounts;
      if (ratingKey in ratingCounts && ratingKey !== 'total') {
        ratingCounts[ratingKey] = ratingCounts[ratingKey] + 1;
      }
      ratingCounts.total += review.rating;
    });

    const averageRating = ratingCounts.total / totalReviews;

    setRatingSummary({
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      fiveStarCount: ratingCounts['5Star'],
      fourStarCount: ratingCounts['4Star'],
      threeStarCount: ratingCounts['3Star'],
      twoStarCount: ratingCounts['2Star'],
      oneStarCount: ratingCounts['1Star'],
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationPress = () => {
    // Xử lý thông báo
    console.log('Notification pressed');
  };

  const handleLoginPress = () => {
    navigation.navigate('Login' as never);
  };

  const handleRegisterPress = () => {
    navigation.navigate('SignUp' as never);
  };

  const handleGoogleLoginPress = () => {
    console.log('Google login pressed');
  };

  const handleFacebookLoginPress = () => {
    console.log('Facebook login pressed');
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
        averageRating={ratingSummary.averageRating}
        totalReviews={ratingSummary.totalReviews}
        fiveStarCount={ratingSummary.fiveStarCount}
        fourStarCount={ratingSummary.fourStarCount}
        threeStarCount={ratingSummary.threeStarCount}
        twoStarCount={ratingSummary.twoStarCount}
        oneStarCount={ratingSummary.oneStarCount}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchProductReviews}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📝 Chưa có đánh giá nào</Text>
          <Text style={styles.emptySubText}>
            Hãy là người đầu tiên đánh giá sản phẩm này!
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={item => item.id}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Action Bar */}
      <BottomActionBar
        onFavoritePress={() => console.log('Favorite pressed')}
        onChatPress={() => console.log('Chat pressed')}
        onCartPress={() => console.log('Add to cart pressed')}
        onBuyPress={() => console.log('Buy pressed')}
        onLogin={handleLoginPress}
        onRegister={handleRegisterPress}
        onGoogleLogin={handleGoogleLoginPress}
        onFacebookLogin={handleFacebookLoginPress}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default ReviewListScreen;
