import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, BorderRadius, Typography } from '../../config/theme';
import { GhnDistrict, GhnProvince, GhnWard, ShippingAddress } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useNewAddressModal } from '../../hooks/useNewAddressModal';

interface NewAddressModalProps {
  visible: boolean;
  onClose: () => void;
  addresses: ShippingAddress[];
  selectedAddress: ShippingAddress | null;
  onSelectSavedAddress: (addr: ShippingAddress) => void;
  fullName: string;
  onChangeFullName: (text: string) => void;
  phone: string;
  onChangePhone: (text: string) => void;
  addressText: string;
  onChangeAddressText: (text: string) => void;
  provinces: GhnProvince[];
  districts: GhnDistrict[];
  wards: GhnWard[];
  selectedProvinceId: number | null;
  selectedDistrictId: number | null;
  selectedWardCode: string | null;
  loadingProvinces: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  onSelectProvince: (provinceId: number) => void;
  onSelectDistrict: (districtId: number) => void;
  onSelectWard: (wardCode: string) => void;
  isAdding: boolean;
  onSubmit: () => void;
}

type ActivePicker = 'province' | 'district' | 'ward' | null;

export const NewAddressModal: React.FC<NewAddressModalProps> = ({
  visible,
  onClose,
  addresses,
  selectedAddress,
  onSelectSavedAddress,
  fullName,
  onChangeFullName,
  phone,
  onChangePhone,
  addressText,
  onChangeAddressText,
  provinces,
  districts,
  wards,
  selectedProvinceId,
  selectedDistrictId,
  selectedWardCode,
  loadingProvinces,
  loadingDistricts,
  loadingWards,
  onSelectProvince,
  onSelectDistrict,
  onSelectWard,
  isAdding,
  onSubmit,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    scrollRef,
    keyboardHeight,
    modalMaxHeight,
    scrollToEndOnFocus,
    mode,
    setMode,
    activePicker,
    pickerSearch,
    setPickerSearch,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    filteredPickerItems,
    openPicker,
    closePicker,
    handleClose,
  } = useNewAddressModal({
    addresses,
    provinces,
    districts,
    wards,
    selectedProvinceId,
    selectedDistrictId,
    selectedWardCode,
    onClose,
  });

  const modalBottomPad = Math.max(
    keyboardHeight,
    Platform.OS === 'android' ? Math.max(insets.bottom, 48) : insets.bottom
  );

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={handleClose}>
      <View style={[styles.modalOverlay, { paddingBottom: modalBottomPad }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: modalMaxHeight }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {mode === 'list' && addresses.length > 0
                ? 'Chọn Địa Chỉ Giao Hàng'
                : 'Thêm Địa Chỉ Giao Hàng (GHN)'}
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {addresses.length > 0 && (
            <View style={[styles.tabRow, { backgroundColor: colors.surface2 }]}>
              <TouchableOpacity
                style={[styles.tabBtn, mode === 'list' && { backgroundColor: colors.primary }]}
                onPress={() => {
                  closePicker();
                  setMode('list');
                }}
              >
                <Text style={[styles.tabText, { color: mode === 'list' ? '#ffffff' : colors.textSecondary }]}>
                  Địa chỉ đã lưu ({addresses.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, mode === 'new' && { backgroundColor: colors.primary }]}
                onPress={() => setMode('new')}
              >
                <Text style={[styles.tabText, { color: mode === 'new' ? '#ffffff' : colors.textSecondary }]}>
                  + Thêm địa chỉ mới
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'list' && addresses.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: Spacing.lg, gap: Spacing.sm }}
            >
              {addresses.map((addr) => {
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[
                      styles.savedCard,
                      {
                        backgroundColor: isSelected ? colors.primaryMuted : colors.surface2,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      onSelectSavedAddress(addr);
                      handleClose();
                    }}
                  >
                    <View style={styles.savedHeader}>
                      <Text style={[styles.savedName, { color: colors.text }]}>{addr.fullName}</Text>
                      <Text style={[styles.savedPhone, { color: colors.textMuted }]}>{addr.phone}</Text>
                      {addr.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.defaultBadgeText}>Mặc định</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.savedAddr, { color: colors.textSecondary }]}>
                      {addr.address}, {addr.city}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: Spacing.xl }}
            >
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Họ và tên người nhận:</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="Nguyễn Văn A"
                placeholderTextColor={colors.textFaint}
                value={fullName}
                onChangeText={onChangeFullName}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Số điện thoại:</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="0912345678"
                placeholderTextColor={colors.textFaint}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={onChangePhone}
              />

              {/* GHN Province */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tỉnh / Thành phố (GHN):</Text>
              <TouchableOpacity
                style={[
                  styles.pickerBtn,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
                onPress={() => openPicker('province')}
              >
                <Text
                  style={[
                    styles.pickerBtnText,
                    { color: selectedProvince ? colors.text : colors.textFaint },
                  ]}
                  numberOfLines={1}
                >
                  {selectedProvince ? selectedProvince.ProvinceName : 'Chọn Tỉnh / Thành phố'}
                </Text>
                {loadingProvinces ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>

              {/* GHN District */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Quận / Huyện (GHN):</Text>
              <TouchableOpacity
                style={[
                  styles.pickerBtn,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                    opacity: selectedProvinceId ? 1 : 0.5,
                  },
                ]}
                disabled={!selectedProvinceId}
                onPress={() => openPicker('district')}
              >
                <Text
                  style={[
                    styles.pickerBtnText,
                    { color: selectedDistrict ? colors.text : colors.textFaint },
                  ]}
                  numberOfLines={1}
                >
                  {selectedDistrict ? selectedDistrict.DistrictName : 'Chọn Quận / Huyện'}
                </Text>
                {loadingDistricts ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>

              {/* GHN Ward */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Phường / Xã (GHN):</Text>
              <TouchableOpacity
                style={[
                  styles.pickerBtn,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                    opacity: selectedDistrictId ? 1 : 0.5,
                  },
                ]}
                disabled={!selectedDistrictId}
                onPress={() => openPicker('ward')}
              >
                <Text
                  style={[
                    styles.pickerBtnText,
                    { color: selectedWard ? colors.text : colors.textFaint },
                  ]}
                  numberOfLines={1}
                >
                  {selectedWard ? selectedWard.WardName : 'Chọn Phường / Xã'}
                </Text>
                {loadingWards ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>

              {/* Inline searchable list for active GHN picker */}
              {activePicker && (
                <View style={[styles.inlinePickerBox, { backgroundColor: colors.surface2, borderColor: colors.primary }]}>
                  <TextInput
                    style={[
                      styles.pickerSearchInput,
                      { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="Tìm nhanh..."
                    placeholderTextColor={colors.textFaint}
                    value={pickerSearch}
                    onChangeText={setPickerSearch}
                  />
                  <ScrollView style={styles.pickerScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {filteredPickerItems.length === 0 ? (
                      <Text style={[styles.pickerEmptyText, { color: colors.textMuted }]}>
                        Không có dữ liệu phù hợp
                      </Text>
                    ) : (
                      filteredPickerItems.map((item) => (
                        <TouchableOpacity
                          key={item.key}
                          style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                          onPress={() => {
                            if (activePicker === 'province' && 'id' in item) {
                              onSelectProvince(item.id);
                            } else if (activePicker === 'district' && 'id' in item) {
                              onSelectDistrict(item.id);
                            } else if (activePicker === 'ward' && 'code' in item) {
                              onSelectWard(item.code);
                            }
                            closePicker();
                          }}
                        >
                          <Text style={[styles.pickerItemText, { color: colors.text }]}>{item.label}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Địa chỉ chi tiết (Số nhà, tên đường):
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  styles.multilineInput,
                  { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="123 Đường 3/2"
                placeholderTextColor={colors.textFaint}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={addressText}
                onChangeText={onChangeAddressText}
                onFocus={scrollToEndOnFocus}
              />

              <TouchableOpacity
                style={[styles.btnSaveAddress, { backgroundColor: colors.primary }, isAdding && styles.btnDisabled]}
                onPress={onSubmit}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.btnSaveAddressText}>Lưu & Chọn Địa Chỉ Này</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.md,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  savedCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  savedName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  savedPhone: {
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
  savedAddr: {
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    fontSize: Typography.sizes.xs,
  },
  multilineInput: {
    minHeight: 72,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
  },
  pickerBtnText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    marginRight: Spacing.xs,
  },
  inlinePickerBox: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  pickerSearchInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.xs,
  },
  pickerScroll: {
    maxHeight: 180,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerItemText: {
    fontSize: Typography.sizes.xs,
  },
  pickerEmptyText: {
    textAlign: 'center',
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.xs,
  },
  btnSaveAddress: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  btnSaveAddressText: {
    color: '#ffffff',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
