import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';

interface HistorySearchProps {
  onHistoryItemPress: (item: string) => void;
}

const HistorySearch: React.FC<HistorySearchProps> = ({onHistoryItemPress}) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'Áo thun nam',
    'Quần jeans nữ',
    'Váy đầm',
    'Giày thể thao',
  ]);

  const handleHistoryItemPress = (item: string) => {
    onHistoryItemPress(item);
  };

  const handleDeleteHistoryItem = (item: string) => {
    setSearchHistory(searchHistory.filter(h => h !== item));
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

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
