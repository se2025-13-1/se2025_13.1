import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import EntrySearchBar from '../components/EntrySearchBar';
import HistorySearch from '../components/HistorySearch';

const SearchEntry: React.FC = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleSubmitSearch = () => {
    if (searchText.trim().length > 0) {
      // TODO: Navigate to search results screen
      console.log('Search for:', searchText);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  const handleHistoryItemPress = (item: string) => {
    setSearchText(item);
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
        <HistorySearch onHistoryItemPress={handleHistoryItemPress} />
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
