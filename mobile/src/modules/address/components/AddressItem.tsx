import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export interface AddressItemData {
  id: string;
  fullName: string;
  phoneNumber: string;
  specificAddress: string;
  ward: string;
  district: string;
  province: string;
  isDefault?: boolean;
}

interface AddressItemProps {
  address: AddressItemData;
}

const AddressItem: React.FC<AddressItemProps> = ({address}) => {
  return (
    <View style={styles.container}>
      {/* Address Content */}
      <View style={styles.content}>
        {/* Line 1: Name, Phone and Default Badge */}
        <View style={styles.namePhoneRow}>
          <View style={styles.namePhoneContent}>
            <Text style={styles.name}>{address.fullName}</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.phone}>{address.phoneNumber}</Text>
          </View>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Mặc định</Text>
            </View>
          )}
        </View>

        {/* Line 2: Specific Address */}
        <Text style={styles.detailAddress} numberOfLines={2}>
          {address.specificAddress}
        </Text>

        {/* Line 3: Ward, District, Province */}
        <Text style={styles.locationText} numberOfLines={1}>
          {address.ward && `${address.ward}, `}
          {address.district && `${address.district}, `}
          {address.province}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 2,
    padding: 8,
    marginHorizontal: 0,
    marginVertical: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  defaultBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    marginBottom: 2,
  },
  namePhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  namePhoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    fontSize: 14,
    color: '#ddd',
    marginHorizontal: 8,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailAddress: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 3,
  },
  locationText: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
});

export default AddressItem;
