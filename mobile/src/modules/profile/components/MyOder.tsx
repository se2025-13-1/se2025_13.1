import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';

interface OrderStatus {
  id: string;
  label: string;
  count: number;
  icon: any;
}

interface MyOderProps {
  onViewHistoryPress?: () => void;
  onStatusPress?: (statusId: string) => void;
}

const MyOder: React.FC<MyOderProps> = ({onViewHistoryPress, onStatusPress}) => {
  const orderStatuses: OrderStatus[] = [
    {
      id: 'pending-confirmation',
      label: 'Chờ xác nhận',
      count: 2,
      icon: require('../../../assets/icons/Clock.png'),
    },
    {
      id: 'pending-delivery',
      label: 'Đang giao hàng',
      count: 1,
      icon: require('../../../assets/icons/Truck.png'),
    },
    {
      id: 'delivered',
      label: 'Đã giao',
      count: 5,
      icon: require('../../../assets/icons/Check.png'),
    },
    {
      id: 'cancelled',
      label: 'Đã hủy',
      count: 0,
      icon: require('../../../assets/icons/Close.png'),
    },
  ];

  const renderStatusButton = (status: OrderStatus) => {
    return (
      <TouchableOpacity
        key={status.id}
        style={styles.statusButton}
        onPress={() => onStatusPress?.(status.id)}
        activeOpacity={0.7}>
        <View style={styles.statusIconContainer}>
          <Image source={status.icon} style={styles.statusIcon} />
        </View>
        <Text style={styles.statusLabel}>{status.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Đơn hàng của tôi</Text>
        <TouchableOpacity
          style={styles.viewHistoryButton}
          onPress={onViewHistoryPress}
          activeOpacity={0.7}>
          <Text style={styles.viewHistoryText}>Xem lịch sử mua hàng</Text>
          <Image
            source={require('../../../assets/icons/ArrowForward.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Status Buttons Section */}
      <View style={styles.statusesContainer}>
        {orderStatuses.map(renderStatusButton)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewHistoryText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginRight: 4,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#333',
  },
  statusesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  statusIconContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  statusIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
});

export default MyOder;
