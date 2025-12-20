import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../../contexts/AuthContext';
import {Order} from '../../order/services/orderApi';

interface ReviewGuardProps {
  order: Order;
  children: React.ReactNode;
}

export const ReviewGuard: React.FC<ReviewGuardProps> = ({order, children}) => {
  const navigation = useNavigation<any>();
  const {user} = useAuth();

  // 1. Kiểm tra user đã login chưa
  if (!user) {
    return (
      <View style={styles.guardContainer}>
        <Text style={styles.guardIcon}>🔐</Text>
        <Text style={styles.guardTitle}>Cần đăng nhập</Text>
        <Text style={styles.guardMessage}>
          Bạn cần đăng nhập để có thể đánh giá sản phẩm
        </Text>
        <TouchableOpacity
          style={styles.guardButton}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.guardButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Kiểm tra order có thuộc user không
  if (order.user_id !== user.id) {
    return (
      <View style={styles.guardContainer}>
        <Text style={styles.guardIcon}>⚠️</Text>
        <Text style={styles.guardTitle}>Không có quyền truy cập</Text>
        <Text style={styles.guardMessage}>Đơn hàng này không thuộc về bạn</Text>
        <TouchableOpacity
          style={styles.guardButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.guardButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Kiểm tra order status có phải completed không
  if (order.status !== 'completed') {
    return (
      <View style={styles.guardContainer}>
        <Text style={styles.guardIcon}>📦</Text>
        <Text style={styles.guardTitle}>Chưa thể đánh giá</Text>
        <Text style={styles.guardMessage}>
          Bạn chỉ có thể đánh giá khi đơn hàng đã hoàn thành (giao thành công)
        </Text>
        <Text style={styles.guardSubMessage}>
          Trạng thái hiện tại:{' '}
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </Text>
        <TouchableOpacity
          style={styles.guardButton}
          onPress={() =>
            navigation.navigate('OrderDetail', {orderId: order.id})
          }>
          <Text style={styles.guardButtonText}>Xem chi tiết đơn hàng</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 4. Tất cả kiểm tra đều pass → render children
  return <>{children}</>;
};

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipped: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };
  return statusMap[status] || status;
}

const styles = StyleSheet.create({
  guardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
  },
  guardIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  guardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  guardMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  guardSubMessage: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusText: {
    color: '#E53935',
    fontWeight: '500',
  },
  guardButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  guardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
