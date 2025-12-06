"use client";
import React, { useRef, useEffect } from 'react';

interface DraggableMapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function DraggableMap({ lat, lng, onLocationChange }: DraggableMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!(window as any).google) return;
    const map = new (window as any).google.maps.Map(mapRef.current!, {
      center: { lat, lng },
      zoom: 15,
      disableDefaultUI: true,
    });
    const marker = new (window as any).google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
      icon: {
        url: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
        scaledSize: new (window as any).google.maps.Size(40, 40),
      },
    });
    markerRef.current = marker;
    marker.addListener('dragend', (e: any) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      onLocationChange(newLat, newLng);
      map.panTo({ lat: newLat, lng: newLng });
    });
    map.addListener('click', (e: any) => {
      marker.setPosition(e.latLng);
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      onLocationChange(newLat, newLng);
    });
    return () => {
      marker.setMap(null);
    };
  }, [lat, lng, onLocationChange]);

  return <div ref={mapRef} className="w-full h-64 rounded-xl border-2 border-[#689f38]" />;
}
