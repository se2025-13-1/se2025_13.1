import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

interface AddressSectionProps {
  userName?: string;
  phoneNumber?: string;
  address?: string;
  onPress?: () => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  userName = 'Phạm Quỳ Độ',
  phoneNumber = '+84 (34) 979 219 004',
  address = 'Số 27, Ngõ 73 Đường Tân Triều, Triều Khúc\nXã Tân Triều, Huyện Thanh Trì, Hà Nội',
  onPress,
}) => {
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
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>
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
          {address}
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
});

export default AddressSection;
