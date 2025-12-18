import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import OrderHeader from '../components/OrderHeader';
import OrderItems from '../components/OrderItems';
import OrderShipping from '../components/OrderShipping';
import {OrderApi, Order} from '../services/orderApi';

const OrderResultScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as any;

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add small delay to ensure order is committed in database
    const timer = setTimeout(() => {
      fetchOrderDetails();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Prevent hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Thông báo',
          'Bạn không thể quay lại màn hình thanh toán sau khi đặt hàng',
          [{text: 'OK'}],
        );
        return true; // Prevent default back action
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, []),
  );

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderId = params?.orderId;
      console.log('OrderResultScreen - Params:', params);
      console.log('OrderResultScreen - OrderId:', orderId);

      if (!orderId) {
        throw new Error('Không tìm thấy thông tin đơn hàng');
      }

      const orderData = await OrderApi.getOrder(orderId);
      console.log('OrderResultScreen - Order:', orderData);

      setOrder(orderData);

      // Use items from order data if available
      if (orderData.items && orderData.items.length > 0) {
        setOrderItems(orderData.items);
      } else if (params?.items) {
        setOrderItems(params.items);
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Lỗi khi tải thông tin đơn hàng');
      Alert.alert('Lỗi', err.message || 'Lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleBackHome = () => {
    navigation.navigate('Home');
  };

  const handleViewOrders = () => {
    navigation.navigate('Orders');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          ⚠️ {error || 'Không tìm thấy đơn hàng'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchOrderDetails}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - No back button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Header - Success Message */}
        <OrderHeader order={order} status={order.status} />

        {/* Order Items */}
        <OrderItems order={order} items={orderItems} />

        {/* Order Shipping Info */}
        <OrderShipping order={order} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.viewOrdersButton}
          onPress={handleViewOrders}>
          <Text style={styles.viewOrdersButtonText}>Xem đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backHomeButton}
          onPress={handleBackHome}>
          <Text style={styles.backHomeButtonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666666',
  },
  errorText: {
    fontSize: 14,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#E53935',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  viewOrdersButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewOrdersButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  backHomeButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backHomeButtonText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default OrderResultScreen;
