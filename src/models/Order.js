const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

// Alur status yang diizinkan
const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true }, // snapshot nama saat order
    price: { type: Number, required: true }, // snapshot harga saat order
    quantity: { type: Number, required: true, min: 1, max: 50 },
    notes: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    deliveryAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, trim: true },
      notes: { type: String, trim: true, maxlength: 200 },
    },
    phone: { type: String, required: true, trim: true },
    paymentMethod: { type: String, enum: ['cash', 'transfer', 'ewallet'], default: 'cash' },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${rand}`;
  }
  next();
});

orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.STATUS_TRANSITIONS = STATUS_TRANSITIONS;
