import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AddressSection from '../components/AddressSection';
import SelectAddress, {Address} from '../components/SelectAddress';
import ProductItem from '../components/ProductItem';
import VoucherSection from '../components/VoucherSection';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import OrderSummary from '../components/OrderSummary';
import BottomCheckoutBar from '../components/BottomCheckoutBar';

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as any;

  // Get product and variant data from navigation params
  const product = params?.product || null;
  const variant = params?.variant || null;
  const quantity = params?.quantity || 1;

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [orderNote, setOrderNote] = useState<string>('');

  // Calculate totals
  const itemPrice = variant?.price || product?.base_price || 0;
  const subtotal = itemPrice * quantity;

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

  const handleAddressSelected = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleNavigateToAddAddress = () => {
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Address Section */}
        <AddressSection
          onPress={handleAddressPress}
          onSelectAddress={handleAddressSelected}
        />

        {/* Select Address Modal */}
        <SelectAddress
          visible={showAddressModal}
          currentAddress={selectedAddress}
          onClose={() => setShowAddressModal(false)}
          onSelectAddress={handleAddressSelected}
          onNavigateToAddAddress={handleNavigateToAddAddress}
        />

        {/* Products Section */}
        {product && variant && (
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

        <PaymentMethodSelector />

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
            Nhấn <Text style={{fontWeight: '600'}}>"Đặt hàng"</Text> đồng nghĩa
            với việc bạn đồng ý tuân theo{' '}
            <Text style={styles.termsLink}>Điều khoản DoubleD Shop</Text>
          </Text>
        </View>
      </ScrollView>

      <BottomCheckoutBar
        total={total}
        saved={0}
        onCheckout={() => {
          console.log('Checkout pressed:', {
            product,
            variant,
            quantity,
            total,
          });
        }}
      />
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
