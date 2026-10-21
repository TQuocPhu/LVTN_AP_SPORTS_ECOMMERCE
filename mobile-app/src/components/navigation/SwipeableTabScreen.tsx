import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { MainTabParamList } from '../../navigation/types';

const TAB_ORDER: (keyof MainTabParamList)[] = [
  'HomeTab',
  'CatalogTab',
  'CartTab',
  'OrdersTab',
  'ProfileTab',
];

interface SwipeableTabScreenProps {
  currentTab: keyof MainTabParamList;
  children: React.ReactNode;
}

const { width } = Dimensions.get('window');

/**
 * Component bọc màn hình cho phép người dùng lướt vuốt sang trái / phải
 * để chuyển đổi tức thì giữa các Tab.
 *
 * Áp dụng giải pháp cử chỉ 2 tầng:
 * 1. Bắt cử chỉ vuốt từ mép màn hình (Edge Gestures - Trái & Phải): luôn ưu tiên bắt cử chỉ,
 *    hoàn toàn miễn nhiễm với sự kiện cuộn của FlatList/ScrollView con.
 * 2. Raw Touch Event Tracking (onTouchStart & onTouchEnd): bắt cử chỉ vuốt ngang trên toàn bộ bề mặt.
 */
export const SwipeableTabScreen: React.FC<SwipeableTabScreenProps> = ({
  currentTab,
  children,
}) => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const currentIndex = TAB_ORDER.indexOf(currentTab);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  const goToNextTab = useCallback(() => {
    if (currentIndex < TAB_ORDER.length - 1) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      navigation.navigate(TAB_ORDER[currentIndex + 1]);
    }
  }, [currentIndex, navigation]);

  const goToPrevTab = useCallback(() => {
    if (currentIndex > 0) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      navigation.navigate(TAB_ORDER[currentIndex - 1]);
    }
  }, [currentIndex, navigation]);

  // Cử chỉ chạm tổng thể
  const handleTouchStart = (e: any) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: any) => {
    const deltaX = e.nativeEvent.pageX - touchStartX.current;
    const deltaY = e.nativeEvent.pageY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;

    // Vuốt ngang hợp lệ: khoảng cách > 40px, góc ngang vượt trội (> 1.2x góc dọc), thời gian vuốt < 600ms
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && deltaTime < 600) {
      if (deltaX < 0) {
        goToNextTab();
      } else {
        goToPrevTab();
      }
    }
  };

  // Cử chỉ vuốt từ mép trái (Edge Left)
  const edgeLeftStartX = useRef(0);
  const handleEdgeLeftStart = (e: any) => {
    edgeLeftStartX.current = e.nativeEvent.pageX;
  };
  const handleEdgeLeftEnd = (e: any) => {
    const dx = e.nativeEvent.pageX - edgeLeftStartX.current;
    if (dx > 25) {
      goToPrevTab();
    }
  };

  // Cử chỉ vuốt từ mép phải (Edge Right)
  const edgeRightStartX = useRef(0);
  const handleEdgeRightStart = (e: any) => {
    edgeRightStartX.current = e.nativeEvent.pageX;
  };
  const handleEdgeRightEnd = (e: any) => {
    const dx = e.nativeEvent.pageX - edgeRightStartX.current;
    if (dx < -25) {
      goToNextTab();
    }
  };

  return (
    <View
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}

      {/* Dải cảm ứng mép trái màn hình (Vuốt sang phải để về Tab trước) */}
      {currentIndex > 0 && (
        <View
          style={styles.edgeLeftSensor}
          onTouchStart={handleEdgeLeftStart}
          onTouchEnd={handleEdgeLeftEnd}
          onTouchCancel={handleEdgeLeftEnd}
        />
      )}

      {/* Dải cảm ứng mép phải màn hình (Vuốt sang trái để qua Tab sau) */}
      {currentIndex < TAB_ORDER.length - 1 && (
        <View
          style={styles.edgeRightSensor}
          onTouchStart={handleEdgeRightStart}
          onTouchEnd={handleEdgeRightEnd}
          onTouchCancel={handleEdgeRightEnd}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  edgeLeftSensor: {
    position: 'absolute',
    top: 70,
    bottom: 80,
    left: 0,
    width: 28,
    zIndex: 999,
  },
  edgeRightSensor: {
    position: 'absolute',
    top: 70,
    bottom: 80,
    right: 0,
    width: 28,
    zIndex: 999,
  },
});
