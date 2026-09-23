export interface ShippingAddress {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  default?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddressRequest {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

// GHN Location Master Data Types
export interface GhnProvince {
  ProvinceID: number;
  ProvinceName: string;
  CountryID: number;
  Code: string;
  NameExtension?: string[];
}

export interface GhnDistrict {
  DistrictID: number;
  DistrictName: string;
  ProvinceID: number;
  Code: string;
  Type: number;
  SupportType: number;
  NameExtension?: string[];
}

export interface GhnWard {
  WardCode: string;
  WardName: string;
  DistrictID: number;
  NameExtension?: string[];
}
