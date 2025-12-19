import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {SearchSuggestion} from '../services/searchApi';

interface SuggestionSearchProps {
  suggestions: SearchSuggestion[];
  loading: boolean;
  error?: string | null;
  onSuggestionPress?: (product: SearchSuggestion) => void;
}

const SuggestionSearch: React.FC<SuggestionSearchProps> = ({
  suggestions,
  loading,
  error,
  onSuggestionPress,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#ee4d2d" />
        <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
      </View>
    );
  }

  const renderSuggestionItem = ({item}: {item: SearchSuggestion}) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSuggestionPress?.(item)}>
      {item.thumbnail ? (
        <Image
          source={{uri: item.thumbnail}}
          style={styles.suggestionThumbnail}
        />
      ) : (
        <View style={[styles.suggestionThumbnail, styles.placeholderImage]} />
      )}

      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.suggestionMeta}>
          <Text style={styles.suggestionPrice}>
            {item.base_price?.toLocaleString?.() || item.base_price} đ
          </Text>
          {item.sold_count !== undefined && (
            <Text style={styles.soldCount}>Đã bán: {item.sold_count}</Text>
          )}
        </View>
        {item.category_name && (
          <Text style={styles.categoryName}>{item.category_name}</Text>
        )}
      </View>

      <Image
        source={require('../../../assets/icons/Back.png')}
        style={styles.arrowIcon}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gợi ý sản phẩm</Text>
      <FlatList
        data={suggestions}
        renderItem={renderSuggestionItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ee4d2d',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  suggestionThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 4,
  },
  suggestionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ee4d2d',
  },
  soldCount: {
    fontSize: 12,
    color: '#999999',
  },
  categoryName: {
    fontSize: 12,
    color: '#666666',
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#cccccc',
    marginLeft: 8,
    transform: [{rotate: '180deg'}],
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});

export default SuggestionSearch;
