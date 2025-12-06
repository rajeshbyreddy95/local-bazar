import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { getAuthUser } from '@/lib/auth';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get authenticated user
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    if (user.userType !== 'seller') {
      return NextResponse.json(
        { error: 'Only sellers can add products.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      itemName,
      category,
      description,
      price,
      discount,
      stock,
      images,
    } = body;

    // Validation
    if (!itemName || !category || !description || !price || !stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      images.map((imageData: string) => uploadImageToCloudinary(imageData))
    );

    // Create product
    const product = new Product({
      seller: user.email,
      sellerEmail: user.email,
      shopName: user.shopName,
      itemName,
      category,
      description,
      price,
      discount: discount || 0,
      stock,
      images: uploadedImages,
    });

    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Product added successfully',
        product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add product' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get authenticated user
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    if (user.userType !== 'seller') {
      return NextResponse.json(
        { error: 'Only sellers can view their products.' },
        { status: 403 }
      );
    }

    // Get all products for the seller
    const products = await Product.find({ sellerEmail: user.email }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      {
        success: true,
        products,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
