"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number, address: string, details: AddressDetails) => void;
}

interface AddressDetails {
  pincode?: string;
  street?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
}

export default function LeafletMap({ lat, lng, onLocationChange }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mapInitialized = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<{ lat: number; lng: number } | null>(null);

  // Reverse geocode using backend API (which calls Nominatim)
  const getAddress = useCallback(async (latitude: number, longitude: number) => {
    // Skip if we already made this exact request recently
    if (
      lastRequestRef.current &&
      Math.abs(lastRequestRef.current.lat - latitude) < 0.00001 &&
      Math.abs(lastRequestRef.current.lng - longitude) < 0.00001
    ) {
      console.log('Skipping duplicate geocoding request');
      return { address: '', details: {} };
    }

    lastRequestRef.current = { lat: latitude, lng: longitude };
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/geocode?lat=${latitude}&lng=${longitude}`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      if (data.display_name && data.address) {
        setAddress(data.display_name);
        
        // Extract address details with comprehensive fallback chains
        const addr = data.address;
        let details: AddressDetails = {
          pincode: addr.postcode || '',
          street: addr.road || addr.street || addr.path || addr.pedestrian || addr.house_number || '',
          village: addr.village || addr.hamlet || addr.neighbourhood || addr.town || addr.city_village || '',
          mandal: addr.county || addr.district || addr.suburb || addr.municipality || '',
          district: addr.state_district || addr.city_district || addr.region || '',
          state: addr.state || '',
        };
        
        // Parse display_name to fill missing fields
        if (data.display_name) {
          const parts = data.display_name.split(',').map((p: string) => p.trim());
          if (!details.street && parts.length > 0) {
            details.street = parts[0];
          }
          if (!details.village && parts.length > 1) {
            details.village = parts[1];
          }
        }
        
        console.log('Address fetched successfully:', details);
        setIsLoading(false);
        return { address: data.display_name, details };
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setIsLoading(false);
      // Return fallback with coordinates
      return { address: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, details: {} };
    }
  }, []);

  // Debounced version of getAddress to prevent excessive requests
  const debouncedGetAddress = useCallback((latitude: number, longitude: number) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      getAddress(latitude, longitude).then((result) => {
        if (result.address) {
          onLocationChange(latitude, longitude, result.address, result.details);
        }
      });
    }, 500); // 500ms debounce
  }, [getAddress, onLocationChange]);

  useEffect(() => {
    if (!mapRef.current || mapInitialized.current) return;
    mapInitialized.current = true;

    // Initialize map only once
    map.current = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([lat, lng], 15);

    // Add light-themed OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 2,
      attribution: '© OpenStreetMap contributors',
      crossOrigin: 'anonymous',
    }).addTo(map.current);

    // Add draggable marker with custom blue icon
    const blueIcon = L.icon({
      iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234285F4" width="32" height="42"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.51 3.64 10.74 8.5 12.37.5.14 1 .14 1.5 0C18.36 22.74 22 17.51 22 12c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5z"/></svg>',
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -35],
      className: 'drop-shadow-lg',
    });

    marker.current = L.marker([lat, lng], { draggable: true, icon: blueIcon })
      .addTo(map.current)
      .bindPopup('🎯 Drag to select location');

    // Add blue dot for current location
    L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: '#4285F4',
      color: '#1a73e8',
      weight: 3,
      opacity: 0.9,
      fillOpacity: 0.4,
      className: 'drop-shadow-lg',
    }).addTo(map.current);

    // Handle marker drag with debouncing
    marker.current.on('dragend', () => {
      if (marker.current) {
        const pos = marker.current.getLatLng();
        debouncedGetAddress(pos.lat, pos.lng);
      }
    });

    // Handle map click with debouncing
    map.current.on('click', (e: any) => {
      if (marker.current) {
        marker.current.setLatLng([e.latlng.lat, e.latlng.lng]);
        debouncedGetAddress(e.latlng.lat, e.latlng.lng);
      }
    });

    // Get initial address only once
    debouncedGetAddress(lat, lng);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []); // Empty dependency array - initialize only once

  // Separate effect to update marker position when lat/lng props change
  useEffect(() => {
    if (!marker.current || !map.current) return;
    marker.current.setLatLng([lat, lng]);
  }, [lat, lng]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <div ref={mapRef} className="w-full h-full" />
        {isLoading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-3 bg-white/95 px-6 py-4 rounded-2xl shadow-2xl">
              <div className="w-8 h-8 border-4 border-[#689f38] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-[#1b5e20] font-semibold">Fetching location...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
