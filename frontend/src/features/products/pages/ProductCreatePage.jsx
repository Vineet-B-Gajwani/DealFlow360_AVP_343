import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import productsApi from '../api/products.api';

/**
 * ProductCreatePage
 *
 * Route: /products/new
 * Roles: ADMIN, SALES_MANAGER (enforced on the backend)
 */
function ProductCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const { data: res } = await productsApi.create(data);
      // Navigate to edit page so user can see the saved product
      navigate(`/products/${res.data.product._id}/edit`, {
        replace: true,
        state: { created: true },
      });
    } catch (err) {
      const apiData = err?.response?.data;
      if (apiData?.errors?.length) {
        setServerError(apiData.errors.map((e) => e.message).join(' · '));
      } else {
        setServerError(apiData?.message || 'Failed to create product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Decorative blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-900/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-950/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <span>›</span>
            <Link to="/products" className="hover:text-slate-300 transition-colors">Products</Link>
            <span>›</span>
            <span className="text-slate-300">New product</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Add New Product</h1>
          <p className="text-slate-400 text-sm mt-1">
            Fill in the details below to add a product to your catalogue.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/30 p-6 sm:p-8">
          <ProductForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            serverError={serverError}
            submitLabel="Create product"
          />
        </div>
      </div>
    </div>
  );
}

export default ProductCreatePage;
