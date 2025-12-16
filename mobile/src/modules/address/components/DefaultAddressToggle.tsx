import React, {useState} from 'react';
import {View, Switch, Text, StyleSheet} from 'react-native';

interface DefaultAddressToggleProps {
  isDefault?: boolean;
  onToggle?: (isDefault: boolean) => void;
}

const DefaultAddressToggle: React.FC<DefaultAddressToggleProps> = ({
  isDefault = false,
  onToggle,
}) => {
  const [isEnabled, setIsEnabled] = useState(isDefault);

  const handleToggle = (value: boolean) => {
    setIsEnabled(value);
    onToggle?.(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Đặt làm địa chỉ mặc định</Text>
      <Switch
        style={styles.switch}
        trackColor={{false: '#e0e0e0', true: '#81c784'}}
        thumbColor={isEnabled ? '#4caf50' : '#f1f1f1'}
        ios_backgroundColor="#e0e0e0"
        onValueChange={handleToggle}
        value={isEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  switch: {
    marginLeft: 12,
  },
});

export default DefaultAddressToggle;
