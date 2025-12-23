import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  Calendar,
  Hash,
} from 'lucide-react-native';
import {Order} from '../services/orderApi';

interface OrderResultProps {
  order: Order;
  status: string;
}

const OrderResult: React.FC<OrderResultProps> = ({order, status}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: '#FF9800',
          bgColor: '#FFF3E0',
          icon: Clock,
          text: 'Chờ xác nhận',
        };
      case 'confirmed':
        return {
          color: '#2196F3',
          bgColor: '#E3F2FD',
          icon: Package,
          text: 'Đã xác nhận',
        };
      case 'shipping':
        return {
          color: '#9C27B0',
          bgColor: '#F3E5F5',
          icon: Truck,
          text: 'Đang vận chuyển',
        };
      case 'completed':
        return {
          color: '#4CAF50',
          bgColor: '#E8F5E9',
          icon: CheckCircle2,
          text: 'Đã giao',
        };
      case 'cancelled':
        return {
          color: '#F44336',
          bgColor: '#FFEBEE',
          icon: XCircle,
          text: 'Đã hủy',
        };
      default:
        return {
          color: '#666666',
          bgColor: '#F5F5F5',
          icon: Package,
          text: 'Không xác định',
        };
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

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <View style={styles.card}>
        {/* Success Icon with Gradient Effect */}
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: statusConfig.bgColor},
          ]}>
          <View
            style={[
              styles.iconInnerCircle,
              {backgroundColor: statusConfig.color},
            ]}>
            <StatusIcon size={40} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Đơn hàng đã được tạo thành công!</Text>
        <Text style={styles.subtitle}>
          Cảm ơn bạn đã tin tưởng sử dụng dịch vụ
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Order Info Section */}
        <View style={styles.infoSection}>
          {/* Order Number */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Hash size={18} color="#666666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mã đơn hàng</Text>
              <Text style={styles.infoValue}>
                {order.id.substring(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Order Date */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Calendar size={18} color="#666666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thời gian đặt hàng</Text>
              <Text style={styles.infoValue}>
                {formatDate(order.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusConfig.bgColor,
              borderColor: statusConfig.color,
            },
          ]}>
          <StatusIcon size={16} color={statusConfig.color} strokeWidth={2.5} />
          <Text style={[styles.statusText, {color: statusConfig.color}]}>
            {statusConfig.text}
          </Text>
        </View>
      </View>

      {/* Bottom Note */}
      <Text style={styles.bottomNote}>
        Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi"
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconInnerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  infoSection: {
    width: '100%',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomNote: {
    fontSize: 12,
    color: '#999999',
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default OrderResult;
