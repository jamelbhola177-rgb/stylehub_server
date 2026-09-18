import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { getVariantStock, decrementVariantStock } from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    if (!orderItems?.length) {
      return res.status(400).json({ message: 'No order items' });
    }

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      const available = getVariantStock(product, item.color || '', item.size || '');
      if (available < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}${item.color ? ` (${item.color}` : ''}${item.size ? `, ${item.size})` : item.color ? ')' : ''}`,
        });
      }
    }

    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.05);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        await decrementVariantStock(product, item.color || '', item.size || '', item.quantity);
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(order);
});

router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ orders, page: Number(page), pages: Math.ceil(total / Number(limit)), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status || order.status;
    order.trackingNumber = req.body.trackingNumber ?? order.trackingNumber;
    order.notes = req.body.notes ?? order.notes;

    if (req.body.status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    if (req.body.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/stats/summary', protect, admin, async (_req, res) => {
  const [totalOrders, pendingOrders, totalRevenue, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
  ]);
  res.json({
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    recentOrders,
  });
});

export default router;
