import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const variantSizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, default: 0, min: 0 },
});

const variantSchema = new mongoose.Schema({
  color: {
    name: { type: String, required: true },
    hex: { type: String, default: '#000000' },
  },
  images: [{ type: String }],
  sizes: [variantSizeSchema],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0 },
    category: {
      type: String,
      required: true,
      enum: ['men', 'women', 'kids', 'accessories', 'footwear', 'sale'],
    },
    subcategory: { type: String, default: '' },
    brand: { type: String, default: 'StyleHub' },
    variants: [variantSchema],
    images: [{ type: String }],
    colors: [{ name: String, hex: String }],
    sizes: [{ size: String, stock: { type: Number, default: 0 } }],
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [String],
  },
  { timestamps: true }
);

function syncLegacyFields(doc) {
  if (!doc.variants?.length) return;

  doc.colors = doc.variants.map((v) => v.color);
  doc.images = doc.variants.flatMap((v) => v.images || []).filter(Boolean);
  if (!doc.images.length && doc.variants[0]?.images?.length) {
    doc.images = doc.variants[0].images;
  }

  const sizeMap = new Map();
  doc.variants.forEach((v) => {
    (v.sizes || []).forEach((s) => {
      sizeMap.set(s.size, (sizeMap.get(s.size) || 0) + s.stock);
    });
  });
  doc.sizes = Array.from(sizeMap, ([size, stock]) => ({ size, stock }));
  doc.stock = doc.variants.reduce(
    (total, v) => total + (v.sizes || []).reduce((sum, s) => sum + s.stock, 0),
    0
  );
}

productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  syncLegacyFields(this);
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const variants = update?.variants || update?.$set?.variants;
  if (variants?.length) {
    const colors = variants.map((v) => v.color);
    const images = variants.flatMap((v) => v.images || []).filter(Boolean);
    const sizeMap = new Map();
    variants.forEach((v) => {
      (v.sizes || []).forEach((s) => {
        sizeMap.set(s.size, (sizeMap.get(s.size) || 0) + s.stock);
      });
    });
    const sizes = Array.from(sizeMap, ([size, stock]) => ({ size, stock }));
    const stock = variants.reduce(
      (total, v) => total + (v.sizes || []).reduce((sum, s) => sum + s.stock, 0),
      0
    );
    if (update.$set) {
      update.$set.colors = colors;
      update.$set.images = images.length ? images : variants[0]?.images || [];
      update.$set.sizes = sizes;
      update.$set.stock = stock;
    } else {
      update.colors = colors;
      update.images = images.length ? images : variants[0]?.images || [];
      update.sizes = sizes;
      update.stock = stock;
    }
  }
  next();
});

export const getVariantStock = (product, colorName, sizeName) => {
  if (product.variants?.length) {
    const variant = product.variants.find((v) => v.color.name === colorName);
    if (variant) {
      const sizeEntry = variant.sizes?.find((s) => s.size === sizeName);
      return sizeEntry?.stock ?? 0;
    }
    return 0;
  }
  const sizeEntry = product.sizes?.find((s) => s.size === sizeName);
  return sizeEntry?.stock ?? product.stock ?? 0;
};

export const decrementVariantStock = async (product, colorName, sizeName, quantity) => {
  if (product.variants?.length) {
    const variant = product.variants.find((v) => v.color.name === colorName);
    if (!variant) throw new Error(`Color "${colorName}" not available`);
    const sizeEntry = variant.sizes?.find((s) => s.size === sizeName);
    if (!sizeEntry) throw new Error(`Size "${sizeName}" not available for ${colorName}`);
    if (sizeEntry.stock < quantity) throw new Error(`Insufficient stock for ${product.name} (${colorName}, ${sizeName})`);
    sizeEntry.stock -= quantity;
    syncLegacyFields(product);
    await product.save();
    return;
  }
  if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
  product.stock -= quantity;
  await product.save();
};

const Product = mongoose.model('Product', productSchema);
export default Product;
