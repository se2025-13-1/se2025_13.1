import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AddressItem, {AddressItemData} from '../components/AddressItem';
import {AddressApi} from '../services/addressApi';

interface AddressListScreenProps {
  navigation?: any;
}

const AddressListScreen: React.FC<AddressListScreenProps> = ({navigation}) => {
  const nav = useNavigation<any>();
  const [addresses, setAddresses] = useState<AddressItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch addresses when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadAddresses();
    }, []),
  );

  const loadAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AddressApi.getAddresses();

      // Map API response to AddressItemData format
      const formattedAddresses: AddressItemData[] =
        response.addresses?.map((addr: any) => ({
          id: addr.id?.toString() || '',
          fullName: addr.recipient_name || '',
          phoneNumber: addr.recipient_phone || '',
          specificAddress: addr.address_detail || '',
          ward: addr.ward || '',
          district: addr.district || '',
          province: addr.province || '',
          isDefault: addr.is_default || false,
        })) || [];

      setAddresses(formattedAddresses);
    } catch (err: any) {
      console.error('Error loading addresses:', err);
      setError(err.message || 'Không thể tải danh sách địa chỉ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    nav.goBack();
  };

  const handleAddNewAddress = () => {
    nav.navigate('AddAddress');
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setIsLoading(true);
      await AddressApi.deleteAddress(addressId);

      Alert.alert('Thành công', 'Địa chỉ đã được xóa');

      // Reload addresses
      await loadAddresses();
    } catch (err: any) {
      console.error('Error deleting address:', err);
      Alert.alert('Lỗi', err.message || 'Không thể xóa địa chỉ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setIsLoading(true);
      await AddressApi.setDefaultAddress(addressId);

      Alert.alert('Thành công', 'Đã đặt địa chỉ mặc định');

      // Reload addresses
      await loadAddresses();
    } catch (err: any) {
      console.error('Error setting default address:', err);
      Alert.alert('Lỗi', err.message || 'Không thể đặt địa chỉ mặc định');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAddressItem = ({item}: {item: AddressItemData}) => (
    <TouchableOpacity
      onPress={() => {
        nav.navigate('EditAddress', {address: item});
      }}>
      <AddressItem address={item} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Bạn chưa thêm địa chỉ nào</Text>
      <Text style={styles.emptySubText}>
        Hãy thêm địa chỉ để có thể đặt hàng
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ của tôi</Text>
        <View style={styles.spacer} />
      </View>

      {/* Loading State */}
      {isLoading && addresses.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4caf50" />
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAddresses}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Address List */}
      {!isLoading && addresses.length > 0 && (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={item => item.id}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Empty State */}
      {!isLoading && addresses.length === 0 && !error && renderEmptyState()}

      {/* Add New Address Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNewAddress}>
          <Image
            source={require('../../../assets/icons/Plus.png')}
            style={styles.plusIcon}
          />
          <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  plusIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressListScreen;
