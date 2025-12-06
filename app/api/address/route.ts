import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import mongoose from 'mongoose';
import { cacheGet, cacheSet, cacheDelete, CACHE_KEYS } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      console.log('No user authenticated');
      return Response.json({ addresses: [] }, { status: 200 });
    }

    // Check cache first
    const cacheKey = CACHE_KEYS.USER_ADDRESSES(user.email);
    const cachedAddresses = await cacheGet(cacheKey);
    if (cachedAddresses) {
      return Response.json(cachedAddresses, { status: 200 });
    }

    console.log('Fetching addresses for user:', user.email);
    await connectDB();
    const dbUser = await User.findOne({ email: user.email });
    
    if (!dbUser) {
      console.log('User not found in database');
      return Response.json({ addresses: [] }, { status: 200 });
    }

    console.log('User found. Addresses:', dbUser.addresses);
    console.log('Address count:', dbUser.addresses?.length || 0);

    const response = { 
      addresses: dbUser.addresses || [],
      defaultAddress: dbUser.address || null 
    };

    // Cache for 15 minutes
    await cacheSet(cacheKey, response, 900);

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return Response.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lat, lng, address, pincode, street, village, mandal, district, state, country } = body;

    console.log('Saving address for user:', user.email);
    console.log('Address data:', { lat, lng, address, pincode, street, village, mandal, district, state, country });

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      lat,
      lng,
      fullAddress: address,
      pincode,
      street,
      village,
      mandal,
      district,
      state,
      country,
      isDefault: false,
      createdAt: new Date(),
    };

    // First, ensure the user has an addresses array
    let dbUser = await User.findOne({ email: user.email });
    if (!dbUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize addresses array if it doesn't exist
    if (!dbUser.addresses) {
      dbUser.addresses = [];
    }

    // Add the new address
    dbUser.addresses.push(newAddress);
    
    // Also set as default address for backward compatibility
    dbUser.address = {
      lat,
      lng,
      fullAddress: address,
      pincode,
      street,
      village,
      mandal,
      district,
      state,
      country,
    };

    await dbUser.save();

    console.log('Updated user addresses:', dbUser.addresses);
    console.log('Address count:', dbUser.addresses.length);

    // Clear address cache
    await cacheDelete(CACHE_KEYS.USER_ADDRESSES(user.email));

    return Response.json({ success: true, address: newAddress, totalAddresses: dbUser.addresses.length }, { status: 200 });
  } catch (error) {
    console.error('Error saving address:', error);
    return Response.json({ error: 'Failed to save address' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { addressId, lat, lng, address, pincode, street, village, mandal, district, state, country } = body;

    const updatedUser = await User.findOneAndUpdate(
      { email: user.email, 'addresses._id': addressId },
      {
        $set: {
          'addresses.$.lat': lat,
          'addresses.$.lng': lng,
          'addresses.$.fullAddress': address,
          'addresses.$.pincode': pincode,
          'addresses.$.street': street,
          'addresses.$.village': village,
          'addresses.$.mandal': mandal,
          'addresses.$.district': district,
          'addresses.$.state': state,
          'addresses.$.country': country,
        },
      },
      { new: true }
    );

    // Clear cache after update
    await cacheDelete(CACHE_KEYS.USER_ADDRESSES(user.email));
    console.log(`🗑️  Cache cleared (Address): ${CACHE_KEYS.USER_ADDRESSES(user.email)}`);

    return Response.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating address:', error);
    return Response.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return Response.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );

    // Clear cache after deletion
    await cacheDelete(CACHE_KEYS.USER_ADDRESSES(user.email));
    console.log(`🗑️  Cache cleared (Address): ${CACHE_KEYS.USER_ADDRESSES(user.email)}`);

    return Response.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error deleting address:', error);
    return Response.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
