import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    seller: {
      type: String,
      required: true,
      index: true,
    },
    sellerEmail: {
      type: String,
      required: true,
      index: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Electronics',
        'Clothing',
        'Home & Kitchen',
        'Books',
        'Sports',
        'Beauty',
        'Toys',
        'Food & Beverages',
        'Furniture',
        'Automotive',
        'Other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        url: String,
        publicId: String, // For Cloudinary or similar
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
ProductSchema.index({ sellerEmail: 1, category: 1 });
ProductSchema.index({ itemName: 'text', description: 'text' });

// Delete existing model if it exists to prevent schema conflicts
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export const Product = mongoose.model('Product', ProductSchema);
