import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface SizeGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="body-outline" size={20} color={Colors.primary} />
              <Text style={styles.title}>Bảng Đo Chuẩn Size AP Sports</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.slate600} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Giày thể thao */}
            <Text style={styles.tableTitle}>👟 Bảng Size Giày Bóng Đá & Cầu Lông (Chiều dài bàn chân)</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.col, styles.headerCol]}>Size VN/EU</Text>
                <Text style={[styles.col, styles.headerCol]}>Dài chân (cm)</Text>
                <Text style={[styles.col, styles.headerCol]}>US</Text>
              </View>
              {[
                { eu: '39', cm: '24.5', us: '6.5' },
                { eu: '40', cm: '25.0', us: '7.0' },
                { eu: '41', cm: '25.5 - 26.0', us: '8.0' },
                { eu: '42', cm: '26.5', us: '8.5' },
                { eu: '43', cm: '27.0 - 27.5', us: '9.5' },
                { eu: '44', cm: '28.0', us: '10.0' },
              ].map((row, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                  <Text style={[styles.col, styles.boldCol]}>{row.eu}</Text>
                  <Text style={styles.col}>{row.cm}</Text>
                  <Text style={styles.col}>{row.us}</Text>
                </View>
              ))}
            </View>

            {/* Quần áo thể thao */}
            <Text style={[styles.tableTitle, { marginTop: Spacing.md }]}>
              👕 Bảng Size Áo Bóng Đá & Võ Phục
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.col, styles.headerCol]}>Size</Text>
                <Text style={[styles.col, styles.headerCol]}>Chiều cao</Text>
                <Text style={[styles.col, styles.headerCol]}>Cân nặng</Text>
              </View>
              {[
                { size: 'S', h: '1m55 - 1m64', w: '48 - 56 kg' },
                { size: 'M', h: '1m65 - 1m70', w: '57 - 65 kg' },
                { size: 'L', h: '1m71 - 1m76', w: '66 - 74 kg' },
                { size: 'XL', h: '1m77 - 1m83', w: '75 - 84 kg' },
                { size: 'XXL', h: '1m84 - 1m90', w: '85 - 95 kg' },
              ].map((row, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                  <Text style={[styles.col, styles.boldCol]}>{row.size}</Text>
                  <Text style={styles.col}>{row.h}</Text>
                  <Text style={styles.col}>{row.w}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={18} color="#0284c7" />
              <Text style={styles.tipText}>
                Mẹo chọn giày đá bóng: Nếu mu bàn chân bè ngang, bạn nên tăng thêm 0.5 - 1 size để mang êm ái khi thắt dây.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
  },
  tableTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate800,
    marginBottom: Spacing.xs,
  },
  table: {
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  tableHeaderRow: {
    backgroundColor: Colors.slate100,
  },
  tableRowAlt: {
    backgroundColor: Colors.slate50,
  },
  col: {
    flex: 1,
    fontSize: 11,
    color: Colors.slate700,
    textAlign: 'center',
  },
  headerCol: {
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  boldCol: {
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#e0f2fe',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    color: '#0369a1',
    lineHeight: 16,
  },
});
