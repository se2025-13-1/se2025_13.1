import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import EntrySearchBar from '../components/EntrySearchBar';
import HistorySearch from '../components/HistorySearch';
import SuggestionSearch from '../components/SuggestionSearch';
import {searchApi, SearchSuggestion} from '../services/searchApi';
import type {RootStackParamList} from '../../../../App';

type SearchEntryNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchEntry: React.FC = () => {
  const navigation = useNavigation<SearchEntryNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search - gọi API sau khi user dừng gõ 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim().length > 0) {
        fetchSuggestions(searchText);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setSearchError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchSuggestions = useCallback(async (keyword: string) => {
    try {
      setLoadingSuggestions(true);
      setSearchError(null);
      const result = await searchApi.searchProducts(keyword, 5); // Lấy 5 gợi ý
      setSuggestions(result.products);
      setShowSuggestions(true);
      console.log('✅ Suggestions loaded:', result.products.length);
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error);
      setSearchError('Lỗi tìm kiếm, vui lòng thử lại');
      setShowSuggestions(true);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleSubmitSearch = () => {
    if (searchText.trim().length > 0) {
      // Navigate to full search results screen
      navigation.navigate('SearchResult', {keyword: searchText});
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchError(null);
  };

  const handleHistoryItemPress = (item: string) => {
    setSearchText(item);
  };

  const handleSuggestionPress = (product: SearchSuggestion) => {
    // Navigate to product detail
    navigation.navigate('ProductDetail', {productId: product.id});
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header with back button and search bar */}
      <EntrySearchBar
        searchText={searchText}
        onSearchChange={handleSearch}
        onSubmitSearch={handleSubmitSearch}
        onClearSearch={handleClearSearch}
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showSuggestions ? (
          <SuggestionSearch
            suggestions={suggestions}
            loading={loadingSuggestions}
            error={searchError}
            onSuggestionPress={handleSuggestionPress}
          />
        ) : (
          <HistorySearch onHistoryItemPress={handleHistoryItemPress} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default SearchEntry;
