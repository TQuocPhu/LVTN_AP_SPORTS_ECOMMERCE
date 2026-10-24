import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../config/theme';

interface GoogleOAuthModalProps {
  visible: boolean;
  authUrl: string | null;
  onClose: () => void;
  onInterceptRedirect: (url: string) => boolean;
}

/**
 * Pure UI Component hiển thị cửa sổ xác thực Google OAuth2 trên ứng dụng di động.
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tuyệt đối không sử dụng useState hay useEffect trong Component.
 * - Mọi trạng thái đóng/mở và xử lý攔 (intercept) Authorization Code đều nằm tại `useLoginForm`.
 * - Sử dụng User-Agent trình duyệt Chrome di động chuẩn (loại bỏ hậu tố "; wv") để tương thích Google OAuth2.
 */
export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  visible,
  authUrl,
  onClose,
  onInterceptRedirect,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Thanh tiêu đề Modal */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.headerTitle}>Đăng nhập bằng Google</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.slate700} />
          </TouchableOpacity>
        </View>

        {/* Nội dung WebView OAuth2 */}
        {authUrl ? (
          <WebView
            source={{ uri: authUrl }}
            userAgent="Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
            incognito={false}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Đang kết nối tới Google...</Text>
              </View>
            )}
            onShouldStartLoadWithRequest={(request) => {
              // Nếu URL bắt đầu chuyển hướng về redirect_uri chứa ?code=..., chặn tải trang và xử lý mã
              const intercepted = onInterceptRedirect(request.url);
              return !intercepted;
            }}
            onNavigationStateChange={(navState: WebViewNavigation) => {
              if (navState?.url) {
                onInterceptRedirect(navState.url);
              }
            }}
          />
        ) : (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate200,
    backgroundColor: Colors.white,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
  },
});
