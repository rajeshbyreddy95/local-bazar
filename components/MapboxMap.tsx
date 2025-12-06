"use client";
import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapComponentProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function MapboxMapComponent({ lat, lng, onLocationChange }: MapboxMapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [address, setAddress] = useState('');

  // Reverse geocode to get address
  const getAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data = await response.json();
      if (data.features && data.features[0]) {
        const placeName = data.features[0].place_name;
        setAddress(placeName);
        return placeName;
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
    return '';
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 15,
    });

    // Add marker
    marker.current = new mapboxgl.Marker({ draggable: true, color: '#0066ff' })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat();
        getAddress(lngLat.lat, lngLat.lng).then((addr) => {
          onLocationChange(lngLat.lat, lngLat.lng, addr);
        });
      }
    });

    // Handle map click
    map.current.on('click', (e: any) => {
      if (marker.current) {
        marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        getAddress(e.lngLat.lat, e.lngLat.lng).then((addr) => {
          onLocationChange(e.lngLat.lat, e.lngLat.lng, addr);
        });
      }
    });

    // Get initial address
    getAddress(lat, lng);

    return () => {
      // Cleanup
    };
  }, [lat, lng, onLocationChange]);

  return (
    <div className="w-full">
      <div ref={mapContainer} className="w-full h-64 rounded-xl border-2 border-[#689f38] overflow-hidden" />
      {address && <p className="mt-2 text-sm text-gray-600">📍 {address}</p>}
    </div>
  );
}
