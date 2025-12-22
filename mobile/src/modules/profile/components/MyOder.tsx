import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  PackageCheck,
} from 'lucide-react-native';

interface OrderStatus {
  id: string;
  label: string;
  count: number;
  icon: typeof Clock;
  tabIndex: number;
}

interface MyOderProps {
  onViewHistoryPress?: () => void;
  onStatusPress?: (statusId: string) => void;
  navigation?: any;
}

const MyOder: React.FC<MyOderProps> = ({
  onViewHistoryPress,
  onStatusPress,
  navigation,
}) => {
  const orderStatuses: OrderStatus[] = [
    {
      id: 'pending-confirmation',
      label: 'Chờ xác nhận',
      count: 2,
      icon: Clock,
      tabIndex: 0,
    },
    {
      id: 'pending-pickup',
      label: 'Chờ lấy hàng',
      count: 0,
      icon: PackageCheck,
      tabIndex: 1,
    },
    {
      id: 'pending-delivery',
      label: 'Đang giao hàng',
      count: 1,
      icon: Truck,
      tabIndex: 2,
    },
    {
      id: 'delivered',
      label: 'Đã giao',
      count: 5,
      icon: CheckCircle,
      tabIndex: 3,
    },
    {
      id: 'cancelled',
      label: 'Đã hủy',
      count: 0,
      icon: XCircle,
      tabIndex: 4,
    },
  ];

  const handleStatusPress = (status: OrderStatus) => {
    // Call the onStatusPress callback if provided
    onStatusPress?.(status.id);

    // Navigate to MyOrderScreen with the selected tab index
    if (navigation) {
      navigation.navigate('MyOrder', {
        initialTab: status.tabIndex,
      });
    }
  };

  const renderStatusButton = (status: OrderStatus) => {
    const IconComponent = status.icon;
    return (
      <TouchableOpacity
        key={status.id}
        style={styles.statusButton}
        onPress={() => handleStatusPress(status)}
        activeOpacity={0.7}>
        <View style={styles.statusIconContainer}>
          <IconComponent size={40} color="#333333" />
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
          <ChevronRight size={16} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Status Buttons Section */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}>
        <View style={styles.statusesContainer}>
          {orderStatuses.map(renderStatusButton)}
        </View>
      </ScrollView>
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
  scrollContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  statusesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statusButton: {
    alignItems: 'center',
    minWidth: 70,
    paddingHorizontal: 8,
  },
  statusIconContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
});

export default MyOder;
