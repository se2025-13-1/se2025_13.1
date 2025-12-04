import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';

interface EntrySearchBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  onSubmitSearch: () => void;
  onClearSearch: () => void;
  onBackPress: () => void;
}

const EntrySearchBar: React.FC<EntrySearchBarProps> = ({
  searchText,
  onSearchChange,
  onSubmitSearch,
  onClearSearch,
  onBackPress,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBackPress}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Image
          source={require('../../../assets/icons/Back.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm sản phẩm..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={onSearchChange}
          onSubmitEditing={onSubmitSearch}
          autoFocus={true}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={onClearSearch}>
            <Image
              source={require('../../../assets/icons/Cancel.png')}
              style={styles.cancelIcon}
            />
          </TouchableOpacity>
        )}

        {!searchText && (
          <TouchableOpacity hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Image
              source={require('../../../assets/icons/Camera.png')}
              style={styles.cameraIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={onSubmitSearch}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Image
          source={require('../../../assets/icons/Search.png')}
          style={styles.searchButtonIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#ee4d2d',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#999',
  },
  searchInput: {
    flex: 1,
    color: '#333',
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 0,
  },
  cancelIcon: {
    width: 20,
    height: 20,
    marginLeft: 6,

    tintColor: '#999',
  },
  cameraIcon: {
    width: 20,
    height: 20,
    tintColor: '#999',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: '#ee4d2d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
});

export default EntrySearchBar;
