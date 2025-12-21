import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {OrderApi, Order} from '../services/orderApi';
import {cacheService} from '../../../services/cacheService';
import OrderItems from '../components/OrderItems';

const MyOrderScreen = ({navigation, route}: any) => {
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab ?? 0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    {id: 0, label: 'Chờ xác nhận', status: 'pending'},
    {id: 1, label: 'Chờ lấy hàng', status: 'confirmed'},
    {id: 2, label: 'Chờ giao hàng', status: 'shipping'},
    {id: 3, label: 'Đã giao', status: 'completed'},
    {id: 4, label: 'Đã hủy', status: 'cancelled'},
  ];

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // 🔄 Refresh orders when screen is focused (from background/notification)
  useFocusEffect(
    React.useCallback(() => {
      // Clear cache khi screen focus để force refresh
      cacheService.clearByPrefix('user_orders');
      fetchOrders();
    }, [activeTab]),
  );

  const fetchOrders = async (skipCache: boolean = false) => {
    try {
      setLoading(true);
      // Lấy orders với force refresh nếu skipCache = true
      const allOrders = await OrderApi.getOrders(skipCache);

      console.log('=== DEBUG: All Orders Response ===');
      console.log('Total orders:', allOrders.length);
      console.log('Full response:', JSON.stringify(allOrders, null, 2));

      const status = tabs[activeTab].status;

      console.log('Looking for status:', status);
      console.log(
        'All order statuses:',
        allOrders.map((o: any) => o.status),
      );

      const filteredOrders = allOrders.filter(order => {
        const match = order.status === status;
        console.log(
          `Order ${order.id}: status="${order.status}" vs target="${status}" = ${match}`,
        );
        return match;
      });

      console.log('Filtered count:', filteredOrders.length);

      // Gọi API chi tiết từng đơn để lấy items
      const ordersWithItems = await Promise.all(
        filteredOrders.map(async order => {
          try {
            const detailedOrder = await OrderApi.getOrder(order.id, skipCache);
            return detailedOrder;
          } catch (error) {
            console.error(
              `Error fetching order details for ${order.id}:`,
              error,
            );
            return order; // Fallback to basic order if detail fetch fails
          }
        }),
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔄 Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    // Clear cache và fetch dữ liệu mới
    cacheService.clearByPrefix('user_orders');
    await fetchOrders(true);
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
        <Text style={styles.headerTitle}>Đơn đã mua</Text>
        <View style={styles.spacer} />
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}>
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => setActiveTab(tab.id)}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.tabLabelActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E74C3C" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn không có đơn hàng nào</Text>
        </View>
      ) : (
        <View style={styles.ordersListWrapper}>
          <FlatList
            data={orders}
            renderItem={({item}) => {
              // Map API data to OrderItems component props
              const mappedItems = (item.items || []).map((orderItem: any) => {
                // Parse variant_info nếu là string
                let variantInfo: any = {};
                if (typeof orderItem.variant_info === 'string') {
                  try {
                    variantInfo = JSON.parse(orderItem.variant_info);
                  } catch (e) {
                    variantInfo = {};
                  }
                } else {
                  variantInfo = orderItem.variant_info || {};
                }

                return {
                  id: orderItem.id,
                  product_name: orderItem.product_name || '',
                  color: variantInfo.color || 'N/A',
                  size: variantInfo.size || 'N/A',
                  quantity: orderItem.quantity || 1,
                  unit_price: orderItem.unit_price || 0,
                  thumbnail: orderItem.thumbnail || '',
                };
              });

              return (
                <OrderItems
                  orderId={item.id}
                  status={item.status}
                  items={mappedItems}
                  totalAmount={item.total_amount || item.totalAmount || 0}
                  onViewDetails={orderId => {
                    navigation.navigate('OrderDetail', {orderId});
                  }}
                />
              );
            }}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#E74C3C']}
                progressBackgroundColor="#fff"
              />
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 10,
  },
  tabsScrollView: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexGrow: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 100,
  },
  tabLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
  tabLabelActive: {
    color: '#E74C3C',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  listContainer: {
    padding: 12,
  },
  ordersListWrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default MyOrderScreen;
