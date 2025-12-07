import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CartHeader from '../components/CartHeader';
import CartList, {CartItemData} from '../components/CartList';
import CartRecommend from '../components/CartRecommend';
import CartBottomBar from '../components/CartBottomBar';
import EmptyCart from '../components/EmptyCart';

interface CartScreenProps {
  onBackPress?: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({onBackPress}) => {
  const navigation = useNavigation<any>();
  const [cartItems, setCartItems] = useState<CartItemData[]>([
    // Mock data từ ProductCard
    {
      id: '1',
      image:
        'https://via.placeholder.com/150x150/f0f0f0/666666?text=Túi+đựng+đồ',
      name: 'Túi đựng đồ da nữ thời trang cao cấp',
      size: 'Đen, Size L',
      originalPrice: 80000,
      price: 50000,
      discount: '12.12',
      quantity: 1,
    },
    {
      id: '2',
      image: 'https://via.placeholder.com/150x150/f0f0f0/666666?text=Sản+Phẩm',
      name: 'Túi đựng đồ da nữ thời trang cao cấp',
      size: 'Nâu, Size M',
      price: 50000,
      quantity: 2,
    },
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleChatPress = () => {
    Alert.alert('Thông báo', 'Chức năng thông báo chưa được triển khai');
  };

  const handleBackPress = () => {
    // Nếu có callback, gọi nó (set activeTab về home)
    if (onBackPress) {
      onBackPress();
    } else {
      // Fallback: navigate về Home
      navigation.navigate('Home');
    }
  };

  const handleItemRemove = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    setSelectedItems(selectedItems.filter(itemId => itemId !== id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setCartItems(
      cartItems.map(item => (item.id === id ? {...item, quantity} : item)),
    );
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedItems(ids);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      // Select all items
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      // Deselect all items
      setSelectedItems([]);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm để thanh toán');
      return;
    }

    // Get selected cart items for checkout
    const selectedCartItems = cartItems.filter(item =>
      selectedItems.includes(item.id),
    );

    // Navigate to PaymentScreen with selected items
    navigation.navigate('Payment', {
      cartItems: selectedCartItems,
      totalPrice: selectedCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      totalQuantity: selectedCartItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
    });
  };

  const handleContinueShopping = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.navigate('Home');
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.length
    ? cartItems
        .filter(item => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
    : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <CartHeader
        cartCount={totalItems}
        onNotificationPress={handleChatPress}
        onBackPress={handleBackPress}
      />

      {cartItems.length === 0 ? (
        <EmptyCart onContinueShopping={handleContinueShopping} />
      ) : (
        <>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            <CartList
              items={cartItems}
              selectedItems={selectedItems}
              onItemRemove={handleItemRemove}
              onQuantityChange={handleQuantityChange}
              onSelectionChange={handleSelectionChange}
            />

            {/* Recommended Products - Only show if cart is not empty */}
            {cartItems.length > 0 && <CartRecommend navigation={navigation} />}
          </ScrollView>

          {/* Bottom Bar */}
          <CartBottomBar
            totalPrice={
              selectedItems.length
                ? cartItems
                    .filter(item => selectedItems.includes(item.id))
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                : totalPrice
            }
            itemCount={cartItems.length}
            selectedCount={cartItems
              .filter(item => selectedItems.includes(item.id))
              .reduce((sum, item) => sum + item.quantity, 0)}
            selectAllChecked={
              selectedItems.length === cartItems.length && cartItems.length > 0
            }
            onSelectAll={handleSelectAll}
            onCheckout={handleCheckout}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
  },
});

export default CartScreen;
