import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {AddressApi} from '../../address/services/addressApi';

interface Address {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  province: string;
  district: string;
  ward: string;
  address_detail: string;
  is_default: boolean;
}

interface AddressSectionProps {
  onPress?: () => void;
  onSelectAddress?: (address: Address) => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  onPress,
  onSelectAddress,
}) => {
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch default address or first address on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await AddressApi.getAddresses();
      const addresses: Address[] = response.data || response;

      // Find default address or use first one
      const defaultAddress =
        addresses.find((a: Address) => a.is_default) || addresses[0];

      if (defaultAddress) {
        setAddress(defaultAddress);
        onSelectAddress?.(defaultAddress);
      }
    } catch (error) {
      console.log('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format address string
  const formatAddress = (): string => {
    if (!address) return '';
    return `${address.address_detail}, ${address.ward}, ${address.district}, ${address.province}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#E53935" />
      </View>
    );
  }

  if (!address) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}>
        <View style={styles.topRow}>
          <Image
            source={require('../../../assets/icons/Location-filled.png')}
            style={styles.locationIcon}
          />
          <View style={styles.userInfo}>
            <Text style={styles.emptyText}>Chưa có địa chỉ giao hàng</Text>
          </View>
          <Image
            source={require('../../../assets/icons/ArrowForward.png')}
            style={styles.arrowIcon}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Top Row: Location Icon, Name, Phone, and Arrow */}
      <View style={styles.topRow}>
        <Image
          source={require('../../../assets/icons/Location-filled.png')}
          style={styles.locationIcon}
        />
        <View style={styles.userInfo}>
          <View style={styles.userNamePhoneRow}>
            <Text style={styles.userName}>{address.recipient_name}</Text>
            <Text style={styles.phoneNumber}>{address.recipient_phone}</Text>
          </View>
        </View>
        <Image
          source={require('../../../assets/icons/ArrowForward.png')}
          style={styles.arrowIcon}
        />
      </View>

      {/* Address - Two Lines */}
      <View style={styles.addressRow}>
        <Text style={styles.address} numberOfLines={2}>
          {formatAddress()}
        </Text>
      </View>
    </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationIcon: {
    width: 17,
    height: 17,
    marginRight: 5,
    tintColor: '#E53935',
  },
  userInfo: {
    flex: 1,
  },
  userNamePhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  phoneNumber: {
    fontSize: 13,
    color: '#999999',
  },
  arrowIcon: {
    width: 17,
    height: 17,
    marginLeft: 12,
    tintColor: '#999999',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 20,
  },
  address: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
});

export default AddressSection;
