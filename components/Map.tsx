"use client";
import React from 'react';


interface MapProps {
  lat: number;
  lng: number;
}

export default function Map({ lat, lng }: MapProps) {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-[#689f38] relative">
      <iframe
        title="Map"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
      />
      {/* Blue dot overlay for current location */}
      <div
        className="absolute z-10"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      >
        <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
      </div>
    </div>
  );
}
