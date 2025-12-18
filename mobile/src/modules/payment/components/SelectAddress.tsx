import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import {AddressApi} from '../../address/services/addressApi';

const {height} = Dimensions.get('window');

export interface Address {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  province: string;
  district: string;
  ward: string;
  address_detail: string;
  is_default: boolean;
}

interface SelectAddressProps {
  visible: boolean;
  currentAddress?: Address | null;
  onClose: () => void;
  onSelectAddress: (address: Address) => void;
  onNavigateToAddAddress?: () => void;
  refreshKey?: number;
}

const SelectAddress: React.FC<SelectAddressProps> = ({
  visible,
  currentAddress,
  onClose,
  onSelectAddress,
  onNavigateToAddAddress,
  refreshKey,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    currentAddress?.id || null,
  );

  useEffect(() => {
    if (visible) {
      fetchAddresses();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && refreshKey !== undefined) {
      fetchAddresses();
    }
  }, [refreshKey]);

  const fetchAddresses = async () => {
    console.log('SelectAddress - fetchAddresses called');
    try {
      setLoading(true);
      const response = await AddressApi.getAddresses();
      console.log('SelectAddress - API response:', response);

      const addressList: Address[] =
        response.addresses || response.data || response;
      console.log('SelectAddress - addressList:', addressList);
      console.log('SelectAddress - addressList.length:', addressList.length);

      setAddresses(addressList);

      // Set current selected if not set
      if (!selectedId && addressList.length > 0) {
        const defaultAddr = addressList.find((a: Address) => a.is_default);
        const newSelectedId = defaultAddr?.id || addressList[0].id;
        console.log('SelectAddress - Setting selectedId to:', newSelectedId);
        setSelectedId(newSelectedId);
      }
    } catch (error) {
      console.log('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedId) {
      const selected = addresses.find((a: Address) => a.id === selectedId);
      if (selected) {
        onSelectAddress(selected);
        onClose();
      }
    }
  };

  const formatAddress = (addr: Address): string => {
    return `${addr.address_detail}, ${addr.ward}, ${addr.district}, ${addr.province}`;
  };

  const renderAddressItem = (addr: Address) => {
    const isSelected = selectedId === addr.id;

    return (
      <TouchableOpacity
        key={addr.id}
        style={[styles.addressItem, isSelected && styles.addressItemSelected]}
        onPress={() => setSelectedId(addr.id)}>
        {/* Radio Button */}
        <View style={styles.radioWrapper}>
          <View
            style={[
              styles.radioOuter,
              isSelected && styles.radioOuterSelected,
            ]}>
            {isSelected && <View style={styles.radioDot} />}
          </View>
        </View>

        {/* Address Details */}
        <View style={styles.addressDetails}>
          <View style={styles.namePhoneRow}>
            <Text style={styles.recipientName}>{addr.recipient_name}</Text>
            <Text style={styles.recipientPhone}>{addr.recipient_phone}</Text>
          </View>

          <Text style={styles.addressText} numberOfLines={2}>
            {formatAddress(addr)}
          </Text>

          {addr.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Địa chỉ mặc định</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Bottom Sheet Container */}
        <View style={styles.bottomSheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chọn địa chỉ giao hàng</Text>
            <TouchableOpacity onPress={onClose}>
              <Image
                source={require('../../../assets/icons/Cancel.png')}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E53935" />
            </View>
          ) : (
            <>
              {console.log(
                'SelectAddress - Rendering with addresses.length:',
                addresses.length,
              )}
              {console.log('SelectAddress - addresses:', addresses)}
              {addresses.length > 0 ? (
                <ScrollView
                  style={styles.addressesList}
                  showsVerticalScrollIndicator={false}>
                  {addresses.map((addr: Address) => {
                    console.log(
                      'SelectAddress - Rendering address:',
                      addr.id,
                      addr.recipient_name,
                    );
                    return renderAddressItem(addr);
                  })}
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
                  <TouchableOpacity
                    style={styles.addAddressButton}
                    onPress={() => {
                      onNavigateToAddAddress?.();
                    }}>
                    <Text style={styles.addAddressButtonText}>
                      Thêm địa chỉ mới
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* Footer - Confirm Button */}
          {addresses.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedId && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selectedId}>
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#666666',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  addressesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  addressItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addressItemSelected: {
    backgroundColor: '#FFF3F0',
    borderColor: '#E53935',
  },
  radioWrapper: {
    justifyContent: 'flex-start',
    paddingRight: 12,
    paddingTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#E53935',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935',
  },
  addressDetails: {
    flex: 1,
  },
  namePhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  recipientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  recipientPhone: {
    fontSize: 12,
    color: '#999999',
  },
  addressText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    marginBottom: 6,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: '#27AE60',
    fontWeight: '500',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 20,
  },
  addAddressButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#E53935',
    borderRadius: 6,
  },
  addAddressButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectAddress;
