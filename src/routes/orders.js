const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { ORDER_STATUSES } = require('../models/Order');
const c = require('../controllers/orderController');

const idParam = param('id').isMongoId().withMessage('ID tidak valid');

router.use(protect);

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('items harus berisi minimal 1 menu'),
    body('items.*.menuItem').isMongoId().withMessage('menuItem harus berupa ID yang valid'),
    body('items.*.quantity').isInt({ min: 1, max: 50 }).withMessage('quantity harus 1-50').toInt(),
    body('items.*.notes').optional().isString().isLength({ max: 200 }),
    body('deliveryAddress.street').trim().notEmpty().withMessage('Alamat (street) wajib diisi'),
    body('deliveryAddress.city').trim().notEmpty().withMessage('Kota wajib diisi'),
    body('deliveryAddress.postalCode').optional().isString(),
    body('deliveryAddress.notes').optional().isString().isLength({ max: 200 }),
    body('phone').optional().trim().isLength({ min: 8, max: 20 }).withMessage('Nomor telepon tidak valid'),
    body('paymentMethod').optional().isIn(['cash', 'transfer', 'ewallet']),
  ],
  validate,
  c.createOrder
);

router.get('/', c.getOrders);
router.get('/stats/summary', restrictTo('admin'), c.getStats);
router.get('/:id', idParam, validate, c.getOrder);

router.patch(
  '/:id/status',
  restrictTo('admin'),
  idParam,
  body('status').isIn(ORDER_STATUSES).withMessage(`status harus salah satu dari: ${ORDER_STATUSES.join(', ')}`),
  validate,
  c.updateOrderStatus
);

router.patch('/:id/cancel', idParam, validate, c.cancelOrder);

module.exports = router;
