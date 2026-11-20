const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  // role selalu 'customer' saat registrasi publik (cegah privilege escalation)
  const user = await User.create({ name, email, password, phone, role: 'customer' });
  res.status(201).json({ success: true, token: signToken(user._id), data: user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email/password salah', 401);
  }
  res.json({ success: true, token: signToken(user._id), data: user });
});

exports.me = (req, res) => res.json({ success: true, data: req.user });
