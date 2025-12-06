const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  _id: false,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  itemName: String,
  price: Number,
  discount: Number,
  images: [{ url: String }],
  quantity: { type: Number, default: 1 }
});

const CartSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // primary key
  items: [CartItemSchema]
}, { timestamps: true });

module.exports = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
