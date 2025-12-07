import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';

interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}

interface PaymentMethodSelectorProps {
  onSelect?: (methodId: string) => void;
}

const POPULAR_METHODS: PaymentMethod[] = [
  {
    id: '1',
    name: 'Thanh toán khi nhận hàng',
    description: 'Thanh toán khi nhận hàng',
  },
  {id: '2', name: 'Ví MoMo', description: 'Liên kết với MoMo'},
  {id: '3', name: 'Ví Zalopay', description: 'Kết nối Ví Zalopay'},
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
}) => {
  const navigation = useNavigation<any>();
  const [selectedMethod, setSelectedMethod] = useState<string>('1');

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    if (onSelect) {
      onSelect(methodId);
    }
  };

  const getSelectedMethodName = () => {
    return POPULAR_METHODS.find(m => m.id === selectedMethod)?.name;
  };

  const handleViewAll = () => {
    navigation.navigate('PaymentMethod', {selectedMethod});
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and View All */}
      <View style={styles.header}>
        <Text style={styles.title}>Phương thức thanh toán</Text>
        <TouchableOpacity
          style={styles.viewAllButtonInline}
          onPress={handleViewAll}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Image
            source={require('../../../assets/icons/ArrowForward.png')}
            style={styles.viewAllArrow}
          />
        </TouchableOpacity>
      </View>

      {/* Popular Methods - Inline Checkboxes */}
      {POPULAR_METHODS.map(method => (
        <TouchableOpacity
          key={method.id}
          onPress={() => handleSelectMethod(method.id)}
          style={styles.methodItem}>
          <View style={styles.methodContent}>
            <Text style={styles.methodName}>{method.name}</Text>
            <Text style={styles.methodDescription}>{method.description}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 10,
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    color: '#999',
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
  viewAllButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E53935',
  },
  viewAllArrow: {
    width: 16,
    height: 16,
    tintColor: '#E53935',
    marginLeft: 8,
  },
});

export default PaymentMethodSelector;
