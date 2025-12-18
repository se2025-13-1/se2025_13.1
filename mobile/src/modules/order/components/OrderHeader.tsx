import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Order} from '../services/orderApi';

interface OrderHeaderProps {
  order: Order;
  status: string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({order, status}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#2196F3';
      case 'shipping':
        return '#9C27B0';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipping':
        return 'Đang vận chuyển';
      case 'completed':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✓</Text>
      </View>

      {/* Order Number */}
      <Text style={styles.title}>Đơn hàng đã được tạo</Text>
      <Text style={styles.orderNumber}>
        Mã đơn: {order.id.substring(0, 8).toUpperCase()}
      </Text>

      {/* Status */}
      <View style={[styles.statusBadge, {backgroundColor: getStatusColor()}]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* Date */}
      <Text style={styles.date}>{formatDate(order.created_at)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#999999',
  },
});

export default OrderHeader;
