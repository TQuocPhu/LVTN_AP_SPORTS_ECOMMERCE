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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Spacing, Typography } from '../../config/theme';
import { useHome } from '../../hooks/useHome';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { HomeHeader } from '../../components/home/HomeHeader';
import { HomePromoBanner } from '../../components/home/HomePromoBanner';
import { HomeCategoryRow } from '../../components/home/HomeCategoryRow';
import { ProductCard } from '../../components/product/ProductCard';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { totalItems } = useCart();
  const { colors } = useTheme();
  const { categories, featuredProducts, loading, refreshing, onRefresh } = useHome();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header Presentational */}
      <HomeHeader
        cartItemCount={totalItems}
        onCartPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
        onChatPress={() => navigation.navigate('SupportChat')}
      />

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Đang nạp thiết bị thể thao đỉnh cao...
          </Text>
        </View>
      ) : (
        <FlatList
          data={featuredProducts}
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
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <HomePromoBanner
                onExplorePress={() =>
                  navigation.navigate('MainTabs', { screen: 'CatalogTab' })
                }
              />
              <HomeCategoryRow
                categories={categories}
                onSelectCategory={(cat) =>
                  navigation.navigate('MainTabs', {
                    screen: 'CatalogTab',
                    params: { categorySlug: cat.slug },
                  })
                }
              />
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                  SẢN PHẨM NỔI BẬT
                </Text>
              </View>
            </View>
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
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  columnWrapper: {
    gap: Spacing.md,
  },
  headerContainer: {
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  sectionTitleRow: {
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.black,
    letterSpacing: 0.8,
  },
});
