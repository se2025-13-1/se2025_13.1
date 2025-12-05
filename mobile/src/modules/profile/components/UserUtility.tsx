import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';

interface UtilityItem {
  id: string;
  label: string;
  icon: any;
}

interface UserUtilityProps {
  onViewMorePress?: () => void;
  onUtilityPress?: (utilityId: string) => void;
}

const UserUtility: React.FC<UserUtilityProps> = ({
  onViewMorePress,
  onUtilityPress,
}) => {
  const utilities: UtilityItem[] = [
    {
      id: 'favorites',
      label: 'Yêu thích',
      icon: require('../../../assets/icons/Heart.png'),
    },
    {
      id: 'vouchers',
      label: 'Voucher',
      icon: require('../../../assets/icons/Voucher.png'),
    },
  ];

  const renderUtilityItem = (item: UtilityItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.utilityButton}
        onPress={() => onUtilityPress?.(item.id)}
        activeOpacity={0.7}>
        <View style={styles.utilityIconContainer}>
          <Image source={item.icon} style={styles.utilityIcon} />
        </View>
        <Text style={styles.utilityLabel}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Tiện ích của tôi</Text>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={onViewMorePress}
          activeOpacity={0.7}>
          <Text style={styles.viewMoreText}>Xem thêm tiện ích</Text>
          <Image
            source={require('../../../assets/icons/ArrowForward.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Utility Items Section */}
      <View style={styles.utilitiesContainer}>
        {utilities.map(renderUtilityItem)}
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
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
    marginRight: 4,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#33333',
  },
  utilitiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  utilityButton: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  utilityIconContainer: {
    marginBottom: 8,
  },
  utilityIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: '#333333',
  },
  utilityLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
});

export default UserUtility;
