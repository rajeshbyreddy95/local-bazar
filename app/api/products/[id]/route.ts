import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { getAuthUser } from '@/lib/auth';
import { deleteMultipleImagesFromCloudinary, uploadImageToCloudinary } from '@/lib/cloudinary';
import mongoose from 'mongoose';
import { cacheGet, cacheSet, cacheDelete, CACHE_KEYS } from '@/lib/redis';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

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
        { error: 'Only sellers can delete products.' },
        { status: 403 }
      );
    }

    // Find product first to get images
    const product = await Product.findOne({
      _id: id,
      sellerEmail: user.email,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or you do not have permission to delete it.' },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map((img: any) => img.publicId).filter(Boolean);
      if (publicIds.length > 0) {
        await deleteMultipleImagesFromCloudinary(publicIds);
      }
    }

    // Delete product from database
    await Product.findOneAndDelete({
      _id: id,
      sellerEmail: user.email,
    });

    // Clear from cache
    await cacheDelete(CACHE_KEYS.PRODUCT(id));

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check Redis cache first
    const cacheKey = CACHE_KEYS.PRODUCT(id);
    const cachedProduct = await cacheGet(cacheKey);
    
    if (cachedProduct) {
      return NextResponse.json(
        {
          success: true,
          product: cachedProduct,
          source: 'cache',
        },
        { status: 200 }
      );
    }

    // If not in cache, fetch from database
    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Cache for 1 hour (3600 seconds)
    await cacheSet(cacheKey, product, 3600);

    return NextResponse.json(
      {
        success: true,
        product,
        source: 'database',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

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
        { error: 'Only sellers can update products.' },
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
      existingImages,
    } = body;

    // Find product and verify ownership
    const product = await Product.findOne({
      _id: id,
      sellerEmail: user.email,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or you do not have permission to update it.' },
        { status: 404 }
      );
    }

    // Upload new images to Cloudinary
    let newUploadedImages = [];
    if (images && images.length > 0) {
      newUploadedImages = await Promise.all(
        images.map((imageData: string) => uploadImageToCloudinary(imageData))
      );
    }

    // Combine existing and new images
    const updatedImages = [
      ...product.images.filter((img: any) =>
        existingImages && existingImages.length > 0
          ? existingImages.some((url: string) => url === img.url)
          : false
      ),
      ...newUploadedImages,
    ];

    // Delete images that were removed
    const imagesToDelete = product.images.filter((img: any) =>
      !existingImages || existingImages.length === 0
        ? true
        : !existingImages.some((url: string) => url === img.url)
    );

    if (imagesToDelete.length > 0) {
      const publicIds = imagesToDelete.map((img: any) => img.publicId).filter(Boolean);
      if (publicIds.length > 0) {
        await deleteMultipleImagesFromCloudinary(publicIds);
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        itemName,
        category,
        description,
        price,
        discount: discount || 0,
        stock,
        images: updatedImages,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    // Clear from cache
    await cacheDelete(CACHE_KEYS.PRODUCT(id));

    return NextResponse.json(
      {
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}
