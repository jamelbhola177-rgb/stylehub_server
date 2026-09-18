import './config/env.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const products = [
  {
    name: 'Classic White Linen Shirt',
    description: 'Premium breathable linen shirt perfect for summer. Relaxed fit with button-down collar.',
    price: 1299,
    comparePrice: 1799,
    category: 'men',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b56?w=800'],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Beige', hex: '#F5F5DC' }],
    sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 30 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 15 }],
    stock: 90,
    featured: true,
    tags: ['summer', 'linen', 'casual'],
  },
  {
    name: 'Slim Fit Denim Jeans',
    description: 'Stretch denim jeans with modern slim fit. Comfortable all-day wear with premium finish.',
    price: 1899,
    comparePrice: 2499,
    category: 'men',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
    colors: [{ name: 'Indigo', hex: '#3F5274' }, { name: 'Black', hex: '#1a1a1a' }],
    sizes: [{ size: '28', stock: 15 }, { size: '30', stock: 25 }, { size: '32', stock: 30 }, { size: '34', stock: 20 }],
    stock: 90,
    featured: true,
    tags: ['denim', 'jeans'],
  },
  {
    name: 'Floral Summer Dress',
    description: 'Elegant floral print midi dress with flowing silhouette. Perfect for brunches and evening outings.',
    price: 2499,
    comparePrice: 3299,
    category: 'women',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92d1?w=800'],
    colors: [{ name: 'Floral Pink', hex: '#FFB6C1' }, { name: 'Floral Blue', hex: '#87CEEB' }],
    sizes: [{ size: 'XS', stock: 10 }, { size: 'S', stock: 20 }, { size: 'M', stock: 25 }, { size: 'L', stock: 15 }],
    stock: 70,
    featured: true,
    tags: ['dress', 'floral', 'summer'],
  },
  {
    name: 'Cashmere Blend Sweater',
    description: 'Luxuriously soft cashmere blend sweater. Timeless crew neck design for cold weather elegance.',
    price: 3499,
    comparePrice: 4499,
    category: 'women',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
    colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Grey', hex: '#808080' }, { name: 'Navy', hex: '#001f3f' }],
    sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 20 }, { size: 'L', stock: 18 }],
    stock: 53,
    featured: true,
    tags: ['sweater', 'winter', 'cashmere'],
  },
  {
    name: 'Kids Colorblock Hoodie',
    description: 'Fun and cozy colorblock hoodie for kids. Soft cotton blend with kangaroo pocket.',
    price: 899,
    comparePrice: 1199,
    category: 'kids',
    brand: 'StyleHub Kids',
    images: ['https://images.unsplash.com/photo-1519238263530-99bdd884df10?w=800'],
    colors: [{ name: 'Multi', hex: '#FF6B6B' }],
    sizes: [{ size: '4-5Y', stock: 20 }, { size: '6-7Y', stock: 25 }, { size: '8-9Y', stock: 20 }],
    stock: 65,
    featured: false,
    tags: ['kids', 'hoodie'],
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Genuine leather crossbody bag with adjustable strap. Compact yet spacious interior.',
    price: 2199,
    comparePrice: 2999,
    category: 'accessories',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
    colors: [{ name: 'Tan', hex: '#D2B48C' }, { name: 'Black', hex: '#1a1a1a' }],
    sizes: [{ size: 'One Size', stock: 40 }],
    stock: 40,
    featured: true,
    tags: ['bag', 'leather'],
  },
  {
    name: 'Classic White Sneakers',
    description: 'Minimalist white leather sneakers. Versatile design pairs with any outfit.',
    price: 2799,
    comparePrice: 3499,
    category: 'footwear',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'],
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    sizes: [{ size: '7', stock: 10 }, { size: '8', stock: 15 }, { size: '9', stock: 20 }, { size: '10', stock: 15 }, { size: '11', stock: 10 }],
    stock: 70,
    featured: true,
    tags: ['sneakers', 'footwear'],
  },
  {
    name: 'Athletic Running Shoes',
    description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper.',
    price: 3299,
    comparePrice: 3999,
    category: 'footwear',
    brand: 'StyleHub Sport',
    images: ['https://images.unsplash.com/photo-1606107557195-0o7404b5b4c3?w=800'],
    colors: [{ name: 'Black/Red', hex: '#1a1a1a' }, { name: 'Blue/White', hex: '#0066CC' }],
    sizes: [{ size: '7', stock: 12 }, { size: '8', stock: 18 }, { size: '9', stock: 22 }, { size: '10', stock: 16 }],
    stock: 68,
    featured: false,
    tags: ['running', 'sport'],
  },
  {
    name: 'Silk Scarf Collection',
    description: 'Premium silk scarf with hand-rolled edges. Adds elegance to any ensemble.',
    price: 1499,
    comparePrice: 1999,
    category: 'accessories',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800'],
    colors: [{ name: 'Gold', hex: '#FFD700' }, { name: 'Emerald', hex: '#50C878' }],
    sizes: [{ size: 'One Size', stock: 30 }],
    stock: 30,
    featured: false,
    tags: ['scarf', 'silk'],
  },
  {
    name: 'Sale: Oversized Blazer',
    description: 'Trendy oversized blazer at an unbeatable price. Structured shoulders, single button closure.',
    price: 1599,
    comparePrice: 3999,
    category: 'sale',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'],
    colors: [{ name: 'Black', hex: '#1a1a1a' }, { name: 'Beige', hex: '#F5F5DC' }],
    sizes: [{ size: 'S', stock: 8 }, { size: 'M', stock: 12 }, { size: 'L', stock: 10 }],
    stock: 30,
    featured: true,
    tags: ['blazer', 'sale'],
  },
  {
    name: 'Striped Polo T-Shirt',
    description: 'Classic striped polo in premium pique cotton. Perfect for smart-casual occasions.',
    price: 999,
    comparePrice: 1399,
    category: 'men',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800'],
    colors: [{ name: 'Navy/White', hex: '#001f3f' }, { name: 'Green/White', hex: '#228B22' }],
    sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 30 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 15 }],
    stock: 90,
    featured: false,
    tags: ['polo', 'casual'],
  },
  {
    name: 'High-Waist Wide Leg Pants',
    description: 'Chic high-waist wide leg pants in flowing fabric. Office to evening ready.',
    price: 1799,
    comparePrice: 2299,
    category: 'women',
    brand: 'StyleHub',
    images: ['https://images.unsplash.com/photo-1594633312681-425a7b956cc9?w=800'],
    colors: [{ name: 'Black', hex: '#1a1a1a' }, { name: 'Cream', hex: '#FFFDD0' }],
    sizes: [{ size: 'XS', stock: 12 }, { size: 'S', stock: 18 }, { size: 'M', stock: 22 }, { size: 'L', stock: 14 }],
    stock: 66,
    featured: false,
    tags: ['pants', 'office'],
  },
];

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const buildVariants = (product) => {
  const colors = product.colors?.length ? product.colors : [{ name: 'Default', hex: '#1c1917' }];
  const sizes = product.sizes?.length ? product.sizes : [{ size: 'One Size', stock: product.stock || 10 }];
  const colorCount = colors.length;

  return colors.map((color, index) => ({
    color,
    images: product.images?.length ? product.images : [],
    sizes: sizes.map((s) => ({
      size: s.size,
      stock: Math.max(1, Math.floor(s.stock / colorCount)),
    })),
  }));
};

const seed = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();

    await User.create({
      name: 'Admin User',
      email: 'admin@stylehub.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210',
    });

    await User.create({
      name: 'Demo User',
      email: 'user@stylehub.com',
      password: 'user123',
      phone: '9876543211',
    });

    const productsWithSlugs = products.map((p) => {
      const variants = buildVariants(p);
      const stock = variants.reduce(
        (total, v) => total + v.sizes.reduce((sum, s) => sum + s.stock, 0),
        0
      );
      return {
        ...p,
        slug: slugify(p.name),
        variants,
        colors: variants.map((v) => v.color),
        images: variants.flatMap((v) => v.images),
        stock,
      };
    });
    await Product.insertMany(productsWithSlugs);
    console.log('Database seeded successfully!');
    console.log('Admin: admin@stylehub.com / admin123');
    console.log('User:  user@stylehub.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
