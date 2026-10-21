import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CatalogScreen } from '../screens/catalog/CatalogScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { OrderListScreen } from '../screens/order/OrderListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { SwipeableTabScreen } from '../components/navigation/SwipeableTabScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// HOC helper bọc màn hình với cử chỉ trượt vuốt trái / phải
const withSwipe = (
  Component: React.ComponentType<any>,
  tabName: keyof MainTabParamList
) => {
  return (props: any) => (
    <SwipeableTabScreen currentTab={tabName}>
      <Component {...props} />
    </SwipeableTabScreen>
  );
};

const SwipeableHomeScreen = withSwipe(HomeScreen, 'HomeTab');
const SwipeableCatalogScreen = withSwipe(CatalogScreen, 'CatalogTab');
const SwipeableCartScreen = withSwipe(CartScreen, 'CartTab');
const SwipeableOrderListScreen = withSwipe(OrderListScreen, 'OrdersTab');
const SwipeableProfileScreen = withSwipe(ProfileScreen, 'ProfileTab');

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { totalItems } = useCart();

  // Đảm bảo khoảng đệm an toàn dưới đáy cho phím điều hướng hệ thống (3 nút ảo của Android ~48dp)
  const safeBottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 48 : 16);
  const tabHeight = 56 + safeBottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: tabHeight,
          paddingBottom: safeBottomPadding,
          paddingTop: 8,
          elevation: 12,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={SwipeableHomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CatalogTab"
        component={SwipeableCatalogScreen}
        options={{
          tabBarLabel: 'Sản phẩm',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={SwipeableCartScreen}
        options={{
          tabBarLabel: 'Giỏ hàng',
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            fontSize: 9,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={SwipeableOrderListScreen}
        options={{
          tabBarLabel: 'Đơn hàng',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={SwipeableProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
