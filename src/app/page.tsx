/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useState, useEffect } from 'react';
import { Product, DiscountResult, Discount } from '@/types';
import { ProductForm } from '@/components/productForm';
import { DiscountCalculator } from '@/components/discountCalculator';
import { useProductApi } from '@/hooks/api-operations';


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<DiscountResult | null>(null);
  const { loading, error, fetchProducts, createProduct, calculateDiscount } = useProductApi();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const fetchedProducts = await fetchProducts();
    setProducts(fetchedProducts);
  };

  const handleCreateProduct = async (name: string, price: number) => {
    const success = await createProduct(name, price);
    if (success) {
      loadProducts();
    }
  };

  const handleCalculateDiscount = async (productId: string, quantity: number, discounts: Discount[]) => {
    const result = await calculateDiscount(productId, quantity, discounts);
    if (result) {
      setResult(result);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Discount Calculator</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <ProductForm 
          onSubmit={handleCreateProduct}
          loading={loading}
        />

        <DiscountCalculator
          products={products}
          onCalculate={handleCalculateDiscount}
          loading={loading}
          result={result}
        />
      </div>
    </div>
  );
}