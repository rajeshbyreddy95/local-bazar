import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { cacheGet, cacheSet, CACHE_KEYS } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering and searching
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Create cache key based on filters
    const cacheKey = `products:explore:${sortBy}:${category}:${search}:${minPrice}:${maxPrice}`;
    
    // Check cache first
    const cachedProducts = await cacheGet(cacheKey);
    if (cachedProducts) {
      return NextResponse.json(
        {
          success: true,
          products: cachedProducts,
          source: 'cache',
        },
        { status: 200 }
      );
    }

    await connectDB();

    // Build filter object
    const filter: any = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }

    // Build sort object
    let sortOptions: any = {};
    if (sortBy === 'price-low') {
      sortOptions.price = 1;
    } else if (sortBy === 'price-high') {
      sortOptions.price = -1;
    } else if (sortBy === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sortBy === 'popular') {
      sortOptions.views = -1;
    }

    // Fetch products
    const products = await Product.find(filter)
      .sort(sortOptions)
      .limit(100);

    // Cache for 30 minutes (1800 seconds)
    await cacheSet(cacheKey, products, 1800);

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
        source: 'database',
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
