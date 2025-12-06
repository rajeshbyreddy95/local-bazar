import mongoose, { Schema, Document } from 'mongoose';

interface OrderItem {
  productId: string;
  itemName: string;
  price: number;
  discount: number;
  quantity: number;
  sellerId: string;
  sellerEmail: string;
  sellerName: string;
}

interface OrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: OrderItem[];
  address: {
    street: string;
    village: string;
    mandal: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
    fullAddress: string;
    lat?: number;
    lng?: number;
  } | null;
  createdAt: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<OrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: String,
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    items: [
      {
        productId: String,
        itemName: String,
        price: Number,
        discount: Number,
        quantity: Number,
        sellerId: String,
        sellerEmail: String,
        sellerName: String,
      },
    ],
    address: {
      street: String,
      village: String,
      mandal: String,
      district: String,
      state: String,
      pincode: String,
      country: String,
      fullAddress: String,
      lat: Number,
      lng: Number,
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

export const Order = mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);
