import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {ReviewGuard} from '../components/ReviewGuard';
import {ReviewEntryItem} from '../components/submits/ReviewEntryItem';
import {OrderApi, Order} from '../../order/services/orderApi';

type ReviewSubmitRouteProps = RouteProp<{params: {orderId: string}}, 'params'>;

const ReviewSubmitScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ReviewSubmitRouteProps>();
  const {orderId} = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderData = await OrderApi.getOrder(orderId);
      setOrder(orderData);
    } catch (err: any) {
      console.error('Error fetching order for review:', err);
      setError(err.message || 'Lỗi khi tải thông tin đơn hàng');
      Alert.alert('Lỗi', err.message || 'Lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    // Show success message and navigate back to OrderDetail
    Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi!', [
      {
        text: 'OK',
        onPress: () => {
          // Navigate back to OrderDetail screen
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/Back.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/Back.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            ⚠️ {error || 'Không tìm thấy đơn hàng'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
        <View style={styles.spacer} />
      </View>

      {/* Guard kiểm tra quyền đánh giá */}
      <ReviewGuard order={order}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderInfoText}>
            Đơn hàng #{order.id?.slice(-8)}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>
            Đánh giá sản phẩm ({order.items?.length || 0} sản phẩm)
          </Text>

          {/* Render từng order_item để đánh giá */}
          {order.items?.map((item, index) => (
            <ReviewEntryItem
              key={`${item.id}_${index}`}
              orderItem={item}
              onReviewSuccess={handleReviewSuccess}
            />
          ))}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ReviewGuard>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
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
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 24,
  },
  orderInfo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderInfoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
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
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 15,
    marginVertical: 20,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default ReviewSubmitScreen;
