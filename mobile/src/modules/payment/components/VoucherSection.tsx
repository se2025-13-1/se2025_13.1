import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {VoucherApi, Voucher} from '../services/VoucherApi';

interface VoucherSectionProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (voucher: Voucher) => void;
  selectedVoucher?: Voucher | null;
}

const VoucherSection: React.FC<VoucherSectionProps> = ({
  visible,
  onClose,
  onSelect,
  selectedVoucher,
}) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedVoucher?.id || null,
  );

  useEffect(() => {
    if (visible) {
      fetchVouchers();
    }
  }, [visible]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await VoucherApi.getAllVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVoucher = (voucher: Voucher) => {
    setSelectedId(voucher.id);
    onSelect(voucher);
    onClose();
  };

  const renderVoucherItem = ({item}: {item: Voucher}) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        style={[styles.voucherItem, isSelected && styles.voucherItemSelected]}
        onPress={() => handleSelectVoucher(item)}>
        {/* Voucher Code and Discount */}
        <View style={styles.voucherContent}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {item.discount_type === 'percent' ||
              item.discount_type === 'percentage'
                ? `${item.discount_value}%`
                : `${(item.discount_value || 0).toLocaleString()}đ`}
            </Text>
          </View>

          <View style={styles.voucherDetails}>
            <Text style={styles.voucherCode}>{item.code}</Text>
            <Text style={styles.voucherDescription} numberOfLines={1}>
              {item.description || 'N/A'}
            </Text>
            {item.min_purchase && (
              <Text style={styles.minPurchase}>
                Đơn tối thiểu: {item.min_purchase.toLocaleString()}đ
              </Text>
            )}
          </View>
        </View>

        {/* Selection Checkbox */}
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Không có voucher nào</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chọn Voucher</Text>
            <TouchableOpacity onPress={onClose}>
              <Image
                source={require('../../../assets/icons/Cancel.png')}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Voucher List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E53935" />
            </View>
          ) : (
            <FlatList
              data={vouchers}
              renderItem={renderVoucherItem}
              keyExtractor={item => item.id}
              ListEmptyComponent={renderEmptyList}
              contentContainerStyle={styles.listContent}
              scrollEnabled={true}
            />
          )}

          {/* Footer */}
          {selectedId && (
            <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#999999',
  },
  listContent: {
    padding: 12,
    flexGrow: 1,
  },
  voucherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  voucherItemSelected: {
    backgroundColor: '#FFF3E0',
    borderColor: '#E53935',
    borderWidth: 2,
  },
  voucherContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: '#E53935',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  voucherDetails: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  voucherDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  minPurchase: {
    fontSize: 11,
    color: '#999999',
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
  confirmButton: {
    backgroundColor: '#E53935',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VoucherSection;
