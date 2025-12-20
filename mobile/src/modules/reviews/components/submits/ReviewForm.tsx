import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {RatingInput} from './RatingInput';
import {ReviewTextInput} from './ReviewTextInput';
import {ReviewImagePicker} from './ReviewImagePicker';
import {ReviewSubmitButton} from './ReviewSubmitButton';
import {
  ReviewApi,
  ReviewPayload,
  ProductReview,
} from '../../services/review.api';

interface ReviewFormProps {
  orderItemId: string;
  productId: string;
  onSubmitSuccess?: (review: ProductReview) => void;
  disabled?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  orderItemId,
  productId,
  onSubmitSuccess,
  disabled = false,
}) => {
  // State quản lý form - khớp 1:1 với POST /reviews
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Validate form trước khi submit
  const isFormValid = () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Lỗi', 'Vui lòng chọn số sao từ 1 đến 5');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    if (disabled || submitting) return;

    try {
      setSubmitting(true);

      // Tạo payload gửi lên BE
      const payload: ReviewPayload = {
        order_item_id: orderItemId,
        rating,
        comment: comment.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      };

      console.log('Submitting review:', payload);

      // Gọi API
      const response = await ReviewApi.createReview(payload);

      // Call success callback immediately without showing alert here
      // Parent component (ReviewSubmitScreen) will handle success message and navigation
      onSubmitSuccess?.(response.review);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = disabled || submitting;

  return (
    <View style={styles.container}>
      <View style={styles.formSection}>
        {/* Chọn số sao */}
        <RatingInput
          rating={rating}
          onRatingChange={setRating}
          disabled={isDisabled}
        />

        {/* Nhập nội dung đánh giá */}
        <ReviewTextInput
          comment={comment}
          onCommentChange={setComment}
          disabled={isDisabled}
        />

        {/* Upload ảnh */}
        <ReviewImagePicker
          images={images}
          onImagesChange={setImages}
          disabled={isDisabled}
        />

        {/* Nút gửi */}
        <ReviewSubmitButton
          onPress={handleSubmit}
          disabled={isDisabled || rating === 0}
          loading={submitting}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  formSection: {
    gap: 15,
  },
});
