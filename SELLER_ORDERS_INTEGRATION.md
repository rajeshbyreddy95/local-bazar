# Seller Orders Integration Guide

## Overview
This guide explains how to integrate the SellerOrder tracking system with your existing order placement flow.

## Integration Points

### 1. When Order is Placed (Razorpay Payment Verification)

**File**: `/app/api/razorpay/verify` (or similar order creation endpoint)

Add the following code after successful payment verification:

```typescript
import { SellerOrder } from '@/models/SellerOrder';

// After verifying payment and creating the main Order
async function createSellerOrders(order: any, cartItems: any[]) {
  try {
    // Group cart items by seller
    const itemsBySeller = cartItems.reduce((acc: any, item: any) => {
      const seller = item.sellerId || 'default_seller';
      if (!acc[seller]) {
        acc[seller] = [];
      }
      acc[seller].push(item);
      return acc;
    }, {});

    // Create a SellerOrder for each seller
    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      for (const item of items as any[]) {
        const sellerOrder = await SellerOrder.create({
          orderId: `ORD-${order._id}`,
          buyerName: order.buyerName, // Get from user profile
          buyerEmail: order.buyerEmail, // Get from user profile
          buyerPhone: order.buyerPhone, // Get from user profile
          productName: item.itemName,
          productId: item.productId,
          productImage: item.image,
          quantity: item.quantity,
          price: item.price,
          amount: item.price * item.quantity,
          paymentId: order.razorpayPaymentId,
          paymentStatus: 'paid',
          status: 'Pending',
          sellerEmail: item.sellerEmail, // Should be stored in Product model
          shopName: item.shopName, // Should be stored in Product model
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`✅ Created SellerOrder for seller: ${item.sellerEmail}`);
      }
    }
  } catch (error: any) {
    console.error('Error creating seller orders:', error);
    // Don't fail the entire order if seller orders creation fails
    // Log it for manual review
  }
}
```

### 2. Product Model Enhancement

**File**: `/models/Product.ts`

Add these fields to store seller information:

```typescript
interface ProductDocument extends Document {
  // ... existing fields ...
  sellerEmail: string;      // Email of the seller
  shopName: string;          // Name of seller's shop
  sellerId: string;          // Unique seller identifier
  // ... rest of fields ...
}

const ProductSchema = new Schema<ProductDocument>(
  {
    // ... existing fields ...
    sellerEmail: {
      type: String,
      required: true,
      index: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
      index: true,
    },
    // ... rest of schema ...
  },
  { timestamps: true }
);
```

### 3. Order Placement Flow

When a customer places an order:

```
1. User selects products from multiple sellers
2. User completes checkout
3. Payment processed via Razorpay
4. Main Order record created
5. ✨ SellerOrder records created for each seller's items
6. Email notifications sent to sellers about new orders
```

## Seller Notification Workflow

### Option A: Immediate Notification

```typescript
// In createSellerOrders function
await notifySellerOfNewOrder(sellerEmail, sellerOrder);

async function notifySellerOfNewOrder(sellerEmail: string, order: any) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: sellerEmail,
    subject: `New Order Received - #${order.orderId}`,
    html: `
      <h2>New Order Alert!</h2>
      <p>You have received a new order from <strong>${order.buyerName}</strong></p>
      <p><strong>Order Details:</strong></p>
      <ul>
        <li>Order ID: ${order.orderId}</li>
        <li>Product: ${order.productName}</li>
        <li>Quantity: ${order.quantity}</li>
        <li>Amount: ₹${order.amount}</li>
      </ul>
      <p><strong>Buyer Contact:</strong></p>
      <p>Email: ${order.buyerEmail}</p>
      <p>Phone: ${order.buyerPhone}</p>
      <p>Login to your seller dashboard to accept this order: <a href="https://yoursite.com/seller/orders">View Orders</a></p>
    `,
  });
}
```

### Option B: Scheduled Digest Notification

```typescript
// Send seller a daily digest of all pending orders
// Run this daily at 9 AM
async function sendSellerDigest(sellerEmail: string) {
  const pendingOrders = await SellerOrder.find({
    sellerEmail: sellerEmail,
    status: 'Pending',
  });

  // Send email with list of pending orders
}
```

## Database Queries

### Find All Orders for a Seller
```javascript
db.sellerorders.find({ sellerEmail: 'seller@example.com' })
```

### Find Pending Orders
```javascript
db.sellerorders.find({ sellerEmail: 'seller@example.com', status: 'Pending' })
```

### Find Orders by Date Range
```javascript
db.sellerorders.find({
  sellerEmail: 'seller@example.com',
  createdAt: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-12-31')
  }
})
```

### Orders Report
```javascript
db.sellerorders.aggregate([
  { $match: { sellerEmail: 'seller@example.com' } },
  { $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }
  }
])
```

## Testing the Integration

### 1. Manual Testing

```bash
# Start dev server
npm run dev

# Place an order through the checkout flow

# Check MongoDB for SellerOrder records
# Verify order appears in /seller/orders dashboard

# Test order acceptance and PDF generation
```

### 2. Verify Field Mapping

Ensure these fields are passed correctly:
- ✅ buyerName
- ✅ buyerEmail
- ✅ buyerPhone
- ✅ productName
- ✅ productId
- ✅ amount
- ✅ paymentId
- ✅ sellerEmail
- ✅ shopName

## Migration: Converting Existing Orders

If you have existing orders that need to be converted to seller orders:

```typescript
// Migration script
async function migrateExistingOrders() {
  const orders = await Order.find({});

  for (const order of orders) {
    for (const item of order.items) {
      const sellerOrder = await SellerOrder.create({
        orderId: `ORD-${order._id}`,
        buyerName: order.buyerName || 'Unknown',
        buyerEmail: order.buyerEmail || 'unknown@example.com',
        buyerPhone: order.buyerPhone || 'N/A',
        productName: item.itemName,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        amount: item.price * item.quantity,
        paymentId: order.razorpayPaymentId || 'N/A',
        paymentStatus: order.paymentStatus || 'pending',
        status: order.status === 'completed' ? 'Accepted' : 'Pending',
        sellerEmail: item.sellerId || 'default@seller.com',
        shopName: item.shopName || 'Default Shop',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    }
  }

  console.log('✅ Migration completed');
}
```

## Environment Variables

Ensure these are set in `.env.local`:

```
# Email Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password

# Database
MONGO_URI=your_mongodb_connection_string

# Seller Notification Settings
SELLER_EMAIL_SUBJECT=New Order Received
SELLER_NOTIFICATION_ENABLED=true
```

## Security Considerations

1. **Seller Email Validation**: Ensure seller email matches authenticated user
2. **Order Access**: Verify seller can only see their own orders
3. **Rate Limiting**: Add rate limits on API endpoints
4. **Email Verification**: Verify seller email before sending notifications
5. **Data Validation**: Validate all input fields before creating orders

## Performance Optimization

1. **Index on sellerEmail**: Already added in schema
2. **Query Optimization**: Use `.lean()` for read-only queries
3. **Pagination**: Add pagination for large order lists
4. **Caching**: Cache seller's order count and statistics

Example optimized query:
```typescript
const orders = await SellerOrder
  .find({ sellerEmail: email })
  .sort({ createdAt: -1 })
  .limit(50)
  .lean();
```

## Troubleshooting

### Orders Not Appearing
- Check seller email matches in database
- Verify MongoDB connection
- Check if orders have status = 'Pending'

### Email Not Sending
- Verify EMAIL_USER and EMAIL_PASSWORD in .env.local
- Use Gmail App Password (not regular password)
- Check Gmail account security settings
- Review email logs in console

### PDF Generation Failed
- Ensure pdfkit is installed: `npm list pdfkit`
- Check pdfkit version compatibility
- Review console for PDF errors

---

**Last Updated**: 2024
**Status**: Ready for Integration
