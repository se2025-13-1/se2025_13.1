import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {OrderApi, Order} from '../services/orderApi';
import {ReviewApi} from '../../reviews/services/review.api';
import OrderStatus from '../components/OrderStatus';
import OrderProduct from '../components/OrderProduct';
import OrderShipping from '../components/OrderShipping';

interface OrderDetailScreenProps {
  route: any;
  navigation: any;
}

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const {orderId} = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [hasReviews, setHasReviews] = useState(false);
  const [checkingReviews, setCheckingReviews] = useState(false);

  React.useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // Refresh order details when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Only refresh review status if order is already loaded
      if (order && order.status === 'completed') {
        checkOrderReviews(orderId);
      }
    }, [orderId, order]),
  );

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await OrderApi.getOrder(orderId);
      setOrder(orderData);

      // Kiểm tra xem đơn hàng đã được đánh giá chưa
      if (orderData.status === 'completed') {
        checkOrderReviews(orderId);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const checkOrderReviews = async (orderId: string) => {
    try {
      setCheckingReviews(true);
      const reviews = await ReviewApi.getReviewsByOrder(orderId);
      setHasReviews(reviews.length > 0);
    } catch (error) {
      console.error('Error checking reviews:', error);
      // Không hiển thị alert vì đây chỉ là check phụ
      setHasReviews(false);
    } finally {
      setCheckingReviews(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Xác nhận hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        {
          text: 'Không',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Có, hủy đơn hàng',
          onPress: async () => {
            try {
              setCancelling(true);
              await OrderApi.cancelOrder(orderId);
              Alert.alert('Thành công', 'Đơn hàng đã được hủy', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
            } finally {
              setCancelling(false);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  // Map items to OrderProduct format
  const mappedItems = (order?.items || []).map((orderItem: any) => {
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

    return {
      id: orderItem.id,
      product_name: orderItem.product_name || '',
      color: variantInfo.color || 'N/A',
      size: variantInfo.size || 'N/A',
      quantity: orderItem.quantity || 1,
      unit_price: orderItem.unit_price || 0,
      thumbnail: orderItem.thumbnail || '',
    };
  });

  // Check if order can be cancelled
  const canCancelOrder =
    order && (order.status === 'pending' || order.status === 'confirmed');

  // Check if order can be reviewed (completed status)
  const canReviewOrder = order && order.status === 'completed';

  const handleReviewOrder = () => {
    if (order) {
      if (hasReviews) {
        // Đã có review -> Xem đánh giá
        navigation.navigate('ReviewView', {orderId: order.id});
      } else {
        // Chưa có review -> Viết đánh giá
        navigation.navigate('ReviewSubmit', {orderId: order.id});
      }
    }
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
          <Text style={styles.headerTitle}>Thông tin đơn hàng</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E74C3C" />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/Back.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin đơn hàng</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể lấy thông tin đơn hàng</Text>
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
        <Text style={styles.headerTitle}>Thông tin đơn hàng</Text>
        <View style={styles.spacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <OrderStatus status={order.status} orderId={order.id} />

        {/* Order Product */}
        <OrderProduct
          items={mappedItems}
          totalAmount={order.total_amount || order.totalAmount || 0}
        />

        {/* Order Shipping */}
        <OrderShipping order={order} />

        {/* Review Order Button - when completed */}
        {canReviewOrder && (
          <TouchableOpacity
            style={hasReviews ? styles.viewReviewButton : styles.reviewButton}
            onPress={handleReviewOrder}
            disabled={checkingReviews}>
            {checkingReviews ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.reviewButtonText}>
                {hasReviews ? 'Xem đánh giá của bạn' : 'Đánh giá sản phẩm'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Cancel Order Button */}
        {canCancelOrder && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
            disabled={cancelling}>
            {cancelling ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  content: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
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
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  viewReviewButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrderDetailScreen;
