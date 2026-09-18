export type TransactionType = 'IMPORT' | 'EXPORT' | 'ADJUSTMENT';

export interface Supplier {
  id: number;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierRequest {
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface InventoryTransaction {
  id: number;
  code?: string;
  ticketNumber: string;
  variantId: number;
  variantSku: string;
  variantSize?: string;
  variantColor?: string;
  productId: number;
  productName: string;
  productSlug?: string;
  productMainImage?: string;
  supplierId?: number;
  supplierName?: string;
  supplierCode?: string;
  type: TransactionType;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  stockBefore?: number;
  stockAfter?: number;
  note?: string;
  createdByUserId: number;
  createdByUserName?: string;
  createdAt: string;
}

export interface InventoryOverviewStats {
  totalVariantsCount: number;
  totalInStockQuantity: number;
  totalInventoryValue: number;
  totalImportInPeriod: number;
  totalExportInPeriod: number;
  lowStockAlertCount: number;
}

export interface LowStockItem {
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  mainImage?: string;
  sku: string;
  size?: string;
  color?: string;
  stockQuantity: number;
  price: number;
  costPrice?: number;
  status: string;
}

export interface TransactionItemRequest {
  variantId: number;
  quantity: number;
  unitCost?: number;
}

export interface CreateInventoryTransactionRequest {
  variantId?: number;
  supplierId?: number;
  type?: TransactionType;
  quantity?: number;
  unitCost?: number;
  note?: string;
  items?: TransactionItemRequest[];
}

export interface InventoryAuditRequest {
  variantId: number;
  actualQuantity: number;
  note?: string;
  reason?: string;
}
