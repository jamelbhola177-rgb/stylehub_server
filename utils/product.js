export function normalizeVariant(variant) {
  return {
    color: {
      name: String(variant.color?.name || '').trim(),
      hex: variant.color?.hex || '#1c1917',
    },
    images: (variant.images || []).filter(Boolean),
    sizes: (variant.sizes || [])
      .map((s) => ({
        size: String(s.size || '').trim(),
        stock: Math.max(0, Number(s.stock) || 0),
      }))
      .filter((s) => s.size),
  };
}

export function normalizeVariants(variants = []) {
  return variants.map(normalizeVariant).filter((v) => v.color.name);
}

export function buildVariantsFromLegacy(product) {
  const colors = product.colors?.length
    ? product.colors
    : [{ name: 'Default', hex: '#1c1917' }];
  const sizes = product.sizes?.length
    ? product.sizes
    : [{ size: 'One Size', stock: product.stock || 0 }];
  const images = (product.images || []).filter(Boolean);
  const colorCount = colors.length;

  return colors.map((color) => ({
    color: {
      name: color.name,
      hex: color.hex || '#1c1917',
    },
    images: images.length ? [...images] : [],
    sizes: sizes.map((s) => ({
      size: s.size,
      stock: colorCount > 1
        ? Math.max(0, Math.floor(Number(s.stock) / colorCount))
        : Math.max(0, Number(s.stock) || 0),
    })),
  }));
}

export function normalizeProductPayload(body) {
  let variants = normalizeVariants(body.variants);

  if (!variants.length && (body.colors?.length || body.images?.length)) {
    variants = normalizeVariants(buildVariantsFromLegacy(body));
  }

  variants = variants.filter((v) => v.images.length && v.sizes.length);

  if (!variants.length) {
    const error = new Error('Each color variant needs a name, at least one image, and valid sizes');
    error.status = 400;
    throw error;
  }

  const stock = variants.reduce(
    (total, v) => total + v.sizes.reduce((sum, s) => sum + s.stock, 0),
    0
  );

  return {
    name: body.name,
    description: body.description,
    price: Number(body.price),
    comparePrice: Number(body.comparePrice) || 0,
    category: body.category,
    brand: body.brand || 'StyleHub',
    subcategory: body.subcategory || '',
    variants,
    featured: Boolean(body.featured),
    isActive: body.isActive !== false,
    tags: body.tags || [],
    stock,
  };
}
