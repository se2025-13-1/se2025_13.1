import React, {useState} from 'react';
import {View, TextInput, StyleSheet, ScrollView, Text} from 'react-native';

interface AddressInputProps {
  onAddressChange?: (address: AddressData) => void;
  initialAddress?: AddressData;
}

export interface AddressData {
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  specificAddress: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
  onAddressChange,
  initialAddress,
}) => {
  const [address, setAddress] = useState<AddressData>(
    initialAddress || {
      fullName: '',
      phoneNumber: '',
      province: '',
      district: '',
      ward: '',
      specificAddress: '',
    },
  );

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    const updatedAddress = {...address, [field]: value};
    setAddress(updatedAddress);
    onAddressChange?.(updatedAddress);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Full Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập họ và tên"
          placeholderTextColor="#999"
          value={address.fullName}
          onChangeText={value => handleAddressChange('fullName', value)}
        />
      </View>

      {/* Phone Number */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Số điện thoại *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={address.phoneNumber}
          onChangeText={value => handleAddressChange('phoneNumber', value)}
        />
      </View>

      {/* Province */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tỉnh/Thành phố *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập Tỉnh/Thành phố"
          placeholderTextColor="#999"
          value={address.province}
          onChangeText={value => handleAddressChange('province', value)}
        />
      </View>

      {/* District */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Quận/Huyện *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập Quận/Huyện"
          placeholderTextColor="#999"
          value={address.district}
          onChangeText={value => handleAddressChange('district', value)}
        />
      </View>

      {/* Ward */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phường/Xã *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập Phường/Xã"
          placeholderTextColor="#999"
          value={address.ward}
          onChangeText={value => handleAddressChange('ward', value)}
        />
      </View>

      {/* Specific Address */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Địa chỉ cụ thể *</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Nhập địa chỉ cụ thể (số nhà, đường, ...)"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          value={address.specificAddress}
          onChangeText={value => handleAddressChange('specificAddress', value)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});

export default AddressInput;
