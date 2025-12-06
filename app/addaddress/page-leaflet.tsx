"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
// import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiMapPin, FiCheck, FiLoader } from "react-icons/fi";
import { showToast } from "@/components/Toast";

interface AddressDetails {
  pincode?: string;
  street?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
}

const DEFAULT_LAT = 17.3850;
const DEFAULT_LNG = 78.4867; // Hyderabad default
const GEO_TIMEOUT_MS = 8000; // geolocation timeout
const GEOCODE_TIMEOUT_MS = 5000; // reverse geocode timeout
const DEBOUNCE_MS = 500;

export default function AddAddressPage() {
  const router = useRouter();

  // Core states
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [permission, setPermission] = useState<"pending" | "granted" | "denied" | "unavailable">("pending");
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Auth & saving states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    pincode: "",
    street: "",
    village: "",
    mandal: "",
    district: "",
    state: "",
    country: "",
  });
  const [isFillingForm, setIsFillingForm] = useState(false);

  // Map refs
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapInitializedRef = useRef(false);

  // Debounce and request dedupe refs
  const debounceTimerRef = useRef<number | null>(null);
  const lastRequestRef = useRef<{ lat: number; lng: number } | null>(null);
  const geocodeAbortRef = useRef<AbortController | null>(null);

  // Ensure we only fetch location once on mount
  const didAttemptLocationRef = useRef(false);

  // ----------------------------
  // Geolocation helper
  // ----------------------------
  const fetchLocation = useCallback((opts?: { fallbackToDefault?: boolean }) => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported by browser");
      setPermission("denied");
      if (opts?.fallbackToDefault) {
        setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        setShowMap(true);
      }
      return;
    }

    setPermission("pending");

    let didFinish = false;
    const timeoutId = window.setTimeout(() => {
      if (didFinish) return;
      didFinish = true;
      console.warn("Geolocation timed out. Falling back to default coordinates.");
      // fallback behavior: treat as granted so map shows
      setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setPermission("granted");
      setShowMap(true);
    }, GEO_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (didFinish) return;
        didFinish = true;
        clearTimeout(timeoutId);

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy ?? 0;

        console.log("Geolocation success:", { lat, lng, accuracy });
        setLocation({ lat, lng });
        setPermission("granted");
        setShowMap(true);
      },
      (error) => {
        if (didFinish) return;
        didFinish = true;
        clearTimeout(timeoutId);

        console.warn("Geolocation error:", error);

        if (error.code === 1) {
          // permission denied
          setPermission("denied");
        } else if (error.code === 2) {
          // position unavailable (common on desktops without GPS)
          console.info("Position unavailable — using default coordinates");
          setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setPermission("granted");
          setShowMap(true);
        } else if (error.code === 3) {
          // timeout
          console.info("Position request timed out — using default coordinates");
          setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setPermission("granted");
          setShowMap(true);
        } else {
          setPermission("unavailable");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: 0,
      }
    );
  }, []);

  // ----------------------------
  // Reverse geocode (via /api/geocode)
  // Debounced and deduped
  // ----------------------------
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    // dedupe identical recent requests
    if (
      lastRequestRef.current &&
      Math.abs(lastRequestRef.current.lat - lat) < 0.00001 &&
      Math.abs(lastRequestRef.current.lng - lng) < 0.00001
    ) {
      console.log("Skipping duplicate geocode request");
      return { address: "", details: {} as AddressDetails };
    }

    lastRequestRef.current = { lat, lng };

    // Abort any previous geocode
    if (geocodeAbortRef.current) {
      geocodeAbortRef.current.abort();
      geocodeAbortRef.current = null;
    }

    const controller = new AbortController();
    geocodeAbortRef.current = controller;
    setIsLoadingAddress(true);

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, GEOCODE_TIMEOUT_MS);

    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      geocodeAbortRef.current = null;
      setIsLoadingAddress(false);

      if (!res.ok) {
        throw new Error(`Geocode API returned ${res.status}`);
      }

      const data = await res.json();

      if (data && (data.display_name || data.address)) {
        const addr = data.address || {};
        const details: AddressDetails = {
          pincode: addr.postcode || "",
          street:
            addr.road ||
            addr.street ||
            addr.path ||
            addr.pedestrian ||
            addr.house_number ||
            "",
          village:
            addr.village ||
            addr.hamlet ||
            addr.neighbourhood ||
            addr.town ||
            addr.city_village ||
            "",
          mandal: addr.county || addr.district || addr.suburb || addr.municipality || "",
          district: addr.state_district || addr.city_district || addr.region || "",
          state: addr.state || "",
        };

        // Try to fill missing fields from display_name tokens
        if (!details.street && data.display_name) {
          const parts = (data.display_name as string).split(",").map((p: string) => p.trim());
          if (parts.length > 0) details.street = details.street || parts[0];
          if (parts.length > 1) details.village = details.village || parts[1];
        }

        return { address: data.display_name || "", details };
      }

      return {
        address: `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        details: {} as AddressDetails,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      geocodeAbortRef.current = null;
      setIsLoadingAddress(false);
      console.error("Reverse geocode failed:", err);
      return {
        address: `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        details: {} as AddressDetails,
      };
    }
  }, []);

  const debouncedGeocode = useCallback((lat: number, lng: number) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      const res = await reverseGeocode(lat, lng);
      if (res && res.address) {
        setAddress(res.address);
        setForm((prev) => ({
          ...prev,
          pincode: res.details?.pincode || prev.pincode || "",
          street: res.details?.street || prev.street || "",
          village: res.details?.village || prev.village || "",
          mandal: res.details?.mandal || prev.mandal || "",
          district: res.details?.district || prev.district || "",
          state: res.details?.state || prev.state || "",
        }));
      }
    }, DEBOUNCE_MS);
  }, [reverseGeocode]);

  // ----------------------------
  // Initialize Leaflet when location is available
  // ----------------------------
useEffect(() => {
  if (!location || mapInitializedRef.current || !mapRef.current) return;

  // Load Leaflet only in the browser
  let L: typeof import("leaflet");

  (async () => {
    const leaflet = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    L = leaflet;

    mapInitializedRef.current = true;

    const map = L.map(mapRef.current).setView([location.lat, location.lng], 15);
    leafletMapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Custom blue marker icon (SVG)
    const blueMarkerIcon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4285F4" width="32" height="42"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.51 3.64 10.74 8.5 12.37.5.14 1 .14 1.5 0C18.36 22.74 22 17.51 22 12c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5z"/></svg>`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -35],
      className: "drop-shadow-lg",
    });

    // Marker
    const marker = L.marker([location.lat, location.lng], { 
      draggable: true,
      icon: blueMarkerIcon 
    }).addTo(map)
      .bindPopup("🎯 Drag to select location");
    markerRef.current = marker;

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      setLocation({ lat: pos.lat, lng: pos.lng });
      debouncedGeocode(pos.lat, pos.lng);
    });

    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setLocation({ lat, lng });
      debouncedGeocode(lat, lng);
    });

    // Run initial reverse geocode
    debouncedGeocode(location.lat, location.lng);
  })();
}, [location?.lat, location?.lng, debouncedGeocode]);

  // when location changes (from other triggers), ensure marker and map view update
  useEffect(() => {
    if (!location || !leafletMapRef.current) return;
    // update marker and map center
    const map = leafletMapRef.current;
    if (markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng]);
    } else {
      // create marker if missing
      markerRef.current = L.marker([location.lat, location.lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLatLng();
        setLocation({ lat: pos.lat, lng: pos.lng });
        debouncedGeocode(pos.lat, pos.lng);
      });
    }
    map.setView([location.lat, location.lng], Math.max(map.getZoom(), 15), { animate: true });
  }, [location, debouncedGeocode]);

  // ----------------------------
  // Auth check on mount
  // ----------------------------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (!mounted) return;
        if (!res.ok) {
          setIsAuthenticated(false);
          showToast("Please login to add an address", "error");
          // keep a tiny delay for toast to show before redirect
          setTimeout(() => router.push("/auth/login"), 1200);
          return;
        }
        setIsAuthenticated(true);
      } catch (err) {
        if (!mounted) return;
        setIsAuthenticated(false);
        showToast("Authentication error. Please login.", "error");
        setTimeout(() => router.push("/auth/login"), 1200);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  // ----------------------------
  // Fetch location once on mount (but allow manual re-tries)
  // ----------------------------
  useEffect(() => {
    if (!didAttemptLocationRef.current) {
      didAttemptLocationRef.current = true;
      fetchLocation({ fallbackToDefault: true });
    }
  }, [fetchLocation]);

  // ensure showMap toggles when location becomes available
  useEffect(() => {
    if (location) {
      setShowMap(true);
    }
  }, [location]);

  // ----------------------------
  // Form helpers & handlers
  // ----------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = async () => {
    if (!location) {
      showToast("Please select a location on the map", "error");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        lat: location.lat,
        lng: location.lng,
        address,
        ...form,
      };

      console.log("Saving address payload:", payload);

      const res = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        showToast("Session expired. Please login again.", "error");
        setTimeout(() => router.push("/auth/login"), 1200);
        return;
      }

      if (!res.ok) {
        const msg = data.error || data.message || "Failed to save address";
        throw new Error(msg);
      }

      showToast("✅ Address added successfully!", "success");
      setTimeout(() => router.push("/"), 1200);
    } catch (err: any) {
      console.error("Save address failed:", err);
      showToast(`❌ ${err?.message || "Unknown error"}`, "error");
      setIsSaving(false);
    }
  };

  const handleManual = () => {
    router.push("/addAddressManually");
  };

  const handleGetCurrentLocation = () => {
    showToast("📍 Detecting your current location...", "info");
    fetchLocation({ fallbackToDefault: true });
  };

  // External update helper (if you need to programmatically update location + address)
  const handleLocationChange = async (lat: number, lng: number) => {
    setIsFillingForm(true);
    setLocation({ lat, lng });
    setShowMap(true);

    const res = await reverseGeocode(lat, lng);
    if (res) {
      setAddress(res.address);
      setForm((prev) => ({
        ...prev,
        pincode: res.details?.pincode || prev.pincode,
        street: res.details?.street || prev.street,
        village: res.details?.village || prev.village,
        mandal: res.details?.mandal || prev.mandal,
        district: res.details?.district || prev.district,
        state: res.details?.state || prev.state,
      }));
    }
    setIsFillingForm(false);
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="h-screen w-screen bg-[#e8f5e9] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-6 border-b border-[#ccf5d1] bg-[#e8f5e9] shrink-0">
        <h1 className="text-3xl font-bold text-[#1b5e20] flex items-center gap-2">
          <FiMapPin /> Add Your Address
        </h1>
      </div>

      {/* Pending */}
      {permission === "pending" && (
        <div className="flex-1 flex items-center justify-center bg-linear-to-br from-[#e8f5e9] to-[#c8e6c9]">
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#689f38] rounded-full animate-pulse opacity-75"></div>
                <div className="relative inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#e8f5e9] border-t-[#689f38] border-r-[#689f38]"></div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1b5e20]">📍 Fetching Location...</p>
                <p className="mt-2 text-sm text-[#558b2f]">Please allow location access in your browser</p>
                <p className="mt-1 text-xs text-gray-600">If your device doesn't support GPS, a default city will be used.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission denied */}
      {permission === "denied" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 flex flex-col items-center gap-4 max-w-md">
            <p className="text-red-700 font-semibold text-lg">📍 Location Permission Denied</p>
            <p className="text-sm text-red-600 text-center">Allow location access in your browser settings or add address manually.</p>
            <div className="flex gap-2 flex-col w-full">
              <button
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition w-full"
                onClick={() => fetchLocation({ fallbackToDefault: true })}
              >
                🔄 Retry Location
              </button>
              <button
                className="px-4 py-2 bg-[#689f38] text-white font-semibold rounded-lg hover:bg-[#1b5e20] transition w-full"
                onClick={() => {
                  setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
                  setShowMap(true);
                  setPermission("granted");
                }}
              >
                🗺️ Use Map Anyway
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition w-full"
                onClick={handleManual}
              >
                ✏️ Add Manually
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unavailable */}
      {permission === "unavailable" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 flex flex-col items-center gap-4 max-w-md">
            <p className="text-yellow-700 font-semibold text-lg">⚠️ Location Temporarily Unavailable</p>
            <p className="text-sm text-yellow-600 text-center">Your location couldn't be determined. Please try again or use the map manually.</p>
            <div className="flex gap-2 flex-col w-full">
              <button
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition w-full"
                onClick={() => fetchLocation({ fallbackToDefault: true })}
              >
                🔄 Try Again
              </button>
              <button
                className="px-4 py-2 bg-[#689f38] text-white font-semibold rounded-lg hover:bg-[#1b5e20] transition w-full"
                onClick={() => {
                  setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
                  setShowMap(true);
                  setPermission("granted");
                }}
              >
                🗺️ Use Default Map
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition w-full"
                onClick={handleManual}
              >
                ✏️ Add Manually
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map + Form */}
      {(showMap || location) && permission === "granted" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          {/* LEFT - Map */}
          <div className="flex flex-col bg-white border-r border-[#ccf5d1] overflow-hidden">
            <div className="p-3 bg-[#e8f5e9] border-b border-[#ccf5d1] shrink-0">
              <button
                onClick={handleGetCurrentLocation}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition active:scale-95"
              >
                📍 Get Current Location
              </button>
            </div>

            <div className="flex-1 overflow-hidden w-full flex flex-col">
              <div className="relative flex-1 overflow-hidden">
                <div ref={mapRef} className="w-full h-full" />
                {isLoadingAddress && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-50">
                    <div className="flex flex-col items-center gap-3 bg-white/95 px-6 py-4 rounded-2xl shadow-2xl">
                      <div className="w-8 h-8 border-4 border-[#689f38] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-[#1b5e20] font-semibold">Fetching address...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#ccf5d1] p-4 bg-white shrink-0">
              <p className="text-sm text-gray-600 mb-2">Selected Address:</p>
              <p className="text-base font-semibold text-[#1b5e20] line-clamp-2">{address || "—"}</p>
            </div>
          </div>

          {/* RIGHT - Form */}
          <div className="flex flex-col bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 relative">
              <h2 className="text-xl font-bold text-[#1b5e20] mb-4">Address Details</h2>
              {isFillingForm && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-3 border-[#689f38] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#1b5e20] font-semibold">Filling form...</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3">
                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]" />
                <input name="street" value={form.street} onChange={handleChange} placeholder="Street" className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]" />
                <input name="village" value={form.village} onChange={handleChange} placeholder="Village" className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]" />
                <input name="mandal" value={form.mandal} onChange={handleChange} placeholder="Mandal" className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]" />
                <input name="district" value={form.district} onChange={handleChange} placeholder="District" className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]" />
                <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]" />
              </div>
            </div>

            <div className="border-t border-[#ccf5d1] p-6 bg-white shrink-0 flex gap-4">
              <button
                onClick={handleConfirm}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#689f38] text-white font-bold py-3 rounded-xl hover:bg-[#1b5e20] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Confirm
                  </>
                )}
              </button>
              <button
                onClick={handleManual}
                disabled={isSaving}
                className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Manually
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
