'use strict';

const { Product } = require('./product.model');

// ─────────────────────────────────────────────────────────────────────────────
//  Service functions
//
//  All business logic lives here.  Controllers are thin HTTP adapters that
//  call these functions.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new product.
 *
 * @param {object} data - Validated request body
 * @returns {Product} The created product document
 */
async function createProduct(data) {
  const existing = await Product.findOne({ name: data.name });
  if (existing) {
    const err = new Error(`A product named "${data.name}" already exists`);
    err.statusCode = 409;
    throw err;
  }

  const product = await Product.create(data);
  return product;
}

/**
 * List products with optional search, filtering and pagination.
 *
 * Supported query params (all optional):
 *   search      — full-text search on name + description
 *   category    — exact-match filter (case-insensitive)
 *   productType — exact-match filter
 *   isActive    — 'true' | 'false'
 *   page        — defaults to 1
 *   limit       — defaults to 20, max 100
 *
 * @param {object} queryParams
 * @returns {{ products: Product[], total: number, page: number, totalPages: number }}
 */
async function listProducts(queryParams = {}) {
  const {
    search,
    category,
    productType,
    isActive,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc',
  } = queryParams;

  const filter = {};

  // Full-text search (uses the text index on name + description)
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  // Category — case-insensitive exact match
  if (category && category.trim()) {
    filter.category = { $regex: `^${category.trim()}$`, $options: 'i' };
  }

  // Product type
  if (productType && productType.trim()) {
    filter.productType = productType.trim();
  }

  // Active status
  if (isActive === 'true' || isActive === true) {
    filter.isActive = true;
  } else if (isActive === 'false' || isActive === false) {
    filter.isActive = false;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = search
    ? { score: { $meta: 'textScore' }, [sortBy]: sortOrder }
    : { [sortBy]: sortOrder };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select(search ? { score: { $meta: 'textScore' } } : {}),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  };
}

/**
 * Get a single product by its MongoDB _id.
 *
 * @param {string} id
 * @returns {Product}
 */
async function getProductById(id) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return product;
}

/**
 * Fully replace a product's editable fields (PUT semantics).
 *
 * @param {string} id
 * @param {object} data - Validated request body
 * @returns {Product} The updated product document
 */
async function updateProduct(id, data) {
  // Check name uniqueness when the name is being changed
  if (data.name) {
    const conflict = await Product.findOne({ name: data.name, _id: { $ne: id } });
    if (conflict) {
      const err = new Error(`A product named "${data.name}" already exists`);
      err.statusCode = 409;
      throw err;
    }
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return product;
}

/**
 * Toggle a product's active / inactive status.
 *
 * @param {string} id
 * @param {boolean} isActive
 * @returns {Product} The updated product document
 */
async function setProductStatus(id, isActive) {
  const product = await Product.findByIdAndUpdate(
    id,
    { $set: { isActive } },
    { new: true }
  );

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return product;
}

/**
 * Return a distinct, sorted list of all categories in use.
 * Used to populate category filter dropdowns in the UI.
 *
 * @returns {string[]}
 */
async function listCategories() {
  const categories = await Product.distinct('category');
  return categories.sort((a, b) => a.localeCompare(b));
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  setProductStatus,
  listCategories,
};
