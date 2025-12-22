import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import ProductReviewItem from './ProductReviewItem';
import {ReviewApi, ProductReview} from '../../reviews/services/review.api';

interface ProductReviewListProps {
  productId: string; // Required to fetch reviews
  reviews?: Array<{
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    reviewText: string;
    timestamp: string;
    verified?: boolean;
    likeCount?: number;
  }>;
  totalReviewCount?: number;
  averageRating?: number;
  onSeeAllPress?: () => void;
}

const ProductReviewList: React.FC<ProductReviewListProps> = ({
  productId,
  reviews: propReviews,
  totalReviewCount = 0,
  averageRating = 0,
  onSeeAllPress,
}) => {
  const [reviews, setReviews] = useState<any[]>(propReviews || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchPreviewReviews();
    }
  }, [productId]);

  const fetchPreviewReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ReviewApi.getProductReviews(productId, {
        page: 1,
        limit: 3, // Only get first 3 reviews for preview
      });

      // Map backend ProductReview to component format
      const mappedReviews = response.reviews.map((review: ProductReview) => ({
        id: review.id,
        userName: review.user_name || 'Người dùng',
        userAvatar: review.user_avatar,
        rating: review.rating,
        reviewText: review.comment || '',
        timestamp: formatTimestamp(review.created_at),
        verified: review.is_approved,
        likeCount: 0, // Backend doesn't support likes yet
        images: review.images || [], // Add images from backend
      }));

      setReviews(mappedReviews);
    } catch (err: any) {
      console.error('Error fetching preview reviews:', err);
      setError(err.message || 'Không thể tải đánh giá');
      // Don't show alert for preview - just log error
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hôm nay';
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
      return `${Math.floor(diffDays / 30)} tháng trước`;
    } catch {
      return dateString;
    }
  };
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          source={
            i <= rating
              ? require('../../../assets/icons/Star.png')
              : require('../../../assets/icons/StarEmpty.png')
          }
          style={styles.ratingStarIcon}
        />,
      );
    }
    return stars;
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* Reviews Header */}
      <View style={styles.header}>
        <View style={styles.ratingInfoContainer}>
          {/* Rating Box */}
          <View style={styles.ratingBoxSection}>
            <Text style={styles.averageRating}>{averageRating}</Text>
            <View style={styles.starsContainer}>
              <Image
                source={require('../../../assets/icons/Star.png')}
                style={styles.ratingStarIcon}
              />
            </View>
          </View>

          {/* Title and Count */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.reviewTitle}>Đánh Giá Sản Phẩm</Text>
              <Text style={styles.reviewCount}>
                ({formatCount(totalReviewCount)})
              </Text>
            </View>
          </View>
        </View>

        {/* See All Button */}
        {reviews.length > 0 && (
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={onSeeAllPress}
            activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Tất cả</Text>
            <Image
              source={require('../../../assets/icons/ArrowForward.png')}
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsListContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#E53935" />
            <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Không thể tải đánh giá</Text>
          </View>
        ) : reviews.length > 0 ? (
          <>
            {reviews.slice(0, 3).map(review => (
              <ProductReviewItem
                key={review.id}
                id={review.id}
                userName={review.userName}
                userAvatar={review.userAvatar}
                rating={review.rating}
                reviewText={review.reviewText}
                timestamp={review.timestamp}
                verified={review.verified}
                likeCount={review.likeCount}
                images={review.images}
              />
            ))}

            {/* View All Button */}
            {totalReviewCount > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={onSeeAllPress}
                activeOpacity={0.7}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
                <Image
                  source={require('../../../assets/icons/ArrowForward.png')}
                  style={styles.viewAllIcon}
                />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Chưa có đánh giá nào</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingSection: {
    flex: 1,
  },
  ratingBoxSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 3,
  },
  ratingBox: {
    alignItems: 'flex-start',
  },
  titleSection: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222222',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 2,
  },
  ratingInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingStarIcon: {
    width: 16,
    height: 16,
    marginRight: 0,
  },
  reviewCountLabel: {
    fontSize: 12,
    color: '#999999',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
    marginRight: 4,
  },
  chevronIcon: {
    width: 16,
    height: 16,
  },
  reviewsListContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333333',
    marginRight: 4,
  },
  viewAllIcon: {
    width: 16,
    height: 16,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  errorContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#E53935',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default ProductReviewList;
