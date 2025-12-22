import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import CartHeader from '../components/CartHeader';
import CartList, {CartItemData} from '../components/CartList';
import ProductRecommended from '../../productdetails/components/ProductRecommended';
import CartBottomBar from '../components/CartBottomBar';
import EmptyCart from '../components/EmptyCart';
import {CartApi, CartItem} from '../services/cartApi';

interface CartScreenProps {
  onBackPress?: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({onBackPress}) => {
  const navigation = useNavigation<any>();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart khi screen được focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('[CartScreen] useFocusEffect triggered - calling loadCart()');
      loadCart();
    }, []),
  );

  const loadCart = async () => {
    console.log('[CartScreen] loadCart() started');
    setIsLoading(true);
    setError(null);
    try {
      console.log('[CartScreen] Calling CartApi.getCart()...');
      const response = await CartApi.getCart();
      console.log('[CartScreen] CartApi.getCart() response:', response);

      // Map API response to CartItemData format
      const formattedItems: CartItemData[] =
        response.items?.map((item: CartItem) => {
          console.log('[CartScreen] Item data:', {
            item_id: (item as any).item_id,
            id: item.id,
            product_name: item.product_name,
            thumbnail: (item as any).thumbnail,
            image_url: item.image_url,
            variant_id: item.variant_id,
          });
          return {
            id: item.id || (item as any).item_id,
            image:
              (item as any).thumbnail ||
              item.image_url ||
              'https://via.placeholder.com/150x150/f0f0f0/666666?text=No+Image',
            name: item.product_name,
            size:
              item.color && item.size
                ? `${item.color}, Size ${item.size}`
                : 'N/A',
            price: item.price,
            quantity: item.quantity,
            variant_id: item.variant_id,
          };
        }) || [];

      console.log('[CartScreen] Formatted items:', formattedItems);
      setCartItems(formattedItems);
    } catch (err: any) {
      console.error('[CartScreen] Error loading cart:', err);
      setError(err.message || 'Không thể tải giỏ hàng');
      Alert.alert('Lỗi', err.message || 'Không thể tải giỏ hàng');
    } finally {
      setIsLoading(false);
      console.log('[CartScreen] loadCart() finished');
    }
  };

  const handleChatPress = () => {
    Alert.alert('Thông báo', 'Chức năng thông báo chưa được triển khai');
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleItemRemove = async (id: string) => {
    try {
      console.log('[CartScreen] handleItemRemove called with id:', id);
      setIsLoading(true);
      await CartApi.removeItem(id);

      setCartItems(cartItems.filter(item => item.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));

      Alert.alert('Thành công', 'Sản phẩm đã được xóa');
    } catch (err: any) {
      console.error('Error removing item:', err);
      Alert.alert('Lỗi', err.message || 'Không thể xóa sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        handleItemRemove(id);
        return;
      }

      setIsLoading(true);
      await CartApi.updateItemQuantity(id, quantity);

      setCartItems(
        cartItems.map(item => (item.id === id ? {...item, quantity} : item)),
      );
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật số lượng');
      // Reload cart nếu có lỗi
      await loadCart();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedItems(ids);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm để thanh toán');
      return;
    }

    const selectedCartItems = cartItems.filter(item =>
      selectedItems.includes(item.id),
    );

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

  if (isLoading && cartItems.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

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

            {cartItems.length > 0 && (
              <ProductRecommended navigation={navigation} />
            )}
          </ScrollView>

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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CartScreen;
