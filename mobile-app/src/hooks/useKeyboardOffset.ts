import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, ScrollView } from 'react-native';

/**
 * Hook quản lý chiều cao bàn phím và tự cuộn ScrollView khi focus ô nhập liệu.
 */
export const useKeyboardOffset = () => {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subShow = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
    });
    const subHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const scrollToEndOnFocus = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  return {
    scrollRef,
    keyboardHeight,
    scrollToEndOnFocus,
  };
};
