import React, {useState} from 'react';
import {View, ScrollView, StyleSheet, Text} from 'react-native';
import CartItem from './CartItem';

export interface CartItemData {
  id: string;
  image: string;
  name: string;
  size: string;
  originalPrice?: number;
  price: number;
  discount?: string;
  quantity: number;
  variant_id?: string;
}

interface CartListProps {
  items: CartItemData[];
  onItemRemove?: (id: string) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  selectedItems?: string[];
}

const CartList: React.FC<CartListProps> = ({
  items,
  onItemRemove,
  onQuantityChange,
  onSelectionChange,
  selectedItems = [],
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedItems));

  const handleSelectChange = (itemId: string, isSelected: boolean) => {
    const newSelected = new Set(selected);
    if (isSelected) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelected(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {items.length > 0 ? (
        items.map(item => (
          <CartItem
            key={item.id}
            id={item.id}
            image={item.image}
            name={item.name}
            size={item.size}
            originalPrice={item.originalPrice}
            price={item.price}
            discount={item.discount}
            quantity={item.quantity}
            selected={selected.has(item.id)}
            onSelectChange={isSelected =>
              handleSelectChange(item.id, isSelected)
            }
            onRemove={() => onItemRemove?.(item.id)}
            onQuantityChange={quantity => onQuantityChange?.(item.id, quantity)}
          />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default CartList;
