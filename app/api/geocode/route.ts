export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return Response.json({ error: 'Missing lat or lng' }, { status: 400 });
  }

  try {
    // Try primary source: Nominatim (OpenStreetMap)
    const response = await Promise.race([
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'LocalBazar/1.0',
          },
          signal: AbortSignal.timeout(8000),
        }
      ),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      ),
    ]) as Response;

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract address details
    const address = data.address || {};
    
    return Response.json({
      display_name: data.display_name || 'Location',
      address: {
        street: address.road || address.street || '',
        village: address.village || address.city || address.town || '',
        mandal: address.county || '',
        district: address.district || '',
        state: address.state || address.province || '',
        pincode: address.postcode || '',
        country: address.country || 'India',
      },
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Fallback: return basic location info with coordinates
    return Response.json({
      display_name: `Location (${lat}, ${lng})`,
      address: {
        street: '',
        village: '',
        mandal: '',
        district: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    }, { status: 200 });
  }
}

