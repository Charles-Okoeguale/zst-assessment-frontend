/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Discount {
  type: string;
  value?: number;
}

export interface DiscountResult {
  product: Product;
  quantity: number;
  original_price: number;
  discounted_price: number;
  savings: number;
  applied_discounts: any[];
}