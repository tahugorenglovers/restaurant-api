const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const c = require('../controllers/menuController');

const CATEGORIES = ['makanan', 'minuman', 'dessert', 'snack'];
const idParam = param('id').isMongoId().withMessage('ID tidak valid');

const createRules = [
  body('name').trim().notEmpty().withMessage('Nama menu wajib diisi'),
  body('price').isFloat({ min: 0 }).withMessage('Harga harus berupa angka >= 0'),
  body('category').isIn(CATEGORIES).withMessage(`Kategori harus salah satu dari: ${CATEGORIES.join(', ')}`),
  body('description').optional().isString(),
  body('imageUrl').optional().isURL().withMessage('imageUrl harus berupa URL'),
  body('isAvailable').optional().isBoolean(),
];

const updateRules = [
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(CATEGORIES),
  body('imageUrl').optional().isURL(),
  body('isAvailable').optional().isBoolean(),
];

router.get('/', c.getMenu);
router.get('/:id', idParam, validate, c.getMenuItem);

router.post('/', protect, restrictTo('admin'), createRules, validate, c.createMenuItem);
router.patch('/:id', protect, restrictTo('admin'), idParam, updateRules, validate, c.updateMenuItem);
router.delete('/:id', protect, restrictTo('admin'), idParam, validate, c.deleteMenuItem);

module.exports = router;
