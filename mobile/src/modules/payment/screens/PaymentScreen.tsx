import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AddressSection from '../components/AddressSection';
import ProductItem from '../components/ProductItem';
import ShippingMethodSelector from '../components/ShippingMethodSelector';
import VoucherSection from '../components/VoucherSection';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import OrderSummary from '../components/OrderSummary';
import BottomCheckoutBar from '../components/BottomCheckoutBar';

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddressPress = () => {
    // Navigate to address selection or edit
    console.log('Address pressed');
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
          userName="Phạm Quỳ Độ"
          phoneNumber="+84 (34) 979 219 004"
          address="Số 27, Ngõ 73 Đường Tân Triều, Triều Khúc\nXã Tân Triều, Huyện Thanh Trì, Hà Nội"
          onPress={handleAddressPress}
        />

        {/* Products Section */}
        <ProductItem
          productName="Áo Sweater Có Zip PN STORE Vải Nỉ Da Cá Khóa..."
          color="Đen"
          size="M"
          price={139920}
          quantity={1}
          image="https://via.placeholder.com/80x100/000000/000000?text=Product"
        />

        <ShippingMethodSelector />

        <VoucherSection />

        <PaymentMethodSelector />

        <OrderSummary
          subtotal={159000}
          shippingFee={22200}
          shippingDiscount={-22200}
          voucherDiscount={-19080}
          total={139920}
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
        total={139920}
        saved={132880}
        onCheckout={() => console.log('Checkout pressed')}
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
