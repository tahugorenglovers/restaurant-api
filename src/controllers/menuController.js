const MenuItem = require('../models/MenuItem');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getMenu = asyncHandler(async (req, res) => {
  const { category, search, available, minPrice, maxPrice, sort = 'name' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

  const filter = {};
  if (category) filter.category = category;
  if (available !== undefined) filter.isAvailable = available === 'true';
  if (search) filter.$text = { $search: String(search) };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const allowedSort = ['name', '-name', 'price', '-price', '-createdAt'];
  const sortBy = allowedSort.includes(sort) ? sort : 'name';

  const [items, total] = await Promise.all([
    MenuItem.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit),
    MenuItem.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: items.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: items,
  });
});

exports.getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new AppError('Menu tidak ditemukan', 404);
  res.json({ success: true, data: item });
});

exports.createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, imageUrl, isAvailable } = req.body;
  const item = await MenuItem.create({ name, description, price, category, imageUrl, isAvailable });
  res.status(201).json({ success: true, data: item });
});

exports.updateMenuItem = asyncHandler(async (req, res) => {
  const fields = ['name', 'description', 'price', 'category', 'imageUrl', 'isAvailable'];
  const updates = {};
  fields.forEach((f) => req.body[f] !== undefined && (updates[f] = req.body[f]));

  const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!item) throw new AppError('Menu tidak ditemukan', 404);
  res.json({ success: true, data: item });
});

exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Menu tidak ditemukan', 404);
  res.json({ success: true, message: 'Menu berhasil dihapus' });
});
