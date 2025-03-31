import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Product, Discount, DiscountResult } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useProductApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async (): Promise<Product[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/`);
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.detail || 'Failed to fetch products');
      } else {
        setError('Failed to fetch products');
      }
      return [];
    }
  };

  const createProduct = async (name: string, price: number): Promise<boolean> => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/products/`, { name, price });
      return true;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.detail || 'Failed to create product');
      } else {
        setError('Failed to create product');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = async (
    productId: string,
    quantity: number,
    discounts: Discount[]
  ): Promise<DiscountResult | null> => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/calculate-discount/`, {
        product_id: productId,
        quantity,
        discounts
      });
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.detail || 'Failed to calculate discount');
      } else {
        setError('Failed to calculate discount');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    fetchProducts,
    createProduct,
    calculateDiscount
  };
};