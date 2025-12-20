import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HistorySearchProps {
  onHistoryItemPress: (item: string) => void;
}

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

const HistorySearch: React.FC<HistorySearchProps> = ({onHistoryItemPress}) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load history từ AsyncStorage khi component mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        setSearchHistory(Array.isArray(history) ? history : []);
      }
      console.log('✅ Loaded search history:', stored);
    } catch (error) {
      console.error('❌ Error loading search history:', error);
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleHistoryItemPress = (item: string) => {
    onHistoryItemPress(item);
    // Thêm vào history mới khi user click (move to top)
    addToSearchHistory(item);
  };

  const addToSearchHistory = useCallback(
    async (item: string) => {
      try {
        const trimmed = item.trim();
        if (!trimmed) return;

        // Xóa item nếu đã tồn tại (để move to top)
        let updatedHistory = searchHistory.filter(
          h => h.toLowerCase() !== trimmed.toLowerCase(),
        );

        // Thêm item vào đầu list
        updatedHistory = [trimmed, ...updatedHistory];

        // Giữ lại max 10 items
        if (updatedHistory.length > MAX_HISTORY_ITEMS) {
          updatedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
        }

        // Lưu vào AsyncStorage
        await AsyncStorage.setItem(
          SEARCH_HISTORY_KEY,
          JSON.stringify(updatedHistory),
        );

        setSearchHistory(updatedHistory);
        console.log('✅ Added to search history:', trimmed);
      } catch (error) {
        console.error('❌ Error adding to search history:', error);
      }
    },
    [searchHistory],
  );

  const handleDeleteHistoryItem = useCallback(
    async (item: string) => {
      try {
        const updatedHistory = searchHistory.filter(h => h !== item);
        await AsyncStorage.setItem(
          SEARCH_HISTORY_KEY,
          JSON.stringify(updatedHistory),
        );
        setSearchHistory(updatedHistory);
        console.log('✅ Deleted from search history:', item);
      } catch (error) {
        console.error('❌ Error deleting search history item:', error);
      }
    },
    [searchHistory],
  );

  const handleClearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
      console.log('✅ Cleared search history');
    } catch (error) {
      console.error('❌ Error clearing search history:', error);
    }
  }, []);

  const renderHistoryItem = ({item}: {item: string}) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryItemPress(item)}>
      <Image
        source={require('../../../assets/icons/Search.png')}
        style={styles.historyIcon}
      />
      <Text style={styles.historyText}>{item}</Text>
      <TouchableOpacity
        onPress={() => handleDeleteHistoryItem(item)}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Image
          source={require('../../../assets/icons/Cancel.png')}
          style={styles.deleteIcon}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.historySection}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Lịch sử tìm kiếm</Text>
        {searchHistory.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearHistoryText}>Xóa hết</Text>
          </TouchableOpacity>
        )}
      </View>

      {searchHistory.length > 0 ? (
        <FlatList
          data={searchHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => `${item}-${index}`}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyText}>Chưa có lịch sử tìm kiếm</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  historySection: {
    marginTop: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#ee4d2d',
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyIcon: {
    width: 18,
    height: 18,
    marginRight: 12,
    tintColor: '#888',
  },
  historyText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    fontWeight: '400',
  },
  deleteIcon: {
    width: 18,
    height: 18,
    tintColor: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HistorySearch;
