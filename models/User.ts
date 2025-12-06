import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AddressSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  lat: Number,
  lng: Number,
  fullAddress: String,
  pincode: String,
  street: String,
  village: String,
  mandal: String,
  district: String,
  state: String,
  country: String,
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ['buyer', 'seller'],
      default: 'buyer',
    },
    shopName: String,
    shopAddress: String,
    landmarks: String,
    pincode: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Single address (for backward compatibility)
    address: {
      lat: Number,
      lng: Number,
      fullAddress: String,
      pincode: String,
      street: String,
      village: String,
      mandal: String,
      district: String,
      state: String,
      country: String,
    },
    // Multiple addresses
    addresses: [AddressSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
