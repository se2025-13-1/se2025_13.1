import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import {AppConfig} from '../../../config/AppConfig';

// Calculate item width to show max 5 categories per screen
const screenWidth = Dimensions.get('window').width;
const ITEM_WIDTH = (screenWidth - 32 - 32) / 5; // (screen - horizontal padding - gaps) / 5
const ITEM_MARGIN = 8; // margin between items

interface Category {
  id: string;
  name: string;
  color?: string;
  renderIcon?: () => React.ReactNode;
  image_url?: string;
  parent_id?: string | null;
}

interface BackendCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Styles for icon shapes
const iconStyles = StyleSheet.create({
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

// Color palette for categories
const CATEGORY_COLORS = [
  '#FF6B6B',
  '#FF69B4',
  '#FFD93D',
  '#6BCB77',
  '#4D96FF',
  '#9D4EDD',
  '#FF9500',
  '#FF6B9D',
  '#C44569',
  '#A8D8EA',
];

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const BASE_URL = AppConfig.BASE_URL;

      // Fetch categories from BE - call /categories/flat endpoint to get flat list
      // Then filter for root categories (no parent_id)
      const response = await fetch(`${BASE_URL}/api/categories/flat`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Categories API response:', data);

      // Backend returns {categories: [...]} structure
      let allCategories: BackendCategory[] = [];

      if (data.categories && Array.isArray(data.categories)) {
        allCategories = data.categories;
      } else if (Array.isArray(data)) {
        allCategories = data;
      }

      // Filter only root categories (parent_id is null or undefined)
      const rootCategories: Category[] = allCategories
        .filter((cat: BackendCategory) => !cat.parent_id)
        .map((cat: BackendCategory, index: number) => ({
          id: cat.id,
          name: cat.name,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
          image_url: cat.image_url,
        }));

      console.log('Filtered root categories:', rootCategories);
      setCategories(rootCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    console.log('Category pressed:', categoryName);
    // TODO: Navigate to category products page
  };

  const handleSeeMore = () => {
    console.log('See more categories');
    // TODO: Navigate to all categories page
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Danh mục</Text>
          <TouchableOpacity onPress={() => fetchCategories()}>
            <Text style={styles.seeMore}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header: Danh mục + Xem thêm */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục</Text>
        <TouchableOpacity onPress={handleSeeMore}>
          <Text style={styles.seeMore}>Xem thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        // Horizontal ScrollView for Categories
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {categories.length > 0 ? (
            categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category.name)}
                activeOpacity={0.7}>
                {/* Category Icon/Image */}
                <View
                  style={[
                    styles.iconContainer,
                    {backgroundColor: category.color || '#FF6B6B'},
                  ]}>
                  {category.image_url ? (
                    <Image
                      source={{uri: category.image_url}}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.categoryImageText}>
                      {category.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                {/* Category Name */}
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có danh mục</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  seeMore: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  scrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  emptyContainer: {
    width: screenWidth - 32,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: ITEM_MARGIN,
    marginBottom: 8,
    width: ITEM_WIDTH,
  },
  iconContainer: {
    width: 53,
    height: 53,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
  categoryImage: {
    width: 55,
    height: 55,
    borderRadius: 30,
  },
  categoryImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    maxWidth: ITEM_WIDTH - 4,
  },
});

export default Categories;
