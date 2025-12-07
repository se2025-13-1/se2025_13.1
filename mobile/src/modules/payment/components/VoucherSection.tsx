import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from 'react-native';

interface Voucher {
  id: string;
  code: string;
  discount: string;
  description: string;
}

interface VoucherSectionProps {
  onSelect?: (voucherId: string) => void;
}

const VOUCHERS: Voucher[] = [
  {
    id: '1',
    code: 'SHIP100K',
    discount: 'Giảm 30.000đ',
    description: 'Giảm 30.000đ cho vận chuyển đơn hàng từ 100.000đ',
  },
  {
    id: '2',
    code: 'FREESHIP50K',
    discount: 'Miễn phí ship',
    description: 'Miễn phí vận chuyển cho đơn hàng từ 500.000đ',
  },
  {
    id: '3',
    code: 'SHIP20PERCENT',
    discount: 'Giảm 20% phí ship',
    description: 'Giảm 20% phí vận chuyển toàn quốc',
  },
];

const VoucherSection: React.FC<VoucherSectionProps> = ({onSelect}) => {
  const [selectedVoucher, setSelectedVoucher] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const handleSelectVoucher = (voucherId: string) => {
    setSelectedVoucher(voucherId);
    if (onSelect) {
      onSelect(voucherId);
    }
    setShowModal(false);
  };

  const getSelectedVoucherInfo = () => {
    return VOUCHERS.find(v => v.id === selectedVoucher);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.voucherDisplayRow}
        onPress={() => setShowModal(true)}>
        <View style={styles.voucherDisplayContent}>
          <Text style={styles.title}>Voucher vận chuyển</Text>
          {selectedVoucher ? (
            <View>
              <Text style={styles.selectedVoucherCode}>
                {getSelectedVoucherInfo()?.code}
              </Text>
              <Text style={styles.selectedVoucherDiscount}>
                {getSelectedVoucherInfo()?.discount}
              </Text>
            </View>
          ) : (
            <Text style={styles.selectVoucherText}>Chọn voucher</Text>
          )}
        </View>
        <Image
          source={require('../../../assets/icons/ArrowForward.png')}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn voucher vận chuyển</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.voucherList}>
              {VOUCHERS.map(voucher => (
                <TouchableOpacity
                  key={voucher.id}
                  style={[
                    styles.voucherItem,
                    selectedVoucher === voucher.id && styles.voucherItemActive,
                  ]}
                  onPress={() => handleSelectVoucher(voucher.id)}>
                  {/* Checkbox */}
                  <View
                    style={[
                      styles.checkbox,
                      selectedVoucher === voucher.id && styles.checkboxActive,
                    ]}>
                    {selectedVoucher === voucher.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>

                  {/* Voucher Info */}
                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherCode}>{voucher.code}</Text>
                    <Text style={styles.voucherDiscount}>
                      {voucher.discount}
                    </Text>
                    <Text style={styles.voucherDescription}>
                      {voucher.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  voucherDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherDisplayContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  selectedVoucherCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E53935',
  },
  selectedVoucherDiscount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectVoucherText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#999999',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666666',
  },
  voucherList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  voucherItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 10,
  },
  voucherItemActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#E53935',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
    marginBottom: 4,
  },
  voucherDiscount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  voucherDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default VoucherSection;
