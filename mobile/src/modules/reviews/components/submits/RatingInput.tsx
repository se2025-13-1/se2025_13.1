import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface RatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  maxRating?: number;
}

export const RatingInput: React.FC<RatingInputProps> = ({
  rating,
  onRatingChange,
  disabled = false,
  maxRating = 5,
}) => {
  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= maxRating; i++) {
      const isSelected = i <= rating;

      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => !disabled && onRatingChange(i)}
          style={styles.starButton}
          disabled={disabled}>
          <Text style={[styles.star, isSelected && styles.selectedStar]}>
            ⭐
          </Text>
        </TouchableOpacity>,
      );
    }

    return stars;
  };

  const getRatingText = (rating: number) => {
    const texts = {
      0: 'Chưa đánh giá',
      1: 'Rất không hài lòng',
      2: 'Không hài lòng',
      3: 'Tạm ổn',
      4: 'Hài lòng',
      5: 'Rất hài lòng',
    };
    return texts[rating as keyof typeof texts] || '';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Đánh giá sản phẩm *</Text>

      <View style={styles.starsContainer}>{renderStars()}</View>

      <Text style={[styles.ratingText, rating === 0 && styles.placeholderText]}>
        {getRatingText(rating)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  star: {
    fontSize: 24,
    opacity: 0.3,
  },
  selectedStar: {
    opacity: 1,
  },
  ratingText: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
  },
  placeholderText: {
    color: '#999999',
  },
});
