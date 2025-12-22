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
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AppConfig} from '../../../config/AppConfig';

interface Voucher {
  id: string;
  code: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
}

const VoucherScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${AppConfig.BASE_URL}/api/vouchers`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Lỗi khi lấy danh sách voucher');
      }

      setVouchers(json.vouchers || []);
    } catch (err: any) {
      console.error('Error fetching vouchers:', err);
      setError(err.message || 'Lỗi khi lấy danh sách voucher');
      Alert.alert('Lỗi', err.message || 'Lỗi khi tải voucher');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVouchers();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const isVoucherValid = (voucher: Voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);
    return (
      voucher.is_active &&
      now >= startDate &&
      now <= endDate &&
      voucher.used_count < voucher.usage_limit
    );
  };

  const getDiscountText = (voucher: Voucher) => {
    if (voucher.discount_type === 'percent') {
      return `Giảm ${voucher.discount_value}%`;
    } else {
      return `Giảm ${formatCurrency(voucher.discount_value)}`;
    }
  };

  const renderVoucher = ({item}: {item: Voucher}) => {
    const isValid = isVoucherValid(item);
    const remainingUses = item.usage_limit - item.used_count;

    return (
      <View style={[styles.voucherCard, !isValid && styles.voucherCardInvalid]}>
        <View style={styles.voucherContent}>
          {/* Left Section - Code and Discount */}
          <View style={styles.voucherLeft}>
            <Text style={styles.voucherCode}>{item.code}</Text>
            <Text style={styles.voucherDiscount}>{getDiscountText(item)}</Text>
            <Text style={styles.voucherMinOrder}>
              Đơn tối thiểu: {formatCurrency(item.min_order_value)}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Right Section - Details */}
          <View style={styles.voucherRight}>
            <Text style={styles.voucherDescription} numberOfLines={2}>
              {item.description || 'Không có mô tả'}
            </Text>
            <Text style={styles.voucherDate}>
              Hạn dùng: {formatDate(item.end_date)}
            </Text>
            <Text
              style={[
                styles.voucherStatus,
                isValid ? styles.statusValid : styles.statusInvalid,
              ]}>
              {isValid
                ? `Còn ${remainingUses} lượt`
                : remainingUses <= 0
                ? 'Hết lượt'
                : 'Đã hết hạn'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Đang tải voucher...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voucher của bạn</Text>
        <View style={{width: 24}} />
      </View>

      {/* Content */}
      {vouchers.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../../assets/icons/Voucher.png')}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Không có voucher</Text>
          <Text style={styles.emptySubtitle}>
            Hãy quay lại sau để xem các voucher mới
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            activeOpacity={0.7}>
            <Text style={styles.refreshButtonText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchVouchers}
            activeOpacity={0.7}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          renderItem={renderVoucher}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            <Text style={styles.totalVouchers}>
              Có {vouchers.length} voucher
            </Text>
          }
        />
      )}
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
    tintColor: '#CCCCCC',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#E53935',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  totalVouchers: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    paddingHorizontal: 4,
    fontWeight: '500',
  },
  voucherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  voucherCardInvalid: {
    opacity: 0.6,
    backgroundColor: '#F9F9F9',
  },
  voucherContent: {
    flexDirection: 'row',
    padding: 16,
  },
  voucherLeft: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
    marginBottom: 4,
    letterSpacing: 1,
  },
  voucherDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  voucherMinOrder: {
    fontSize: 12,
    color: '#999999',
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  voucherRight: {
    flex: 1.2,
    justifyContent: 'center',
  },
  voucherDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 18,
  },
  voucherDate: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 6,
  },
  voucherStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  statusValid: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  statusInvalid: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
});

export default VoucherScreen;
