import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { authController } from '../controllers/auth-controller';

// Redirect URI chuẩn đã được cấu hình trong Google Cloud Console (Authorized redirect URIs)
const GOOGLE_OAUTH_REDIRECT_URI = 'http://localhost:3000';
const FALLBACK_GOOGLE_CLIENT_ID =
  '971830202071-8hihnd58780edc5aijaj9im0udqp7fbc.apps.googleusercontent.com';

/**
 * Custom Hook xử lý toàn bộ trạng thái và nghiệp vụ màn hình Đăng nhập trên Mobile (useLoginForm).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tập trung toàn bộ useState / useRef tại Hook, giữ cho LoginScreen và GoogleOAuthModal thuần UI.
 * - Hỗ trợ cả đăng nhập bằng Email/Mật khẩu và đăng nhập bằng Google OAuth2 (Authorization Code Flow).
 */
export const useLoginForm = () => {
  const navigation = useNavigation();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State phục vụ luồng đăng nhập bằng Google OAuth2
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isGoogleModalVisible, setIsGoogleModalVisible] = useState<boolean>(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null);
  const isHandlingCodeRef = useRef<boolean>(false);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleQuickLogin = useCallback(() => {
    setEmail('customer@apsports.com');
    setPassword('123456');
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      Alert.alert('Thành công', 'Đăng nhập thành công vào AP Sports!', [
        {
          text: 'Tiếp tục',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        'Đăng nhập thất bại',
        err?.response?.data?.message || err?.message || 'Email hoặc mật khẩu không chính xác.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, login, navigation]);

  /**
   * Mở cửa sổ đăng nhập Google OAuth2.
   * Tự động lấy Client ID từ Backend (hoặc dùng cấu hình dự phòng) và khởi tạo URL OAuth2 chuẩn.
   */
  const handleOpenGoogleLogin = useCallback(async () => {
    try {
      setIsGoogleLoading(true);
      isHandlingCodeRef.current = false;

      let clientId = FALLBACK_GOOGLE_CLIENT_ID;
      try {
        const res = await authController.getGoogleClientId();
        if (res?.data?.clientId) {
          clientId = res.data.clientId;
        }
      } catch {
        // Dùng FALLBACK_GOOGLE_CLIENT_ID nếu mạng chậm
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'select_account',
      });

      setGoogleAuthUrl(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
      setIsGoogleModalVisible(true);
    } finally {
      setIsGoogleLoading(false);
    }
  }, []);

  const handleCloseGoogleModal = useCallback(() => {
    setIsGoogleModalVisible(false);
    setGoogleAuthUrl(null);
  }, []);

  /**
   * Chặn URL chuyển hướng từ Google (http://localhost:3000/?code=...) để trích xuất Authorization Code
   * và gửi xuống Backend đổi lấy cặp khóa AT & RT xoay vòng.
   */
  const handleInterceptGoogleRedirect = useCallback(
    (url: string): boolean => {
      if (!url || !url.startsWith(GOOGLE_OAUTH_REDIRECT_URI)) {
        return false;
      }

      if (isHandlingCodeRef.current) {
        return true;
      }

      try {
        const queryIndex = url.indexOf('?');
        if (queryIndex === -1) {
          return false;
        }

        const searchParams = new URLSearchParams(url.substring(queryIndex + 1));
        const error = searchParams.get('error');
        if (error) {
          isHandlingCodeRef.current = true;
          setIsGoogleModalVisible(false);
          setGoogleAuthUrl(null);
          Alert.alert('Đã hủy', 'Quá trình đăng nhập bằng Google đã bị hủy.');
          return true;
        }

        const code = searchParams.get('code');
        if (!code) {
          return false;
        }

        isHandlingCodeRef.current = true;
        setIsGoogleModalVisible(false);
        setGoogleAuthUrl(null);

        (async () => {
          try {
            setIsGoogleLoading(true);
            await loginWithGoogle({
              code,
              redirectUri: GOOGLE_OAUTH_REDIRECT_URI,
            });
            Alert.alert('Thành công', 'Đăng nhập bằng Google thành công!', [
              {
                text: 'Tiếp tục',
                onPress: () => navigation.goBack(),
              },
            ]);
          } catch (err: any) {
            Alert.alert(
              'Đăng nhập Google thất bại',
              err?.response?.data?.message ||
                err?.message ||
                'Không thể xác thực tài khoản Google. Vui lòng thử lại.'
            );
          } finally {
            setIsGoogleLoading(false);
          }
        })();

        return true;
      } catch {
        return false;
      }
    },
    [loginWithGoogle, navigation]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    isSubmitting,
    isGoogleLoading,
    isGoogleModalVisible,
    googleAuthUrl,
    handleQuickLogin,
    handleLogin,
    handleOpenGoogleLogin,
    handleCloseGoogleModal,
    handleInterceptGoogleRedirect,
  };
};
