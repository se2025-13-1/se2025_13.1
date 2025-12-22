import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {ReviewApi, ProductReview} from '../services/review.api';

interface ReviewViewScreenProps {
  route: any;
  navigation: any;
}

const ReviewViewScreen: React.FC<ReviewViewScreenProps> = ({
  route,
  navigation,
}) => {
  const {orderId} = route.params;
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [orderId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await ReviewApi.getReviewsByOrder(orderId);
      setReviews(data);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  const parseVariantInfo = (variantInfo: any) => {
    if (typeof variantInfo === 'string') {
      try {
        return JSON.parse(variantInfo);
      } catch (e) {
        return {};
      }
    }
    return variantInfo || {};
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/Back.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá của bạn</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E74C3C" />
        </View>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/Back.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá của bạn</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá của bạn</Text>
        <View style={styles.spacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reviews.map((review, index) => {
          const variantInfo = parseVariantInfo(review.variant_info);
          const productImage = review.thumbnail || variantInfo.product_image;
          const productName =
            review.product_name ||
            review.full_product_name ||
            variantInfo.product_name ||
            'Sản phẩm';

          return (
            <View key={review.id || index} style={styles.reviewCard}>
              {/* Product Info */}
              <View style={styles.productInfo}>
                <Image
                  source={{
                    uri: productImage || 'https://via.placeholder.com/80x80',
                  }}
                  style={styles.productImage}
                />

                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {productName}
                  </Text>

                  {(variantInfo.size || variantInfo.color) && (
                    <View style={styles.variantInfo}>
                      {variantInfo.size && (
                        <Text style={styles.variantText}>
                          Size: {variantInfo.size}
                        </Text>
                      )}
                      {variantInfo.color && (
                        <Text style={styles.variantText}>
                          Màu: {variantInfo.color}
                        </Text>
                      )}
                    </View>
                  )}

                  {review.quantity && (
                    <Text style={styles.quantity}>
                      Số lượng: {review.quantity}
                    </Text>
                  )}
                </View>
              </View>

              {/* Review Content */}
              <View style={styles.reviewContent}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingStars}>
                    {renderStars(review.rating)}
                  </Text>
                  <Text style={styles.ratingText}>({review.rating}/5)</Text>
                </View>

                {review.comment && (
                  <Text style={styles.commentText}>{review.comment}</Text>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesScroll}>
                    {review.images.map((imageUri, imgIndex) => (
                      <Image
                        key={imgIndex}
                        source={{uri: imageUri}}
                        style={styles.reviewImage}
                      />
                    ))}
                  </ScrollView>
                )}

                {/* Review Date */}
                <Text style={styles.dateText}>
                  Đánh giá vào:{' '}
                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  reviewContent: {
    gap: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingStars: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  commentText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  imagesScroll: {
    marginTop: 5,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#F5F5F5',
  },
  dateText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 5,
  },
});

export default ReviewViewScreen;
