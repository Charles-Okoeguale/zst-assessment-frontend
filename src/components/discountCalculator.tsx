import { useState } from 'react';
import { Product, Discount, DiscountResult } from '@/types';

interface DiscountCalculatorProps {
  products: Product[];
  onCalculate: (productId: string, quantity: number, discounts: Discount[]) => Promise<void>;
  loading: boolean;
  result: DiscountResult | null;
}

export const DiscountCalculator = ({ 
  products, 
  onCalculate, 
  loading,
  result 
}: DiscountCalculatorProps) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

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

  const handleCalculate = () => {
    if (!selectedProduct || discounts.length === 0) return;
    onCalculate(selectedProduct, quantity, discounts);
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Calculate Discount</h2>
        
        {/* Product Selection */}
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

        {/* Quantity Input */}
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

        {/* Discount Controls */}
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

          {/* Discount List */}
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
            onClick={handleCalculate}
            disabled={loading || !selectedProduct || discounts.length === 0}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 w-full"
          >
            {loading ? 'Calculating...' : 'Calculate Final Price'}
          </button>
        </div>
      </div>

      {/* Results Display */}
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
    </>
  );
};