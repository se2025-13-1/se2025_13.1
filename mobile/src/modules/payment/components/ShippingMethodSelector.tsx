import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface ShippingMethodSelectorProps {
  onSelect?: (method: string) => void;
}

const SHIPPING_METHODS = [
  {
    key: 'fast',
    label: 'Nhanh',
    arrival: 'Nhận hàng vào 10/12',
    price: 'Miễn phí',
  },
  {
    key: 'express',
    label: 'Hỏa tốc',
    arrival: 'Nhận hàng vào 08/12',
    price: '20.000đ',
  },
];

const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({
  onSelect,
}) => {
  const [selected, setSelected] = useState('fast');

  const handleSelect = (key: string) => {
    setSelected(key);
    if (onSelect) onSelect(key);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phương thức vận chuyển</Text>
      <View style={styles.optionsRow}>
        {SHIPPING_METHODS.map(method => (
          <TouchableOpacity
            key={method.key}
            style={[
              styles.methodBox,
              selected === method.key && styles.methodBoxActive,
            ]}
            onPress={() => handleSelect(method.key)}>
            <Text style={styles.methodLabel}>{method.label}</Text>
            <Text style={styles.methodArrival}>{method.arrival}</Text>
            <Text
              style={
                selected === method.key
                  ? styles.methodPriceActive
                  : styles.methodPrice
              }>
              {method.price}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodBox: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  methodBoxActive: {
    borderColor: '#E53935',
    backgroundColor: '#FFF5F5',
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  methodArrival: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  methodPrice: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  methodPriceActive: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '700',
  },
});

export default ShippingMethodSelector;
