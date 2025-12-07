import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

interface ProductReviewItemProps {
  id?: string;
  userName?: string;
  userAvatar?: string;
  rating?: number;
  reviewText?: string;
  timestamp?: string;
  verified?: boolean;
  likeCount?: number;
}

const ProductReviewItem: React.FC<ProductReviewItemProps> = ({
  id = '1',
  userName = 'Nguyễn Văn A',
  userAvatar,
  rating = 5,
  reviewText = 'Sản phẩm rất tốt, chất lượng cao, giao hàng nhanh',
  timestamp = '2 ngày trước',
  verified = true,
  likeCount = 9,
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
          style={styles.starIcon}
        />,
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {/* Row 1: Avatar, Name, and Timestamp */}
      <View style={styles.headerRow}>
        {/* Avatar */}
        <Image
          source={
            userAvatar
              ? {uri: userAvatar}
              : require('../../../assets/icons/UserIcon.png')
          }
          style={styles.avatar}
        />

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>

        {/* Like Section */}
        <View style={styles.likeSection}>
          <Image
            source={require('../../../assets/icons/Like.png')}
            style={styles.likeIcon}
          />
          <Text style={styles.likeText}>Hữu ích ({likeCount})</Text>
        </View>
      </View>

      {/* Row 2: Rating Stars */}
      <View style={styles.starsRow}>{renderStars(rating)}</View>

      {/* Row 3: Review Text */}
      <Text style={styles.reviewText} numberOfLines={3}>
        {reviewText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
    marginRight: 6,
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  likeIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  likeText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  verifiedIcon: {
    width: 14,
    height: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    width: 14,
    height: 14,
    marginRight: 2,
  },
  reviewText: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 18,
  },
});

export default ProductReviewItem;
