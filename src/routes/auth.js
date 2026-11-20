const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { register, login, me } = require('../controllers/authController');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('phone').optional().trim().isLength({ min: 8, max: 20 }).withMessage('Nomor telepon tidak valid'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
    body('password').notEmpty().withMessage('Password wajib diisi'),
  ],
  validate,
  login
);

router.get('/me', protect, me);

module.exports = router;
