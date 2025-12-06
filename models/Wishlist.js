const mongoose = require('mongoose');

const WishlistItemSchema = new mongoose.Schema({
  _id: false,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  itemName: String,
  price: Number,
  discount: Number,
  images: [{ url: String }]
});

const WishlistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // primary key
  items: [WishlistItemSchema]
}, { timestamps: true });

module.exports = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
