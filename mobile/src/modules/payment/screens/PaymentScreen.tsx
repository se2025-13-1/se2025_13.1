import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import AddressSection from '../components/AddressSection';
import SelectAddress, {Address} from '../components/SelectAddress';
import ProductItem from '../components/ProductItem';
import VoucherSection from '../components/VoucherSection';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import OrderSummary from '../components/OrderSummary';
import BottomCheckoutBar from '../components/BottomCheckoutBar';
import {OrderApi} from '../../order/services/orderApi';
import {AddressApi} from '../../address/services/addressApi';
import {NotificationService} from '../../../services/notificationService';

interface CartItemPayment {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant_id?: string;
  color?: string;
  size?: string;
}

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as any;

  // Support both single product (buy_now) and cartItems (from cart)
  const product = params?.product || null;
  const variant = params?.variant || null;
  const quantity = params?.quantity || 1;

  // Cart items from CartScreen
  const cartItems = params?.cartItems || null;
  const totalPrice = params?.totalPrice || 0;
  const totalQuantity = params?.totalQuantity || 0;

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [orderNote, setOrderNote] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('1');

  // Debug selectedAddress changes
  useEffect(() => {
    console.log(
      'PaymentScreen - selectedAddress changed:',
      selectedAddress
        ? {
            id: selectedAddress.id,
            name: selectedAddress.recipient_name,
            phone: selectedAddress.recipient_phone,
          }
        : null,
    );
  }, [selectedAddress]);

  // Fetch default address on mount if not already set
  useEffect(() => {
    console.log(
      'PaymentScreen - Mount, letting AddressSection handle address fetching',
    );
    // AddressSection will handle fetching and setting address via callback
  }, []);

  const handleAddressSelected = (address: Address) => {
    console.log('PaymentScreen - Address selected via callback:', address);
    setSelectedAddress(address);
  };

  // Refresh SelectAddress when screen is focused (after returning from AddAddress)
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, []),
  );

  // Determine if this is cart checkout or buy_now
  const isCartCheckout = !!cartItems && cartItems.length > 0;

  // Calculate totals
  let subtotal: number;
  if (isCartCheckout) {
    // For cart checkout, use the totalPrice passed from CartScreen
    subtotal = totalPrice;
  } else {
    // For single product buy_now, calculate from product/variant
    const itemPrice = variant?.price || product?.base_price || 0;
    subtotal = itemPrice * quantity;
  }

  // Calculate voucher discount
  let voucherDiscount = 0;
  if (selectedVoucher) {
    if (
      selectedVoucher.discount_type === 'percent' ||
      selectedVoucher.discount_type === 'percentage'
    ) {
      // Percentage discount
      voucherDiscount = Math.floor(
        (subtotal * selectedVoucher.discount_value) / 100,
      );
      // Apply max_discount limit if exists
      if (selectedVoucher.max_discount) {
        voucherDiscount = Math.min(
          voucherDiscount,
          selectedVoucher.max_discount,
        );
      }
    } else {
      // Fixed amount discount
      voucherDiscount = selectedVoucher.discount_value;
    }
  }

  const total = subtotal - voucherDiscount;

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddressPress = () => {
    setShowAddressModal(true);
  };

  const handleNavigateToAddAddress = () => {
    setShowAddressModal(false);
    navigation.navigate('AddAddress');
  };

  const handleVoucherSelect = (voucher: any) => {
    setSelectedVoucher(voucher);
    console.log('Voucher selected:', voucher);
  };

  const handleNoteChange = (note: string) => {
    setOrderNote(note);
    console.log('Order note changed:', note);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleCheckout = async () => {
    console.log('=== CHECKOUT DEBUG START ===');
    console.log('isCartCheckout:', isCartCheckout);
    console.log('selectedAddress:', selectedAddress);

    if (isCartCheckout) {
      console.log('📦 Cart checkout - cartItems:', cartItems);
    } else {
      console.log('🛍️ Buy now - product:', product);
      console.log('variant:', variant);
      console.log('quantity:', quantity);
    }

    // Validate inputs
    if (!selectedAddress) {
      console.log('❌ selectedAddress is null - showing alert');
      Alert.alert('Thông báo', 'Vui lòng chọn địa chỉ giao hàng');
      return;
    } else {
      console.log('✅ selectedAddress is valid:', {
        id: selectedAddress.id,
        name: selectedAddress.recipient_name,
        phone: selectedAddress.recipient_phone,
      });
    }

    // Validate product data
    if (!isCartCheckout && (!product || !variant)) {
      console.log('❌ product or variant is null');
      Alert.alert('Lỗi', 'Không có thông tin sản phẩm');
      return;
    }

    if (isCartCheckout && (!cartItems || cartItems.length === 0)) {
      console.log('❌ cartItems is empty');
      Alert.alert('Lỗi', 'Giỏ hàng trống');
      return;
    }

    try {
      // Map payment method ID to method name
      const paymentMethodMap: {[key: string]: string} = {
        '1': 'cod',
        '2': 'momo',
        '3': 'zalopay',
      };

      const paymentMethod = paymentMethodMap[selectedPaymentMethod] || 'cod';
      console.log('✅ paymentMethod:', paymentMethod);

      // Build items array based on checkout type
      const items: any[] = [];

      if (isCartCheckout) {
        // For cart checkout, map cartItems to items
        items.push(
          ...cartItems.map((item: CartItemPayment) => ({
            variant_id: item.variant_id || item.id,
            quantity: item.quantity,
          })),
        );
        console.log('📦 Cart items mapped:', items);
      } else {
        // For buy_now, use single product variant
        items.push({
          variant_id: variant.id,
          quantity: quantity,
        });
        console.log('🛍️ Buy now item:', items);
      }

      const orderPayload = {
        address_id: selectedAddress.id,
        type: isCartCheckout ? ('cart' as const) : ('buy_now' as const),
        items: items,
        payment_method: paymentMethod,
        ...(selectedVoucher && {voucher_code: selectedVoucher.code}),
        ...(orderNote && {note: orderNote}),
      };

      console.log(
        '✅ Final order payload:',
        JSON.stringify(orderPayload, null, 2),
      );

      console.log('📤 Calling OrderApi.createOrder...');
      const order = await OrderApi.createOrder(orderPayload);
      console.log('✅ Order created successfully:', order);

      console.log('=== CHECKOUT DEBUG END ===');

      // Hiển thị thông báo hệ thống khi đặt hàng thành công
      await NotificationService.showOrderSuccessNotification(order.id);

      // Navigate to order result screen
      navigation.navigate('OrderResult', {
        orderId: order.id,
        items: orderPayload.items,
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      // Hiển thị thông báo khi đặt hàng thất bại
      await NotificationService.showOrderFailedNotification(error.message);
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.',
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{width: 24}} />
      </View>

      <FlatList
        data={[{id: 'payment-content'}]}
        renderItem={() => (
          <View>
            {/* Address Section */}
            <AddressSection
              onPress={handleAddressPress}
              onSelectAddress={handleAddressSelected}
              selectedAddress={selectedAddress}
              refreshKey={refreshKey}
            />

            {/* Select Address Modal */}
            <SelectAddress
              visible={showAddressModal}
              currentAddress={selectedAddress}
              onClose={() => setShowAddressModal(false)}
              onSelectAddress={handleAddressSelected}
              onNavigateToAddAddress={handleNavigateToAddAddress}
              refreshKey={refreshKey}
            />

            {/* Products Section */}
            {isCartCheckout ? (
              // Show multiple items from cart
              <View>
                {cartItems?.map((item: CartItemPayment, index: number) => (
                  <ProductItem
                    key={item.id || index}
                    productName={item.name}
                    color={item.color}
                    size={item.size}
                    price={item.price}
                    quantity={item.quantity}
                    image={item.image}
                  />
                ))}
              </View>
            ) : (
              // Show single product for buy_now
              product &&
              variant && (
                <ProductItem
                  productName={product.name}
                  color={variant.color}
                  size={variant.size}
                  price={variant.price}
                  quantity={quantity}
                  image={variant.thumbnail || product.thumbnail}
                  note={orderNote}
                  onNoteChange={handleNoteChange}
                />
              )
            )}

            {/* Voucher Section */}
            <TouchableOpacity
              style={styles.voucherRow}
              onPress={() => setShowVoucherModal(true)}>
              <Text style={styles.voucherLabel}>Voucher đơn hàng</Text>
              <View style={styles.voucherRightContent}>
                <Text style={styles.voucherValue}>
                  {selectedVoucher
                    ? `${selectedVoucher.code} - ${
                        selectedVoucher.discount_type === 'percent' ||
                        selectedVoucher.discount_type === 'percentage'
                          ? `${selectedVoucher.discount_value}%`
                          : `${selectedVoucher.discount_value.toLocaleString()}đ`
                      }`
                    : 'Chọn voucher'}
                </Text>
                <Image
                  source={require('../../../assets/icons/ArrowForward.png')}
                  style={styles.arrowIcon}
                />
              </View>
            </TouchableOpacity>

            {/* Voucher Modal */}
            <VoucherSection
              visible={showVoucherModal}
              onClose={() => setShowVoucherModal(false)}
              onSelect={handleVoucherSelect}
              selectedVoucher={selectedVoucher}
            />

            <PaymentMethodSelector onSelect={handlePaymentMethodSelect} />

            <OrderSummary
              subtotal={subtotal}
              shippingFee={0}
              shippingDiscount={0}
              voucherDiscount={voucherDiscount}
              total={total}
            />

            {/* Terms and Conditions Text */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Nhấn <Text style={{fontWeight: '600'}}>"Đặt hàng"</Text> đồng
                nghĩa với việc bạn đồng ý tuân theo{' '}
                <Text style={styles.termsLink}>Điều khoản DoubleD Shop</Text>
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
      />

      <BottomCheckoutBar total={total} saved={0} onCheckout={handleCheckout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 5,
    marginVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  voucherLabel: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '400',
  },
  voucherRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  voucherValue: {
    fontSize: 12,
    color: '#999999',
  },
  arrowIcon: {
    width: 12,
    height: 12,
    tintColor: '#999999',
  },
  termsContainer: {
    marginHorizontal: 5,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  termsLink: {
    color: '#0066CC',
    fontWeight: '600',
  },
});

export default PaymentScreen;
