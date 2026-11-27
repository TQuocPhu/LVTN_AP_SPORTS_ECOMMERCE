import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert as RNAlert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Spacing, Typography } from '../config/theme';
import { useTheme } from './ThemeContext';

export type AppAlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AppAlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AppAlertOptions {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
  type?: AppAlertType;
}

interface AlertContextType {
  showAlert: (
    title: string,
    message?: string,
    buttons?: AppAlertButton[],
    type?: AppAlertType
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType>({} as AlertContextType);

let globalShowAlert: AlertContextType['showAlert'] | null = null;

/**
 * Hàm gọi thông báo dạng Modal đẹp trên toàn app (tương thích chữ ký Alert.alert).
 */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  type?: AppAlertType
) {
  if (globalShowAlert) {
    globalShowAlert(title, message, buttons, type);
  } else {
    RNAlert.alert(title, message, buttons);
  }
}

function inferAlertType(title: string, buttons?: AppAlertButton[], explicit?: AppAlertType): AppAlertType {
  if (explicit) return explicit;
  const lower = title.toLowerCase();
  if (
    lower.includes('thành công') ||
    lower.includes('hoàn tất') ||
    lower.includes('đã lưu') ||
    lower.includes('đã bật')
  ) {
    return 'success';
  }
  if (
    lower.includes('lỗi') ||
    lower.includes('thất bại') ||
    lower.includes('không thể') ||
    lower.includes('không hợp lệ')
  ) {
    return 'error';
  }
  if (
    lower.includes('thiếu') ||
    lower.includes('giới hạn') ||
    lower.includes('quá ngắn') ||
    lower.includes('yêu cầu') ||
    lower.includes('cần quyền')
  ) {
    return 'warning';
  }
  if (buttons && buttons.length > 1) {
    return 'confirm';
  }
  return 'info';
}

const ALERT_VISUALS: Record<
  AppAlertType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  success: { icon: 'checkmark-circle', color: '#16a34a', bg: '#dcfce7' },
  error: { icon: 'close-circle', color: '#dc2626', bg: '#fee2e2' },
  warning: { icon: 'warning', color: '#d97706', bg: '#fef3c7' },
  confirm: { icon: 'help-circle', color: '#0284c7', bg: '#e0f2fe' },
  info: { icon: 'information-circle', color: '#2563eb', bg: '#dbeafe' },
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors, isDarkMode } = useTheme();
  const [alertState, setAlertState] = useState<AppAlertOptions | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const hideAlert = useCallback(() => {
    setAlertState(null);
  }, []);

  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      buttons?: AppAlertButton[],
      type?: AppAlertType
    ) => {
      setAlertState({
        title,
        message,
        buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'Đóng', style: 'default' }],
        type: inferAlertType(title, buttons, type),
      });
    },
    []
  );

  useEffect(() => {
    globalShowAlert = showAlert;
    return () => {
      if (globalShowAlert === showAlert) {
        globalShowAlert = null;
      }
    };
  }, [showAlert]);

  useEffect(() => {
    if (alertState) {
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [alertState, scaleAnim, opacityAnim]);

  const visual = alertState ? ALERT_VISUALS[alertState.type || 'info'] : ALERT_VISUALS.info;
  const buttons = alertState?.buttons || [];

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={!!alertState}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={hideAlert}
      >
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.iconRing,
                { backgroundColor: isDarkMode ? `${visual.color}25` : visual.bg },
              ]}
            >
              <Ionicons name={visual.icon} size={32} color={visual.color} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {alertState?.title}
            </Text>

            {!!alertState?.message && (
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {alertState.message}
              </Text>
            )}

            <View
              style={[
                styles.btnRow,
                buttons.length > 2 ? styles.btnCol : undefined,
              ]}
            >
              {buttons.map((btn, idx) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                const btnBg = isCancel
                  ? colors.surface2
                  : isDestructive
                    ? '#dc2626'
                    : colors.primary;
                const btnTextColor = isCancel ? colors.textSecondary : '#ffffff';

                return (
                  <TouchableOpacity
                    key={`${btn.text}-${idx}`}
                    activeOpacity={0.85}
                    style={[
                      styles.btn,
                      buttons.length <= 2 ? { flex: 1 } : undefined,
                      {
                        backgroundColor: btnBg,
                        borderColor: isCancel ? colors.border : btnBg,
                        borderWidth: isCancel ? 1 : 0,
                      },
                    ]}
                    onPress={() => {
                      hideAlert();
                      btn.onPress?.();
                    }}
                  >
                    <Text style={[styles.btnText, { color: btnTextColor }]}>
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  iconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginTop: Spacing.xs,
  },
  btnCol: {
    flexDirection: 'column',
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
