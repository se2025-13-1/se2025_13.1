import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface OrderStatusProps {
  status: string;
  orderId: string;
}

const OrderStatus: React.FC<OrderStatusProps> = ({status, orderId}) => {
  const getStatusDisplay = (status: string) => {
    const statusMap: {[key: string]: string} = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      returned: 'Đã trả hàng',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: {[key: string]: string} = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      shipping: '#00BCD4',
      completed: '#4CAF50',
      cancelled: '#F44336',
      returned: '#9C27B0',
    };
    return colorMap[status] || '#666';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusSection}>
        <Text style={styles.label}>Trạng thái:</Text>
        <View
          style={[styles.statusBadge, {borderColor: getStatusColor(status)}]}>
          <Text style={[styles.statusText, {color: getStatusColor(status)}]}>
            {getStatusDisplay(status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderIdSection}>
        <Text style={styles.label}>Mã đơn hàng:</Text>
        <Text style={styles.orderId}>{orderId.split('-')[0]}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 12,
    marginBottom: 12,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginRight: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'monospace',
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default OrderStatus;
