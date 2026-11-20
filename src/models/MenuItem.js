const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['makanan', 'minuman', 'dessert', 'snack'],
      index: true,
    },
    imageUrl: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

menuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
