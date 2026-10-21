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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Spacing, Typography } from '../../config/theme';
import { useCustomerOrders, STATUS_TABS } from '../../hooks/useCustomerOrders';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { OrderListTabs } from '../../components/order/OrderListTabs';
import { OrderCard } from '../../components/order/OrderCard';
import { RequireLoginView } from '../../components/common/RequireLoginView';

export const OrderListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();

  const {
    activeTab,
    setActiveTab,
    filteredOrders,
    loading,
    refreshing,
    onRefresh,
    getStatusBadge,
  } = useCustomerOrders();

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Đơn Hàng Của Tôi</Text>
        </View>
        <RequireLoginView
          icon="receipt-outline"
          title="Đơn Hàng Của Bạn"
          description="Vui lòng đăng nhập tài khoản để theo dõi lộ trình giao nhận, kiểm tra mã vận đơn GHN và xem toàn bộ lịch sử đơn hàng của bạn."
          subtitle="Đăng nhập để nhận thông báo trạng thái đơn hàng tức thì!"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Đơn Hàng Của Tôi</Text>
      </View>

      {/* Status Filter Tabs */}
      <OrderListTabs
        tabs={STATUS_TABS}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Orders List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Đang tải danh sách đơn hàng...
          </Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="receipt-outline" size={54} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Không có đơn hàng nào</Text>
          <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
            Các đơn hàng bạn đã đặt sẽ hiển thị theo trạng thái tương ứng tại đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
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
            <OrderCard
              order={item}
              badge={getStatusBadge(item.status)}
              onPress={() =>
                navigation.navigate('OrderDetail', {
                  orderCode: item.orderCode,
                  orderId: item.id,
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
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
    gap: Spacing.md,
  },
});
