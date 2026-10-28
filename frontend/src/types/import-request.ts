/**
 * Định nghĩa các kiểu dữ liệu cho nghiệp vụ Yêu Cầu Nhập Kho (Import Request)
 * Tuân thủ cấu trúc thuộc tính động (attributes & variantName) đại diện cho sản phẩm thể thao
 */

export type ImportRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type InboundActionType = 'NONE' | 'DIRECT_IMPORT' | 'IMPORT_REQUEST';

export interface ImportRequestItem {
  id: number;
  variantId: number;
  sku: string;
  barcode?: string;
  /** Chuỗi thuộc tính biến thể mở rộng (JSON hoặc string hiển thị) */
  attributes?: string;
  /** Tên hiển thị trực quan cho biến thể thể thao (VD: "Đỏ | Size 42 | Sân cỏ tự nhiên") */
  variantName?: string;
  image?: string;
  currentStock: number;
  requestedQuantity: number;
  approvedQuantity?: number;
  expectedCostPrice?: number;
  actualCostPrice?: number;
}

export interface ImportRequest {
  id: number;
  code: string;
  productId: number;
  productName: string;
  productMainImage?: string;
  supplierId?: number;
  supplierName?: string;
  status: ImportRequestStatus;
  requestedByUserId: number;
  requestedByUserName: string;
  requestedByUserEmail: string;
  requestedByUserRole?: string;
  approvedByUserId?: number;
  approvedByUserName?: string;
  note?: string;
  rejectionReason?: string;
  importTicketCode?: string;
  totalRequestedQuantity: number;
  totalApprovedQuantity: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  items: ImportRequestItem[];
}

export interface CreateImportRequestItemPayload {
  variantId: number;
  requestedQuantity: number;
  expectedCostPrice?: number;
}

export interface CreateImportRequestPayload {
  productId: number;
  supplierId?: number;
  note?: string;
  items: CreateImportRequestItemPayload[];
}

export interface ApproveItemPayload {
  itemId: number;
  approvedQuantity: number;
  actualCostPrice?: number;
}

export interface ApproveImportRequestPayload {
  supplierId: number;
  note?: string;
  items: ApproveItemPayload[];
}

export interface RejectImportRequestPayload {
  reason: string;
}

export interface ImportRequestFilterParams {
  status?: ImportRequestStatus;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
