import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import ProductReviewItem from './ProductReviewItem';

interface ProductReviewListProps {
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
  reviews = [
    {
      id: '1',
      userName: 'Nguyễn Văn A',
      rating: 5,
      reviewText: 'Sản phẩm rất tốt, chất lượng cao, giao hàng nhanh',
      timestamp: '2 ngày trước',
      verified: true,
      likeCount: 9,
    },
    {
      id: '2',
      userName: 'Trần Thị B',
      rating: 4,
      reviewText: 'Túi đẹp, đúng như ảnh, rất hài lòng',
      timestamp: '5 ngày trước',
      verified: true,
      likeCount: 5,
    },
    {
      id: '3',
      userName: 'Lê Văn C',
      rating: 5,
      reviewText: 'Chất liệu tốt, bền, đáng tiền',
      timestamp: '1 tuần trước',
      verified: false,
      likeCount: 12,
    },
  ],
  totalReviewCount = 25,
  averageRating = 4.8,
  onSeeAllPress,
}) => {
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
        {reviews.length > 0 ? (
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
              />
            ))}

            {/* View All Button */}
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
