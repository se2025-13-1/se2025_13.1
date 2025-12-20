import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {ReviewStatusBadge} from './ReviewStatusBadge';
import {ReviewForm} from './ReviewForm';
import {ReviewApi, ProductReview} from '../../services/review.api';

interface OrderItem {
  id: string;
  product_variant_id: string;
  product_name?: string;
  thumbnail?: string;
  quantity: number;
  price: number;
  variant_info?:
    | {
        size?: string;
        color?: string;
        product_name?: string;
        product_image?: string;
        product_id?: string;
      }
    | string;
}

interface ReviewEntryItemProps {
  orderItem: OrderItem;
  onReviewSuccess?: () => void;
}

export const ReviewEntryItem: React.FC<ReviewEntryItemProps> = ({
  orderItem,
  onReviewSuccess,
}) => {
  const [existingReview, setExistingReview] = useState<ProductReview | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  // Component này đại diện cho 1 order_item
  // Quyết định hiển thị form hay badge đã review

  useEffect(() => {
    // Kiểm tra xem order_item này đã được review chưa
    checkExistingReview();
  }, [orderItem.id]);

  const checkExistingReview = async () => {
    try {
      // Tạm thời set null - có thể gọi API kiểm tra existing review sau
      // Hiện tại BE chưa có endpoint GET review by order_item_id
      setExistingReview(null);
    } catch (err) {
      console.error('Error checking existing review:', err);
    }
  };

  const handleReviewSubmitted = (review: ProductReview) => {
    setExistingReview(review);
    onReviewSuccess?.();
  };

  // Parse variant_info if it's a string
  let variantInfo: any = {};
  if (typeof orderItem.variant_info === 'string') {
    try {
      variantInfo = JSON.parse(orderItem.variant_info);
    } catch (e) {
      variantInfo = {};
    }
  } else {
    variantInfo = orderItem.variant_info || {};
  }

  // Determine the best image source
  const getProductImage = () => {
    // Priority: thumbnail -> variant_info.product_image -> placeholder
    if (orderItem.thumbnail) {
      return orderItem.thumbnail;
    }
    if (variantInfo.product_image) {
      return variantInfo.product_image;
    }
    return 'https://via.placeholder.com/80x80';
  };

  // Determine product name
  const getProductName = () => {
    return orderItem.product_name || variantInfo.product_name || 'Sản phẩm';
  };

  return (
    <View style={styles.container}>
      {/* Thông tin sản phẩm */}
      <View style={styles.productInfo}>
        <Image source={{uri: getProductImage()}} style={styles.productImage} />

        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {getProductName()}
          </Text>

          <View style={styles.variantInfo}>
            {variantInfo.size && (
              <Text style={styles.variantText}>Size: {variantInfo.size}</Text>
            )}
            {variantInfo.color && (
              <Text style={styles.variantText}>Màu: {variantInfo.color}</Text>
            )}
          </View>

          <Text style={styles.quantity}>Số lượng: {orderItem.quantity}</Text>
        </View>

        <ReviewStatusBadge isReviewed={!!existingReview} />
      </View>

      {/* Quyết định hiển thị gì */}
      {existingReview ? (
        // Đã review → hiển thị thông tin review đã gửi
        <View style={styles.reviewedInfo}>
          <Text style={styles.reviewedText}>
            ✅ Bạn đã đánh giá sản phẩm này
          </Text>
          <View style={styles.existingReview}>
            <Text style={styles.ratingText}>
              {'⭐'.repeat(existingReview.rating)} ({existingReview.rating}/5)
            </Text>
            {existingReview.comment && (
              <Text style={styles.commentText}>{existingReview.comment}</Text>
            )}
          </View>
        </View>
      ) : (
        // Chưa review → hiển thị form
        <ReviewForm
          orderItemId={orderItem.id}
          productId={variantInfo.product_id || ''}
          onSubmitSuccess={handleReviewSubmitted}
          disabled={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 5,
  },
  variantInfo: {
    marginBottom: 5,
  },
  variantText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 12,
    color: '#666666',
  },
  reviewedInfo: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reviewedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 10,
  },
  existingReview: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
});
