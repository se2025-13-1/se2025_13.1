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
import AsyncStorage from '@react-native-async-storage/async-storage';
import EntrySearchBar from '../components/EntrySearchBar';
import HistorySearch from '../components/HistorySearch';
import SuggestionSearch from '../components/SuggestionSearch';
import {searchApi, SearchSuggestion} from '../services/searchApi';
import type {RootStackParamList} from '../../../../App';

type SearchEntryNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

const SearchEntry: React.FC = () => {
  const navigation = useNavigation<SearchEntryNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
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

      // Gọi API search để lấy suggestions thực từ backend
      const result = await searchApi.searchProducts(keyword, 10);

      // Chỉ hiển thị tên sản phẩm thật từ API, không có data mock
      const suggestionList: string[] = [];

      // Thêm keyword gốc vào đầu
      suggestionList.push(keyword);

      // Chỉ thêm tên các sản phẩm thực tế tìm được từ database
      result.products.forEach(product => {
        if (product.name && !suggestionList.includes(product.name)) {
          suggestionList.push(product.name);
        }
      });

      setSuggestions(suggestionList.slice(0, 10)); // Giới hạn 10 items
      setShowSuggestions(suggestionList.length > 0);
      console.log('✅ Suggestions loaded from API:', suggestionList.length);
      console.log('📋 Suggestions:', suggestionList);
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error);
      setSearchError('Lỗi tìm kiếm, vui lòng thử lại');
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleSubmitSearch = useCallback(async () => {
    if (searchText.trim().length > 0) {
      // Lưu vào history trước khi navigate
      try {
        const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        const history = stored ? JSON.parse(stored) : [];

        // Xóa item nếu đã tồn tại (move to top)
        let updatedHistory = history.filter(
          (h: string) => h.toLowerCase() !== searchText.trim().toLowerCase(),
        );

        // Thêm vào đầu
        updatedHistory = [searchText.trim(), ...updatedHistory];

        // Giữ max 10 items
        if (updatedHistory.length > MAX_HISTORY_ITEMS) {
          updatedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
        }

        await AsyncStorage.setItem(
          SEARCH_HISTORY_KEY,
          JSON.stringify(updatedHistory),
        );
        console.log('✅ Saved to search history:', searchText.trim());
      } catch (error) {
        console.error('❌ Error saving search history:', error);
      }

      // Navigate to full search results screen
      navigation.navigate('SearchResult', {keyword: searchText});
    }
  }, [searchText, navigation]);

  const handleClearSearch = () => {
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchError(null);
  };

  const handleHistoryItemPress = (item: string) => {
    setSearchText(item);
  };

  const handleSuggestionPress = (suggestion: string) => {
    // Set text và navigate to search result
    setSearchText(suggestion);
    navigation.navigate('SearchResult', {keyword: suggestion});
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
