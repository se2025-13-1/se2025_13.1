import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import {AppConfig} from '../../../config/AppConfig';

interface FilterPanelProps {
  visible: boolean;
  onFilterChange: (filters: FilterState) => void;
  onClose: () => void;
}

export interface FilterState {
  category_id?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  sort_by?: string;
  sort_order?: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface FilterMenu {
  key: string;
  label: string;
}

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.75; // Max 75% màn hình
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.25; // Sidebar 1/4 màn hình (25%)

const PRICE_RANGES = [
  {label: 'Dưới 100k', min: 0, max: 100000},
  {label: '100k - 500k', min: 100000, max: 500000},
  {label: '500k - 1M', min: 500000, max: 1000000},
  {label: 'Trên 1M', min: 1000000, max: undefined},
];

const RATING_OPTIONS = [
  {label: '4+ sao', value: 4},
  {label: '3+ sao', value: 3},
  {label: '2+ sao', value: 2},
];

const SORT_OPTIONS = [
  {label: 'Mới nhất', value: null, order: null},
  {label: 'Giá: Thấp → Cao', value: 'price', order: 'asc'},
  {label: 'Giá: Cao → Thấp', value: 'price', order: 'desc'},
  {label: 'Bán chạy nhất', value: 'sold', order: 'desc'},
  {label: 'Đánh giá cao', value: 'rating', order: 'desc'},
];

const FILTER_MENUS: FilterMenu[] = [
  {key: 'category', label: 'Danh mục'},
  {key: 'price', label: 'Khoảng giá'},
  {key: 'rating', label: 'Đánh giá'},
  {key: 'sort', label: 'Sắp xếp'},
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  visible,
  onFilterChange,
  onClose,
}) => {
  const [filters, setFilters] = useState<FilterState>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState<string>('category');

  // Category state
  const [selectedCategory, setSelectedCategory] = useState<string>();

  // Price state
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    (typeof PRICE_RANGES)[0] | null
  >(null);
  const [customMinPrice, setCustomMinPrice] = useState<string>('');
  const [customMaxPrice, setCustomMaxPrice] = useState<string>('');
  const [useCustomPrice, setUseCustomPrice] = useState(false);

  // Rating state
  const [selectedRating, setSelectedRating] = useState<number>();

  // Sort state
  const [selectedSort, setSelectedSort] = useState<string>('');

  // Refs for scroll
  const contentScrollRef = useRef<ScrollView>(null);
  const sectionRefs = {
    category: useRef<View>(null),
    price: useRef<View>(null),
    rating: useRef<View>(null),
    sort: useRef<View>(null),
  };

  // Animation cho dropdown
  const slideAnim = useState(new Animated.Value(0))[0];

  // Animate dropdown khi visible thay đổi
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch(
        `${AppConfig.BASE_URL}/api/categories/flat`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to load categories');
      }

      const data = await response.json();
      const categoryList = data.categories || data.data || [];
      setCategories(categoryList);
      console.log('✅ Categories loaded:', categoryList.length);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Handle category selection
  const handleSelectCategory = (categoryId: string) => {
    const newCategoryId =
      selectedCategory === categoryId ? undefined : categoryId;
    setSelectedCategory(newCategoryId);
    setFilters(prev => ({
      ...prev,
      category_id: newCategoryId,
    }));
  };

  // Handle price range selection
  const handleSelectPrice = (priceRange: (typeof PRICE_RANGES)[0]) => {
    const isSelected =
      selectedPriceRange?.min === priceRange.min &&
      selectedPriceRange?.max === priceRange.max;
    const newPriceRange = isSelected ? null : priceRange;
    setSelectedPriceRange(newPriceRange);
    setUseCustomPrice(false);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setFilters(prev => ({
      ...prev,
      min_price: newPriceRange?.min,
      max_price: newPriceRange?.max,
    }));
  };

  // Handle custom price input
  const handleCustomPriceChange = () => {
    const minPrice = customMinPrice ? parseInt(customMinPrice) : undefined;
    const maxPrice = customMaxPrice ? parseInt(customMaxPrice) : undefined;

    setSelectedPriceRange(null);
    setFilters(prev => ({
      ...prev,
      min_price: minPrice,
      max_price: maxPrice,
    }));
  };

  const handleUseCustomPrice = () => {
    setUseCustomPrice(!useCustomPrice);
    if (!useCustomPrice) {
      setSelectedPriceRange(null);
      setCustomMinPrice('');
      setCustomMaxPrice('');
    }
  };

  // Handle rating selection
  const handleSelectRating = (rating: number) => {
    const newRating = selectedRating === rating ? undefined : rating;
    setSelectedRating(newRating);
    setFilters(prev => ({
      ...prev,
      min_rating: newRating,
    }));
  };

  // Handle sort selection
  const handleSelectSort = (sortValue: string | null, order: string | null) => {
    const isSelected =
      selectedSort === sortValue && filters.sort_order === order;
    const newSort = isSelected ? null : sortValue;
    setSelectedSort(newSort || '');
    setFilters(prev => ({
      ...prev,
      sort_by: newSort || undefined,
      sort_order: newSort ? order : undefined,
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    onFilterChange(filters);
    onClose();
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory(undefined);
    setSelectedPriceRange(null);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setUseCustomPrice(false);
    setSelectedRating(undefined);
    setSelectedSort('');
    const emptyFilters: FilterState = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    onClose();
  };

  // Handle sidebar click
  const handleSidebarPress = (sectionKey: string) => {
    setActiveFilterMenu(sectionKey);
  };

  // Render content based on active menu
  const renderFilterContent = () => {
    switch (activeFilterMenu) {
      case 'category':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Danh mục</Text>
            {loadingCategories ? (
              <Text style={styles.loadingText}>Đang tải...</Text>
            ) : categories.length > 0 ? (
              <View style={styles.contentGrid}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.contentItemGrid,
                      selectedCategory === category.id &&
                        styles.contentItemSelected,
                    ]}
                    onPress={() => handleSelectCategory(category.id)}>
                    <Text
                      style={[
                        styles.contentItemText,
                        selectedCategory === category.id &&
                          styles.contentItemTextSelected,
                      ]}
                      numberOfLines={2}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Không có danh mục</Text>
            )}
          </View>
        );

      case 'price':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Khoảng giá</Text>
            <View style={styles.contentGrid}>
              {PRICE_RANGES.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.contentItemGrid,
                    selectedPriceRange?.min === range.min &&
                      selectedPriceRange?.max === range.max &&
                      styles.contentItemSelected,
                  ]}
                  onPress={() => handleSelectPrice(range)}>
                  <Text
                    style={[
                      styles.contentItemText,
                      selectedPriceRange?.min === range.min &&
                        selectedPriceRange?.max === range.max &&
                        styles.contentItemTextSelected,
                    ]}
                    numberOfLines={2}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.contentItemGrid,
                  useCustomPrice && styles.contentItemSelected,
                ]}
                onPress={handleUseCustomPrice}>
                <Text
                  style={[
                    styles.contentItemText,
                    useCustomPrice && styles.contentItemTextSelected,
                  ]}
                  numberOfLines={2}>
                  Tùy chỉnh
                </Text>
              </TouchableOpacity>
            </View>

            {useCustomPrice && (
              <View style={styles.customPriceContainer}>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceLabel}>Từ (₫)</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Tối thiểu"
                    keyboardType="numeric"
                    value={customMinPrice}
                    onChangeText={text => {
                      setCustomMinPrice(text);
                      if (text) handleCustomPriceChange();
                    }}
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceLabel}>Đến (₫)</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Tối đa"
                    keyboardType="numeric"
                    value={customMaxPrice}
                    onChangeText={text => {
                      setCustomMaxPrice(text);
                      if (text) handleCustomPriceChange();
                    }}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            )}
          </View>
        );

      case 'rating':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Đánh giá</Text>
            <View style={styles.contentGrid}>
              {RATING_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.contentItemGrid,
                    selectedRating === option.value &&
                      styles.contentItemSelected,
                  ]}
                  onPress={() => handleSelectRating(option.value)}>
                  <Text
                    style={[
                      styles.contentItemText,
                      selectedRating === option.value &&
                        styles.contentItemTextSelected,
                    ]}
                    numberOfLines={2}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'sort':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Sắp xếp</Text>
            <View style={styles.contentGrid}>
              {SORT_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.contentItemGrid,
                    selectedSort === (option.value || '') &&
                      (option.value === null ||
                        filters.sort_order === option.order) &&
                      styles.contentItemSelected,
                  ]}
                  onPress={() => handleSelectSort(option.value, option.order)}>
                  <Text
                    style={[
                      styles.contentItemText,
                      selectedSort === (option.value || '') &&
                        (option.value === null ||
                          filters.sort_order === option.order) &&
                        styles.contentItemTextSelected,
                    ]}
                    numberOfLines={2}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay để đóng dropdown khi tap bên ngoài */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Filter Panel - 2 Column Layout */}
      <Animated.View
        style={[
          styles.dropdownContainer,
          {
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bộ lọc</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content - 2 Columns */}
        <View style={styles.mainContent}>
          {/* Left Sidebar - Filter Menu */}
          <ScrollView
            style={styles.sidebar}
            showsVerticalScrollIndicator={false}>
            {FILTER_MENUS.map(menu => (
              <TouchableOpacity
                key={menu.key}
                style={[
                  styles.sidebarItem,
                  activeFilterMenu === menu.key && styles.sidebarItemActive,
                ]}
                onPress={() => handleSidebarPress(menu.key)}>
                <Text
                  style={[
                    styles.sidebarItemText,
                    activeFilterMenu === menu.key &&
                      styles.sidebarItemTextActive,
                  ]}>
                  {menu.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Right Content Area - Single section at a time */}
          <ScrollView
            ref={contentScrollRef}
            style={styles.contentArea}
            showsVerticalScrollIndicator={false}>
            {renderFilterContent()}
          </ScrollView>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetFilters}>
            <Text style={styles.resetButtonText}>Đặt lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}>
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: MAX_HEIGHT,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999999',
    fontWeight: '300',
  },
  mainContent: {
    flexDirection: 'row',
    flex: 1,
    minHeight: 300,
  },
  sidebar: {
    width: SCREEN_WIDTH * 0.22, // 20–22% đẹp hơn
    maxWidth: 100,
    // width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  sidebarItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  sidebarItemActive: {
    backgroundColor: '#FFF4F2',
    borderLeftColor: '#ee4d2d',
  },
  sidebarItemText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
  },
  sidebarItemTextActive: {
    color: '#ee4d2d',
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  contentSection: {
    minHeight: 280,
  },
  contentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  contentItemGrid: {
    minWidth: '45%',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    flexGrow: 1,
    maxWidth: '100%',
  },
  contentItem: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 6,
    backgroundColor: '#F8F9FA',
  },
  contentItemSelected: {
    backgroundColor: '#FFF4F2',
  },
  contentItemText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '400',
  },
  contentItemTextSelected: {
    color: '#ee4d2d',
    fontWeight: '500',
  },
  customPriceContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  priceInputWrapper: {
    gap: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: '#333333',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#ee4d2d',
    borderRadius: 6,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterPanel;
