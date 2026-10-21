import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Spacing, Typography } from '../../config/theme';
import { useCatalog } from '../../hooks/useCatalog';
import { useTheme } from '../../context/ThemeContext';
import { CatalogSearchBar } from '../../components/catalog/CatalogSearchBar';
import { CatalogCategoryPills } from '../../components/catalog/CatalogCategoryPills';
import { ProductCard } from '../../components/product/ProductCard';

export const CatalogScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'CatalogTab'>>();
  const { colors } = useTheme();

  const {
    categories,
    products,
    selectedCategory,
    keyword,
    loading,
    refreshing,
    onRefresh,
    handleSelectCategory,
    handleSearchChange,
    handleClearSearch,
  } = useCatalog(route.params?.categorySlug, route.params?.keyword);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <CatalogSearchBar
          keyword={keyword}
          onChangeText={handleSearchChange}
          onClear={handleClearSearch}
        />
      </View>

      {/* Category Horizontal Pills */}
      <CatalogCategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Product Grid */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Đang tải danh mục thiết bị thể thao...
          </Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Không tìm thấy sản phẩm phù hợp</Text>
          <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
            Thử tìm kiếm với từ khóa khác hoặc chuyển danh mục
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  slug: item.slug,
                  initialProduct: item,
                })
              }
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xs,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  emptySubText: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  columnWrapper: {
    gap: Spacing.md,
  },
});
