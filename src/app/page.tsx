/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';

const API_BASE_URL = 'http://localhost:8000'; 

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Discount {
  type: string;
  value?: number;
}

interface DiscountResult {
  product: Product;
  quantity: number;
  original_price: number;
  discounted_price: number;
  savings: number;
  applied_discounts: any[];
}

export default function Home() {
  // State hooks
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/`);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newProduct.name || !newProduct.price) {
      setError('Product name and price are required');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/products/`, {
        name: newProduct.name,
        price: parseFloat(newProduct.price)
      });
      setNewProduct({ name: '', price: '' });
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const addDiscount = (type: string) => {
    const newDiscount: Discount = { type };
    
    if (type === 'percentage' || type === 'flat') {
      const value = prompt(`Enter ${type === 'percentage' ? 'percentage' : 'amount'} value:`);
      if (value === null) return;
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        alert('Please enter a valid positive number');
        return;
      }
      newDiscount.value = numValue;
    }
    
    setDiscounts([...discounts, newDiscount]);
  };

  const removeDiscount = (index: number) => {
    const newDiscounts = [...discounts];
    newDiscounts.splice(index, 1);
    setDiscounts(newDiscounts);
  };

  const calculateDiscount = async () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    if (discounts.length === 0) {
      setError('Please add at least one discount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${API_BASE_URL}/calculate-discount/`, {
        product_id: selectedProduct,
        quantity,
        discounts: discounts
      });
      
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <Head>
        <title>Discount Calculator</title>
        <meta name="description" content="Product Discount Calculator" />
      </Head>

      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Discount Calculator</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Product</h2>
          <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Price</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Product price"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </form>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Calculate Discount</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select a product --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Discounts</label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <button 
                onClick={() => addDiscount('percentage')}
                className="bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600"
              >
                Add Percentage
              </button>
              <button 
                onClick={() => addDiscount('flat')}
                className="bg-purple-500 text-white py-1 px-3 rounded text-sm hover:bg-purple-600"
              >
                Add Flat
              </button>
              <button 
                onClick={() => addDiscount('bogo')}
                className="bg-orange-500 text-white py-1 px-3 rounded text-sm hover:bg-orange-600"
              >
                Add BOGO
              </button>
            </div>

            {discounts.length > 0 ? (
              <div className="space-y-2 mb-4">
                {discounts.map((discount, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span>
                      {discount.type === 'percentage' && `${discount.value}% off`}
                      {discount.type === 'flat' && `$${discount.value} off`}
                      {discount.type === 'bogo' && 'Buy One Get One Free'}
                    </span>
                    <button 
                      onClick={() => removeDiscount(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No discounts added yet</p>
            )}

            <button
              onClick={calculateDiscount}
              disabled={loading || !selectedProduct || discounts.length === 0}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 w-full"
            >
              {loading ? 'Calculating...' : 'Calculate Final Price'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <div className="space-y-2">
              <p><strong>Product:</strong> {result.product.name}</p>
              <p><strong>Quantity:</strong> {result.quantity}</p>
              <p><strong>Original Price:</strong> ${result.original_price.toFixed(2)}</p>
              <p><strong>Discounted Price:</strong> ${result.discounted_price.toFixed(2)}</p>
              <p><strong>Total Savings:</strong> ${result.savings.toFixed(2)} ({(result.savings / result.original_price * 100).toFixed(2)}%)</p>
              
              <div className="mt-4">
                <h3 className="font-medium">Applied Discounts:</h3>
                <ul className="list-disc pl-5 mt-2">
                  {result.applied_discounts.map((discount, index) => (
                    <li key={index}>
                      {discount.type === 'percentage' && `${discount.params.value}% off - Saved $${discount.saved.toFixed(2)}`}
                      {discount.type === 'flat' && `$${discount.params.value} off - Saved $${discount.saved.toFixed(2)}`}
                      {discount.type === 'bogo' && `Buy One Get One Free - Saved $${discount.saved.toFixed(2)}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}