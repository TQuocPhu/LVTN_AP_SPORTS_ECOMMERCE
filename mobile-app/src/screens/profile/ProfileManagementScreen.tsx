import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { NewAddressModal } from '../../components/checkout/NewAddressModal';
import { BorderRadius, Spacing, Typography } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';
import { ProfileTab, useProfileManagement } from '../../hooks/useProfileManagement';

export const ProfileManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  const {
    activeTab,
    setActiveTab,
    loading,
    profile,
    isGoogleAccount,
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    address,
    setAddress,
    savingProfile,
    uploadingAvatar,
    handleSaveProfile,
    handlePickAvatar,
    addresses,
    loadingAddresses,
    isAddressModalVisible,
    setIsAddressModalVisible,
    newFullName,
    setNewFullName,
    newPhone,
    setNewPhone,
    newAddressText,
    setNewAddressText,
    isAddingAddress,
    provinces,
    districts,
    wards,
    selectedProvinceId,
    selectedDistrictId,
    selectedWardCode,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    handleSelectProvince,
    handleSelectDistrict,
    setSelectedWardCode,
    handleSetDefaultAddress,
    handleDeleteAddress,
    handleCreateAddress,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    changingPassword,
    handleChangePassword,
    scrollRef,
    keyboardHeight,
    scrollToEndOnFocus,
  } = useProfileManagement();

  const tabs: { key: ProfileTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'info', label: 'Hồ sơ', icon: 'person-outline' },
    { key: 'addresses', label: 'Địa chỉ', icon: 'location-outline' },
    { key: 'password', label: 'Mật khẩu', icon: 'lock-closed-outline' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <Header title="Quản Lý Tài Khoản" showBack onBack={() => navigation.goBack()} />

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tabBtn,
                active && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab(t.key)}
            >
              <Ionicons
                name={t.icon}
                size={16}
                color={active ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: active ? colors.primary : colors.textMuted },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Đang tải thông tin cá nhân...
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingBottom: keyboardHeight }}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === 'info' && (
              <>
                {/* Avatar Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                      {profile?.avatar ? (
                        <Image source={{ uri: profile.avatar }} style={styles.avatarImg} />
                      ) : (
                        <View
                          style={[
                            styles.avatarPlaceholder,
                            { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
                          ]}
                        >
                          <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                            {(name || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      {!isGoogleAccount && (
                        <TouchableOpacity
                          style={[styles.cameraBtn, { backgroundColor: colors.primary }]}
                          onPress={handlePickAvatar}
                          disabled={uploadingAvatar}
                        >
                          {uploadingAvatar ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <Ionicons name="camera" size={16} color="#ffffff" />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={[styles.profileName, { color: colors.text }]}>{profile?.name}</Text>
                    <Text style={[styles.profileEmail, { color: colors.textMuted }]}>
                      {profile?.email}
                    </Text>
                    {isGoogleAccount && (
                      <View
                        style={[
                          styles.googleNotice,
                          {
                            backgroundColor: isDarkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff',
                            borderColor: isDarkMode ? 'rgba(59,130,246,0.4)' : '#bfdbfe',
                          },
                        ]}
                      >
                        <Ionicons name="logo-google" size={14} color="#2563eb" />
                        <Text style={[styles.googleNoticeText, { color: isDarkMode ? '#93c5fd' : '#1d4ed8' }]}>
                          Tài khoản liên kết Google (Khóa đổi tên, ảnh & mật khẩu)
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Form Info */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Thông Tin Cá Nhân
                  </Text>

                  <Text style={[styles.label, { color: colors.textSecondary }]}>Email đăng nhập</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface2,
                        borderColor: colors.border,
                        color: colors.textMuted,
                      },
                    ]}
                    value={profile?.email || ''}
                    editable={false}
                  />

                  <Text style={[styles.label, { color: colors.textSecondary }]}>Họ và tên</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface2,
                        borderColor: colors.border,
                        color: isGoogleAccount ? colors.textMuted : colors.text,
                      },
                    ]}
                    value={name}
                    onChangeText={setName}
                    editable={!isGoogleAccount}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor={colors.textFaint}
                  />

                  <Text style={[styles.label, { color: colors.textSecondary }]}>Số điện thoại</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface2,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholder="0912345678"
                    placeholderTextColor={colors.textFaint}
                    onFocus={scrollToEndOnFocus}
                  />

                  <Text style={[styles.label, { color: colors.textSecondary }]}>Địa chỉ liên hệ</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.multilineInput,
                      {
                        backgroundColor: colors.surface2,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    placeholder="Nhập địa chỉ liên hệ của bạn"
                    placeholderTextColor={colors.textFaint}
                    onFocus={scrollToEndOnFocus}
                  />

                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Lưu Thay Đổi</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeTab === 'addresses' && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.addrHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                    Sổ Địa Chỉ Giao Hàng ({addresses.length})
                  </Text>
                  <TouchableOpacity
                    style={[styles.addAddrBtn, { backgroundColor: colors.primary }]}
                    onPress={() => setIsAddressModalVisible(true)}
                  >
                    <Ionicons name="add" size={16} color="#ffffff" />
                    <Text style={styles.addAddrBtnText}>Thêm mới</Text>
                  </TouchableOpacity>
                </View>

                {loadingAddresses ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: Spacing.lg }} />
                ) : addresses.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Bạn chưa lưu địa chỉ giao hàng nào. Bấm "+ Thêm mới" để thêm địa chỉ GHN.
                  </Text>
                ) : (
                  <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
                    {addresses.map((addr) => (
                      <View
                        key={addr.id}
                        style={[
                          styles.addrItem,
                          {
                            backgroundColor: addr.isDefault ? colors.primaryMuted : colors.surface2,
                            borderColor: addr.isDefault ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <View style={styles.addrTitleRow}>
                          <Text style={[styles.addrName, { color: colors.text }]}>{addr.fullName}</Text>
                          <Text style={[styles.addrPhone, { color: colors.textMuted }]}>{addr.phone}</Text>
                          {addr.isDefault && (
                            <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                              <Text style={styles.defaultBadgeText}>Mặc định</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.addrText, { color: colors.textSecondary }]}>
                          {addr.address}, {addr.city}
                        </Text>
                        <View style={styles.addrActions}>
                          {!addr.isDefault && (
                            <TouchableOpacity
                              style={[styles.addrActionBtn, { borderColor: colors.primary }]}
                              onPress={() => handleSetDefaultAddress(addr.id)}
                            >
                              <Text style={[styles.addrActionText, { color: colors.primary }]}>
                                Đặt mặc định
                              </Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.addrActionBtn, { borderColor: colors.error }]}
                            onPress={() => handleDeleteAddress(addr.id)}
                          >
                            <Text style={[styles.addrActionText, { color: colors.error }]}>Xóa</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'password' && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Đổi Mật Khẩu</Text>

                {isGoogleAccount ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Tài khoản của bạn đăng nhập bằng Google nên không sử dụng mật khẩu truyền thống.
                  </Text>
                ) : (
                  <>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Mật khẩu hiện tại
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.surface2,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      secureTextEntry
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      placeholder="Nhập mật khẩu hiện tại"
                      placeholderTextColor={colors.textFaint}
                    />

                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Mật khẩu mới (tối thiểu 8 ký tự, gồm chữ & số)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.surface2,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Nhập mật khẩu mới"
                      placeholderTextColor={colors.textFaint}
                    />

                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Xác nhận mật khẩu mới
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.surface2,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor={colors.textFaint}
                      onFocus={() => {
                        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
                      }}
                    />

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                      onPress={handleChangePassword}
                      disabled={changingPassword}
                    >
                      {changingPassword ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.primaryBtnText}>Cập Nhật Mật Khẩu</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      <NewAddressModal
        visible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        addresses={[]}
        selectedAddress={null}
        onSelectSavedAddress={() => {}}
        fullName={newFullName}
        onChangeFullName={setNewFullName}
        phone={newPhone}
        onChangePhone={setNewPhone}
        addressText={newAddressText}
        onChangeAddressText={setNewAddressText}
        provinces={provinces}
        districts={districts}
        wards={wards}
        selectedProvinceId={selectedProvinceId}
        selectedDistrictId={selectedDistrictId}
        selectedWardCode={selectedWardCode}
        loadingProvinces={loadingProvinces}
        loadingDistricts={loadingDistricts}
        loadingWards={loadingWards}
        onSelectProvince={handleSelectProvince}
        onSelectDistrict={handleSelectDistrict}
        onSelectWard={setSelectedWardCode}
        isAdding={isAddingAddress}
        onSubmit={handleCreateAddress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  tabText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xs,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatarImg: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.black,
  },
  cameraBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
  },
  profileEmail: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  googleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginTop: Spacing.sm,
  },
  googleNoticeText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    fontSize: Typography.sizes.xs,
  },
  multilineInput: {
    minHeight: 68,
  },
  primaryBtn: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  addrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  addAddrBtnText: {
    color: '#ffffff',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  emptyText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
    lineHeight: 18,
  },
  addrItem: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  addrTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  addrName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  addrPhone: {
    fontSize: Typography.sizes.xs,
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  addrText: {
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
  },
  addrActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addrActionBtn: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  addrActionText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
});
