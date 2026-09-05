import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_TYPES = ['PRODUCT', 'SERVICE', 'SUBSCRIPTION'];
const UNITS = ['each', 'hour', 'day', 'month', 'year', 'kg', 'litre', 'set', 'box'];
const TYPE_LABELS = { PRODUCT: 'Product', SERVICE: 'Service', SUBSCRIPTION: 'Subscription' };
const UNIT_LABELS = {
  each: 'Each (unit)', hour: 'Hour', day: 'Day', month: 'Month', year: 'Year',
  kg: 'Kilogram (kg)', litre: 'Litre', set: 'Set', box: 'Box',
};

// ─── Validation schema ────────────────────────────────────────────────────────

const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required').max(100),
  priceModifier: z.coerce.number().min(0, 'Must be non-negative').default(0),
  isDefault: z.boolean().default(false),
});

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().max(2000).optional().or(z.literal('')),
  productType: z.enum(PRODUCT_TYPES, { errorMap: () => ({ message: 'Please select a product type' }) }),
  basePrice: z.coerce.number().min(0, 'Base price must be non-negative'),
  costPrice: z.coerce.number().min(0, 'Cost price must be non-negative').default(0),
  taxRate: z.coerce.number().min(0).max(100, 'Tax rate must be between 0 and 100').default(0),
  unit: z.enum(UNITS, { errorMap: () => ({ message: 'Please select a unit' }) }),
  variants: z.array(variantSchema).default([]),
  isActive: z.boolean().default(true),
});

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProductForm
 *
 * Shared form used by both ProductCreatePage and ProductEditPage.
 *
 * Props:
 *   defaultValues  {object}    Pre-populate fields (for edit mode)
 *   onSubmit       {function}  Async (data) => void — called with validated data
 *   isSubmitting   {boolean}   External submitting state (shows spinner)
 *   serverError    {string}    Error message from the API
 *   submitLabel    {string}    Button label text (default: "Save product")
 */
function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting: externalSubmitting = false,
  serverError = '',
  submitLabel = 'Save product',
}) {
  const [showVariants, setShowVariants] = useState(
    (defaultValues?.variants?.length ?? 0) > 0
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      productType: '',
      basePrice: '',
      costPrice: '',
      taxRate: 0,
      unit: 'each',
      variants: [],
      isActive: true,
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const isSubmitting = externalSubmitting || formSubmitting;

  const handleFormSubmit = async (values) => {
    // Remove empty variants if hidden
    if (!showVariants) values.variants = [];
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 animate-fade-in"
        >
          {serverError}
        </div>
      )}

      {/* ── Row 1: Name + Category ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-name" className="form-label">Product name *</label>
          <input
            id="pf-name"
            type="text"
            placeholder="e.g. Enterprise CRM Suite"
            {...register('name')}
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="pf-category" className="form-label">Category *</label>
          <input
            id="pf-category"
            type="text"
            placeholder="e.g. Software, Consulting, Hardware"
            {...register('category')}
            className={`form-input ${errors.category ? 'form-input-error' : ''}`}
          />
          {errors.category && <p className="form-error">{errors.category.message}</p>}
        </div>
      </div>

      {/* ── Row 2: Type + Unit ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-type" className="form-label">Product type *</label>
          <select
            id="pf-type"
            {...register('productType')}
            className={`form-input ${errors.productType ? 'form-input-error' : ''}`}
          >
            <option value="">Select type…</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
          {errors.productType && <p className="form-error">{errors.productType.message}</p>}
        </div>

        <div>
          <label htmlFor="pf-unit" className="form-label">Unit *</label>
          <select
            id="pf-unit"
            {...register('unit')}
            className={`form-input ${errors.unit ? 'form-input-error' : ''}`}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{UNIT_LABELS[u]}</option>
            ))}
          </select>
          {errors.unit && <p className="form-error">{errors.unit.message}</p>}
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="pf-description" className="form-label">Description</label>
        <textarea
          id="pf-description"
          rows={3}
          placeholder="Optional product description…"
          {...register('description')}
          className={`form-input resize-none ${errors.description ? 'form-input-error' : ''}`}
        />
        {errors.description && <p className="form-error">{errors.description.message}</p>}
      </div>

      {/* ── Pricing row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="pf-base-price" className="form-label">Base price (₹) *</label>
          <input
            id="pf-base-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            {...register('basePrice')}
            className={`form-input ${errors.basePrice ? 'form-input-error' : ''}`}
          />
          {errors.basePrice && <p className="form-error">{errors.basePrice.message}</p>}
        </div>

        <div>
          <label htmlFor="pf-cost-price" className="form-label">Cost price (₹)</label>
          <input
            id="pf-cost-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            {...register('costPrice')}
            className={`form-input ${errors.costPrice ? 'form-input-error' : ''}`}
          />
          {errors.costPrice && <p className="form-error">{errors.costPrice.message}</p>}
        </div>

        <div>
          <label htmlFor="pf-tax-rate" className="form-label">Tax rate (%)</label>
          <input
            id="pf-tax-rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="0"
            {...register('taxRate')}
            className={`form-input ${errors.taxRate ? 'form-input-error' : ''}`}
          />
          {errors.taxRate && <p className="form-error">{errors.taxRate.message}</p>}
        </div>
      </div>

      {/* ── Status toggle ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <input
          id="pf-is-active"
          type="checkbox"
          {...register('isActive')}
          className="w-4 h-4 accent-brand-500 rounded"
        />
        <label htmlFor="pf-is-active" className="text-sm text-slate-300 select-none cursor-pointer">
          Product is active (visible to sales team and quotations)
        </label>
      </div>

      {/* ── Variants section ─────────────────────────────────────────────── */}
      <div className="border border-slate-700/60 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowVariants((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/70 transition-colors text-sm font-semibold text-slate-300"
          id="pf-toggle-variants"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            Product Variants
            {fields.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-brand-900/60 text-brand-300 text-xs font-semibold">
                {fields.length}
              </span>
            )}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${showVariants ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showVariants && (
          <div className="px-4 pb-4 pt-3 space-y-3 bg-slate-800/10">
            {fields.length === 0 && (
              <p className="text-slate-500 text-xs italic py-2">
                No variants added yet. Click "Add variant" to add one.
              </p>
            )}

            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_130px_auto_auto] gap-2 items-end"
              >
                <div>
                  <label className="form-label">Variant name</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard"
                    {...register(`variants.${idx}.name`)}
                    className={`form-input ${errors.variants?.[idx]?.name ? 'form-input-error' : ''}`}
                  />
                  {errors.variants?.[idx]?.name && (
                    <p className="form-error">{errors.variants[idx].name.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Price modifier (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register(`variants.${idx}.priceModifier`)}
                    className="form-input"
                  />
                </div>

                <div className="flex flex-col items-center gap-1 pb-0.5">
                  <label className="form-label text-center">Default</label>
                  <input
                    type="checkbox"
                    {...register(`variants.${idx}.isDefault`)}
                    className="w-4 h-4 accent-brand-500"
                  />
                </div>

                <div className="pb-0.5">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 transition-colors border border-red-700/30"
                    aria-label={`Remove variant ${idx + 1}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ name: '', priceModifier: 0, isDefault: false })}
              className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors font-medium mt-2"
              id="pf-add-variant"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add variant
            </button>
          </div>
        )}
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <button
        id="pf-submit"
        type="submit"
        disabled={isSubmitting}
        className="btn-primary"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving…
          </span>
        ) : submitLabel}
      </button>
    </form>
  );
}

export default ProductForm;
