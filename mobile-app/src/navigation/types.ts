import { NavigatorScreenParams } from '@react-navigation/native';
import { Product } from '../types';

export type MainTabParamList = {
  HomeTab: undefined;
  CatalogTab: { categorySlug?: string; keyword?: string } | undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ProductDetail: { slug: string; initialProduct?: Product };
  Login: undefined;
  Register: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: number | string; orderCode?: string };
  CreateReview: {
    productId: number;
    orderItemId: number;
    productName: string;
    productImage?: string;
    variantSummary?: string;
  };
  SupportChat: undefined;
};
