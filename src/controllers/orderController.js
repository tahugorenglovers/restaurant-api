const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { STATUS_TRANSITIONS, ORDER_STATUSES } = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const isAdmin = (user) => user.role === 'admin';

// POST /api/orders — harga SELALU dihitung dari database, bukan dari client
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryAddress, phone, paymentMethod } = req.body;

  // Gabungkan item duplikat
  const qtyById = new Map();
  const notesById = new Map();
  for (const it of items) {
    qtyById.set(it.menuItem, (qtyById.get(it.menuItem) || 0) + it.quantity);
    if (it.notes) notesById.set(it.menuItem, it.notes);
  }

  const ids = [...qtyById.keys()];
  const menuItems = await MenuItem.find({ _id: { $in: ids } });
  if (menuItems.length !== ids.length) throw new AppError('Ada menu yang tidak ditemukan', 404);

  const unavailable = menuItems.filter((m) => !m.isAvailable).map((m) => m.name);
  if (unavailable.length) throw new AppError(`Menu tidak tersedia: ${unavailable.join(', ')}`, 400);

  const orderItems = menuItems.map((m) => ({
    menuItem: m._id,
    name: m.name,
    price: m.price,
    quantity: qtyById.get(m._id.toString()),
    notes: notesById.get(m._id.toString()),
  }));

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = Number(process.env.DELIVERY_FEE ?? 10000);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    deliveryAddress,
    phone: phone || req.user.phone,
    paymentMethod,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    statusHistory: [{ status: 'pending' }],
  });

  res.status(201).json({ success: true, data: order });
});

// GET /api/orders — customer: milik sendiri; admin: semua
exports.getOrders = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

  const filter = isAdmin(req.user) ? {} : { user: req.user._id };
  if (req.query.status) {
    if (!ORDER_STATUSES.includes(req.query.status)) throw new AppError('Status tidak valid', 400);
    filter.status = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: orders.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: orders,
  });
});

// GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw new AppError('Order tidak ditemukan', 404);
  if (!isAdmin(req.user) && order.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('Order tidak ditemukan', 404); // jangan bocorkan keberadaan order orang lain
  }
  res.json({ success: true, data: order });
});

// PATCH /api/orders/:id/status — admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order tidak ditemukan', 404);

  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed.includes(status)) {
    throw new AppError(
      `Tidak bisa mengubah status dari '${order.status}' ke '${status}'. Yang diizinkan: ${allowed.join(', ') || '(tidak ada)'}`,
      400
    );
  }

  order.status = status;
  order.statusHistory.push({ status });
  await order.save();
  res.json({ success: true, data: order });
});

// PATCH /api/orders/:id/cancel — customer (hanya saat pending) atau admin
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || (!isAdmin(req.user) && order.user.toString() !== req.user._id.toString())) {
    throw new AppError('Order tidak ditemukan', 404);
  }

  const canCancel = isAdmin(req.user)
    ? STATUS_TRANSITIONS[order.status].includes('cancelled')
    : order.status === 'pending';
  if (!canCancel) throw new AppError(`Order dengan status '${order.status}' tidak dapat dibatalkan`, 400);

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled' });
  await order.save();
  res.json({ success: true, data: order });
});

// GET /api/orders/stats/summary — admin
exports.getStats = asyncHandler(async (req, res) => {
  const [byStatus, revenue] = await Promise.all([
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]),
  ]);
  res.json({
    success: true,
    data: {
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      deliveredOrders: revenue[0]?.orders || 0,
      totalRevenue: revenue[0]?.totalRevenue || 0,
    },
  });
});
