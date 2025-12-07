import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

interface RatingSummaryProps {
  averageRating?: number;
  totalReviews?: number;
  fiveStarCount?: number;
  fourStarCount?: number;
  threeStarCount?: number;
  twoStarCount?: number;
  oneStarCount?: number;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({
  averageRating = 4.8,
  totalReviews = 245,
  fiveStarCount = 180,
  fourStarCount = 45,
  threeStarCount = 15,
  twoStarCount = 3,
  oneStarCount = 2,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          source={
            i <= Math.floor(rating)
              ? require('../../../assets/icons/Star.png')
              : require('../../../assets/icons/StarEmpty.png')
          }
          style={styles.starIcon}
        />,
      );
    }
    return stars;
  };

  const getRatingPercentage = (count: number) => {
    return totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0;
  };

  const renderStarRow = (starCount: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          source={
            i <= starCount
              ? require('../../../assets/icons/Star.png')
              : require('../../../assets/icons/StarEmpty.png')
          }
          style={styles.ratingRowStarIcon}
        />,
      );
    }
    return stars;
  };

  const RatingBar = ({
    starCount,
    reviewCount,
  }: {
    starCount: number;
    reviewCount: number;
  }) => {
    const percentage = getRatingPercentage(reviewCount);
    const percentageValue =
      typeof percentage === 'string' ? parseFloat(percentage) : percentage;
    return (
      <View style={styles.ratingRow}>
        <View style={styles.starsWrapper}>{renderStarRow(starCount)}</View>
        <View style={styles.barContainer}>
          <View style={[styles.bar, {width: `${percentageValue}%`}]} />
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Section - Average Rating */}
      <View style={styles.topSection}>
        <View style={styles.ratingBox}>
          <Text style={styles.ratingText}>
            <Text style={styles.averageRating}>{averageRating}</Text>
            <Text style={styles.outOf5}>/5</Text>
          </Text>
        </View>

        <View style={styles.starsContainer}>
          <Image
            source={require('../../../assets/icons/Star.png')}
            style={styles.singleStarIcon}
          />
          <Text style={styles.totalReviews}>({totalReviews})</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Rating Distribution */}
      <View style={styles.ratingDistribution}>
        <RatingBar starCount={5} reviewCount={fiveStarCount} />
        <RatingBar starCount={4} reviewCount={fourStarCount} />
        <RatingBar starCount={3} reviewCount={threeStarCount} />
        <RatingBar starCount={2} reviewCount={twoStarCount} />
        <RatingBar starCount={1} reviewCount={oneStarCount} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 8,
    borderBottomColor: '#F5F5F5',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  ratingText: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  averageRating: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },
  outOf5: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 2,
  },
  starsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 18,
    height: 18,
    marginRight: 2,
  },
  singleStarIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  totalReviews: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  ratingDistribution: {
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsWrapper: {
    flexDirection: 'row',
    gap: 2,
    minWidth: 90,
  },
  ratingRowStarIcon: {
    width: 14,
    height: 14,
  },
  starLabel: {
    fontSize: 12,
    color: '#666666',
    minWidth: 50,
  },
  barContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 2,
  },
  percentage: {
    fontSize: 12,
    color: '#999999',
    minWidth: 35,
    textAlign: 'right',
  },
});

export default RatingSummary;
