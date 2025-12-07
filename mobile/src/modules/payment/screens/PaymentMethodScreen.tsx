import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
}

const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  {id: '1', name: 'Thanh toán khi nhận hàng'},
  {id: '2', name: 'Ví MoMo'},
  {id: '3', name: 'Ví Zalopay'},
  {id: '4', name: 'Thẻ tín dụng/Ghi nợ'},
  {id: '5', name: 'VNPAY'},
  {id: '6', name: 'Viettel Money'},
  {id: '7', name: 'VietQR'},
  {id: '8', name: 'Chuyển khoản ngân hàng'},
  {id: '9', name: 'Napas'},
  {id: '10', name: 'Trả góp'},
];

const PaymentMethodScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {selectedMethod: initialSelected = '1'} = route.params || {};

  const [selectedMethod, setSelectedMethod] = useState<string>(initialSelected);

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleConfirm = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn phương thức thanh toán</Text>
        <View style={{width: 24}} />
      </View>

      {/* Payment Methods List */}
      <ScrollView style={styles.methodsList}>
        {ALL_PAYMENT_METHODS.map(method => (
          <TouchableOpacity
            key={method.id}
            onPress={() => handleSelectMethod(method.id)}
            style={[
              styles.methodItem,
              selectedMethod === method.id && styles.methodItemActive,
            ]}>
            <View style={styles.methodContent}>
              <Text style={styles.methodName}>{method.name}</Text>
            </View>
            <View
              style={[
                styles.checkbox,
                selectedMethod === method.id && styles.checkboxActive,
              ]}>
              {selectedMethod === method.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  methodsList: {
    flex: 1,
    padding: 12,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  methodItemActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#E53935',
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
  confirmButton: {
    marginHorizontal: 12,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#E53935',
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PaymentMethodScreen;
