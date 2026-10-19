/**
 * Type & Dữ liệu Bảng Hướng Dẫn Kích Thước Thể Thao (Dynamic Category-Aware Size Guide)
 */

export type SizeGuideCategoryType = 'shoes' | 'apparel' | 'football' | 'gloves' | 'none';

export interface ShoeSizeRow {
  eu: string;
  us: string;
  uk: string;
  cm: number;
  inches: string;
}

export interface ApparelSizeRow {
  size: string;
  heightCm: string;
  weightKg: string;
  chestCm: string;
  waistCm: string;
}

export interface FootballSizeRow {
  sizeNumber: string;
  circumferenceCm: string;
  weightGrams: string;
  recommendedAge: string;
  fieldStandard: string;
}

export interface GloveSizeRow {
  size: string;
  palmLengthCm: string;
  palmWidthCm: string;
  recommendedHand: string;
}

// Bảng dữ liệu Giày Đá Bóng chuẩn Quốc Tế
export const SHOE_SIZE_DATA: ShoeSizeRow[] = [
  { eu: '38', us: '5.5', uk: '5.0', cm: 24.0, inches: '9.4' },
  { eu: '39', us: '6.5', uk: '6.0', cm: 24.5, inches: '9.6' },
  { eu: '40', us: '7.0', uk: '6.5', cm: 25.0, inches: '9.8' },
  { eu: '41', us: '8.0', uk: '7.5', cm: 25.5, inches: '10.0' },
  { eu: '42', us: '8.5', uk: '8.0', cm: 26.0, inches: '10.2' },
  { eu: '43', us: '9.5', uk: '9.0', cm: 26.5, inches: '10.4' },
  { eu: '44', us: '10.0', uk: '9.5', cm: 27.0, inches: '10.6' },
  { eu: '45', us: '11.0', uk: '10.5', cm: 27.5, inches: '10.8' },
];

// Bảng dữ liệu Quần Áo Thể Thao chuẩn Việt Nam & Châu Á
export const APPAREL_SIZE_DATA: ApparelSizeRow[] = [
  { size: 'S', heightCm: '155 - 165 cm', weightKg: '48 - 56 kg', chestCm: '86 - 90 cm', waistCm: '70 - 74 cm' },
  { size: 'M', heightCm: '165 - 170 cm', weightKg: '57 - 65 kg', chestCm: '91 - 95 cm', waistCm: '75 - 79 cm' },
  { size: 'L', heightCm: '170 - 175 cm', weightKg: '66 - 74 kg', chestCm: '96 - 100 cm', waistCm: '80 - 84 cm' },
  { size: 'XL', heightCm: '175 - 182 cm', weightKg: '75 - 82 kg', chestCm: '101 - 106 cm', waistCm: '85 - 90 cm' },
  { size: 'XXL', heightCm: '180 - 188 cm', weightKg: '83 - 92 kg', chestCm: '107 - 112 cm', waistCm: '91 - 96 cm' },
  { size: '3XL', heightCm: '185 - 195 cm', weightKg: '93 - 105 kg', chestCm: '113 - 120 cm', waistCm: '97 - 104 cm' },
];

// Bảng dữ liệu Quả Bóng Đá Tiêu Chuẩn FIFA
export const FOOTBALL_SIZE_DATA: FootballSizeRow[] = [
  { sizeNumber: 'Size 3', circumferenceCm: '58 - 60 cm', weightGrams: '310 - 340g', recommendedAge: 'Dưới 8 tuổi', fieldStandard: 'Tập luyện thiếu nhi' },
  { sizeNumber: 'Size 4', circumferenceCm: '63.5 - 66 cm', weightGrams: '350 - 390g', recommendedAge: '8 - 12 tuổi', fieldStandard: 'Sân Futsal / Sân 5 người' },
  { sizeNumber: 'Size 5', circumferenceCm: '68 - 70 cm', weightGrams: '410 - 450g', recommendedAge: 'Từ 13 tuổi trở lên', fieldStandard: 'Sân 7 / Sân 11 Tiêu chuẩn Quốc tế' },
];

// Bảng dữ liệu Găng Tay Thủ Môn
export const GLOVE_SIZE_DATA: GloveSizeRow[] = [
  { size: 'Size 7', palmLengthCm: '17.0 - 18.0 cm', palmWidthCm: '7.5 - 8.0 cm', recommendedHand: 'Bàn tay nhỏ / Thiếu niên' },
  { size: 'Size 8', palmLengthCm: '18.0 - 19.0 cm', palmWidthCm: '8.0 - 8.5 cm', recommendedHand: 'Bàn tay vừa (Phổ biến)' },
  { size: 'Size 9', palmLengthCm: '19.0 - 20.0 cm', palmWidthCm: '8.5 - 9.0 cm', recommendedHand: 'Bàn tay lớn' },
  { size: 'Size 10', palmLengthCm: '20.0 - 21.5 cm', palmWidthCm: '9.0 - 10.0 cm', recommendedHand: 'Bàn tay rất lớn' },
];
