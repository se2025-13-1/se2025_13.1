import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const SearchBar: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  const handleFocus = () => {
    navigation.navigate('SearchEntry' as never);
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/icons/Search.png')}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder="Tìm kiếm sản phẩm..."
        placeholderTextColor="#888"
        value={searchText}
        onFocus={handleFocus}
        onChangeText={text => setSearchText(text)}
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={handleClearSearch}>
          <Image
            source={require('../../../assets/icons/Cancel.png')}
            style={styles.cancelIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 7,
    tintColor: '#888',
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 17,
    fontWeight: '400',
  },
  cancelIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
    tintColor: '#888',
  },
});

export default SearchBar;
