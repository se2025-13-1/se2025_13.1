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
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AddressInput, {AddressData} from '../components/AddressInput';
import DefaultAddressToggle from '../components/DefaultAddressToggle';
import {AddressApi} from '../services/addressApi';
import {AddressItemData} from '../components/AddressItem';

interface RouteParams {
  address: AddressItemData;
}

const EditAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {address: initialAddress} = route.params as RouteParams;

  const [addressData, setAddressData] = useState<AddressData>({
    fullName: initialAddress.fullName,
    phoneNumber: initialAddress.phoneNumber,
    province: initialAddress.province,
    district: initialAddress.district,
    ward: initialAddress.ward,
    specificAddress: initialAddress.specificAddress,
  });

  const [isDefault, setIsDefault] = useState(initialAddress.isDefault || false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if form is valid and has changes
  useEffect(() => {
    const isValid =
      addressData.fullName.trim() !== '' &&
      addressData.phoneNumber.trim() !== '' &&
      isValidPhoneNumber(addressData.phoneNumber) &&
      addressData.province.trim() !== '' &&
      addressData.district.trim() !== '' &&
      addressData.ward.trim() !== '' &&
      addressData.specificAddress.trim() !== '';

    setIsFormValid(isValid);

    // Check if there are changes
    const addressChanged =
      addressData.fullName !== initialAddress.fullName ||
      addressData.phoneNumber !== initialAddress.phoneNumber ||
      addressData.province !== initialAddress.province ||
      addressData.district !== initialAddress.district ||
      addressData.ward !== initialAddress.ward ||
      addressData.specificAddress !== initialAddress.specificAddress;

    const defaultChanged = isDefault !== (initialAddress.isDefault || false);

    setHasChanges(addressChanged || defaultChanged);
  }, [addressData, isDefault]);

  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleAddressChange = (data: AddressData) => {
    setAddressData(data);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleDeleteAddress = () => {
    Alert.alert('Xóa địa chỉ', 'Bạn có chắc muốn xóa địa chỉ này?', [
      {
        text: 'Hủy',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Xóa',
        onPress: async () => {
          await deleteAddress();
        },
        style: 'destructive',
      },
    ]);
  };

  const deleteAddress = async () => {
    setIsLoading(true);
    try {
      await AddressApi.deleteAddress(initialAddress.id);

      Alert.alert('Thành công', 'Địa chỉ đã được xóa', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error deleting address:', error);
      Alert.alert('Lỗi', error.message || 'Không thể xóa địa chỉ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!isFormValid) {
      Alert.alert(
        'Lỗi',
        'Vui lòng điền đầy đủ và chính xác tất cả các trường thông tin.',
      );
      return;
    }

    if (!hasChanges) {
      Alert.alert('Thông báo', 'Không có thay đổi nào cần lưu');
      return;
    }

    await saveAddress();
  };

  const saveAddress = async () => {
    setIsLoading(true);
    try {
      const response = await AddressApi.updateAddress(initialAddress.id, {
        fullName: addressData.fullName,
        phoneNumber: addressData.phoneNumber,
        province: addressData.province,
        district: addressData.district,
        ward: addressData.ward,
        specificAddress: addressData.specificAddress,
        isDefault: isDefault,
      });

      console.log('Address updated:', response);

      Alert.alert('Thành công', 'Địa chỉ đã được cập nhật!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating address:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể cập nhật địa chỉ. Vui lòng thử lại.',
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Sửa địa chỉ</Text>
        <View style={styles.spacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Address Input Component */}
        <AddressInput
          onAddressChange={handleAddressChange}
          initialAddress={addressData}
        />

        {/* Default Address Toggle */}
        <View style={styles.toggleContainer}>
          <DefaultAddressToggle isDefault={isDefault} onToggle={setIsDefault} />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAddress}
          disabled={isLoading}>
          <Text style={styles.deleteButtonText}>XÓA ĐỊA CHỈ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isFormValid || !hasChanges || isLoading) &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSaveAddress}
          disabled={!isFormValid || !hasChanges || isLoading}
          activeOpacity={isFormValid && hasChanges && !isLoading ? 0.8 : 1}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>LƯU ĐỊA CHỈ</Text>
          )}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  toggleContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default EditAddressScreen;
