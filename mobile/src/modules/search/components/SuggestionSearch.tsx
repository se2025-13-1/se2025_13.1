import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface SuggestionSearchProps {
  suggestions: string[]; // Chỉ cần array string cho suggestions
  loading: boolean;
  error?: string | null;
  onSuggestionPress?: (suggestion: string) => void;
}

const MAX_SUGGESTIONS = 10;

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
    return null; // Không hiển thị gì nếu không có suggestions
  }

  // Giới hạn chỉ hiển thị tối đa 10 suggestions
  const limitedSuggestions = suggestions.slice(0, MAX_SUGGESTIONS);

  const renderSuggestionItem = ({item}: {item: string}) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSuggestionPress?.(item)}>
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={limitedSuggestions}
        renderItem={renderSuggestionItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
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
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '400',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 16,
  },
});

export default SuggestionSearch;
