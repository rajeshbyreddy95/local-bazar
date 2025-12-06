"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FiMapPin, FiCheck, FiLoader, FiSearch, FiX } from "react-icons/fi";
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
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function AddAddressPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // States
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [permission, setPermission] = useState<"pending" | "granted" | "denied" | "unavailable">("pending");
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFillingForm, setIsFillingForm] = useState(false);

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

  // Refs
  const mapInitializedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<{ lat: number; lng: number } | null>(null);

  // Set Mapbox token
  if (MAPBOX_TOKEN) {
    mapboxgl.accessToken = MAPBOX_TOKEN;
  }

  // Fill form with predefined address
  const fillPredefinedAddress = () => {
    setIsFillingForm(true);
    setTimeout(() => {
      setForm({
        pincode: "500095",
        street: "Koti Women's College Road, Sultan Bazar, Ward 78 Gunfoundry",
        village: "Greater Hyderabad Municipal Corporation Central Zone",
        mandal: "Nampally",
        district: "Hyderabad",
        state: "Telangana",
        country: "India",
      });
      setAddress("Koti Women's College Road, Sultan Bazar, Ward 78 Gunfoundry, Greater Hyderabad Municipal Corporation Central Zone, Hyderabad, Nampally mandal, Hyderabad, Telangana, 500095, India");
      showToast("✅ Address filled successfully!", "success");
      setIsFillingForm(false);
    }, 500);
  };

  // Fetch location on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/user");
        setIsAuthenticated(res.ok);
        if (!res.ok) {
          showToast("Please login to add an address", "error");
          setTimeout(() => router.push("/auth/login"), 1500);
        }
      } catch {
        setIsAuthenticated(false);
        showToast("Authentication error. Please login.", "error");
        setTimeout(() => router.push("/auth/login"), 1500);
      }
    };
    checkAuth();
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setPermission("denied");
      setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setShowMap(true);
      return;
    }

    setPermission("pending");
    let completed = false;

    const timeoutId = setTimeout(() => {
      if (!completed) {
        completed = true;
        setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        setPermission("granted");
        setShowMap(true);
      }
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (completed) return;
        completed = true;
        clearTimeout(timeoutId);
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setPermission("granted");
        setShowMap(true);
      },
      (error) => {
        if (completed) return;
        completed = true;
        clearTimeout(timeoutId);

        if (error.code !== 2) {
          console.error("Geolocation error:", error.code);
        }

        if (error.code === 1) {
          setPermission("denied");
        } else {
          setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setShowMap(true);
          setPermission("granted");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Reverse geocode
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (
      lastRequestRef.current &&
      Math.abs(lastRequestRef.current.lat - lat) < 0.00001 &&
      Math.abs(lastRequestRef.current.lng - lng) < 0.00001
    ) {
      return;
    }

    lastRequestRef.current = { lat, lng };
    setIsLoadingAddress(true);

    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) throw new Error("Geocoding failed");

      const data = await response.json();
      setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);

      // Auto-fill form
      if (data.address) {
        setForm((prev) => ({
          ...prev,
          pincode: data.address.postcode || prev.pincode || "",
          street: data.address.road || data.address.street || prev.street || "",
          village: data.address.village || data.address.city || prev.village || "",
          mandal: data.address.county || prev.mandal || "",
          district: data.address.state_district || prev.district || "",
          state: data.address.state || prev.state || "",
        }));
      }
    } catch (error) {
      console.error("Reverse geocode error:", error);
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  // Debounced reverse geocode
  const debouncedReverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        reverseGeocode(lat, lng);
      }, 500);
    },
    [reverseGeocode]
  );

  // Search places using Mapbox Geocoding API
  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&limit=5`
      );

      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();

      setSearchResults(
        data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center,
          geometry: feature.geometry,
        }))
      );
    } catch (error) {
      console.error("Search error:", error);
      showToast("Search failed. Please try again.", "error");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search with debounce
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      searchPlaces(query);
    }, 300);
  };

  // Select search result
  const selectSearchResult = (result: any) => {
    const [lng, lat] = result.center;
    setLocation({ lat, lng });
    setSearchQuery("");
    setSearchResults([]);

    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000,
      });
    }

    debouncedReverseGeocode(lat, lng);
  };

  // Initialize Mapbox map - only once
  useEffect(() => {
    console.log("Map init effect triggered, mapContainer:", mapContainer.current);
    
    if (!mapContainer.current) {
      console.log("No map container found");
      return;
    }

    // Skip if already initialized
    if (mapInitializedRef.current && map.current) {
      console.log("Map already initialized, skipping");
      return;
    }

    if (!MAPBOX_TOKEN) {
      console.error("Mapbox token not configured");
      showToast("Mapbox token not configured", "error");
      return;
    }

    // Use location if available, otherwise use default
    const mapLat = location?.lat || DEFAULT_LAT;
    const mapLng = location?.lng || DEFAULT_LNG;

    console.log("Initializing Mapbox with coordinates:", mapLat, mapLng);

    mapInitializedRef.current = true;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [mapLng, mapLat],
        zoom: 15,
      });

      console.log("Map created successfully");

      // Wait for map to load before adding marker
      map.current.on("load", () => {
        console.log("Map loaded, adding marker");
        
        // Create draggable marker
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234285F4"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12c0 5.51 3.64 10.74 8.5 12.37.5.14 1 .14 1.5 0C18.36 22.74 22 17.51 22 12c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5z"/%3E%3C/svg%3E')`;
        el.style.backgroundSize = "100%";
        el.style.width = "32px";
        el.style.height = "42px";
        el.style.cursor = "grab";
        el.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.3))";

        marker.current = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat([mapLng, mapLat])
          .addTo(map.current!);

        marker.current.on("dragend", () => {
          const lngLat = marker.current!.getLngLat();
          setLocation({ lat: lngLat.lat, lng: lngLat.lng });
          debouncedReverseGeocode(lngLat.lat, lngLat.lng);
        });

        map.current!.on("click", (e) => {
          const { lat, lng } = e.lngLat;
          marker.current!.setLngLat([lng, lat]);
          setLocation({ lat, lng });
          debouncedReverseGeocode(lat, lng);
        });

        // Initial reverse geocode
        debouncedReverseGeocode(mapLat, mapLng);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
      });
    } catch (error) {
      console.error("Error creating Mapbox map:", error);
    }

    return () => {
      console.log("Cleaning up map");
      map.current?.remove();
      map.current = null;
      mapInitializedRef.current = false;
    };
  }, [debouncedReverseGeocode]); // Include debouncedReverseGeocode in deps

  // Update marker and map view when location changes (after initial setup)
  useEffect(() => {
    if (marker.current && location) {
      marker.current.setLngLat([location.lng, location.lat]);
      if (map.current) {
        map.current.flyTo({
          center: [location.lng, location.lat],
          zoom: Math.max(map.current.getZoom(), 15),
        });
      }
    }
  }, [location]);

  const handleLocationChange = (lat: number, lng: number, addr: string, details?: AddressDetails) => {
    setIsFillingForm(true);
    setLocation({ lat, lng });
    setAddress(addr);
    if (details && Object.keys(details).length > 0) {
      setForm((prev) => ({
        ...prev,
        pincode: details.pincode || prev.pincode || "",
        street: details.street || prev.street || "",
        village: details.village || prev.village || "",
        mandal: details.mandal || prev.mandal || "",
        district: details.district || prev.district || "",
        state: details.state || prev.state || "",
      }));
    }
    setIsFillingForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

      const response = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.status === 401) {
        showToast("Session expired. Please login again.", "error");
        setTimeout(() => router.push("/auth/login"), 1500);
        return;
      }

      if (!response.ok) {
        const errorMsg = responseData.error || responseData.message || "Failed to save address";
        throw new Error(errorMsg);
      }

      showToast("✅ Address added successfully!", "success");
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error saving address:", errorMessage);
      showToast(`❌ ${errorMessage}`, "error");
      setIsSaving(false);
    }
  };

  const handleManual = () => {
    router.push("/addAddressManually");
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported in your browser", "error");
      return;
    }

    showToast("📍 Detecting your current location...", "info");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        showToast(`✅ Location detected! (Accuracy: ${Math.round(pos.coords.accuracy)}m)`, "success");
      },
      (error) => {
        let errorMsg = "❌ Could not detect current location";

        if (error.code === 1) {
          errorMsg = "❌ Location permission denied. Please enable location access in browser settings.";
          showToast(errorMsg, "error");
        } else if (error.code === 2) {
          // Position unavailable (expected on Mac without GPS) - silently use map
          console.debug("ℹ️ Position unavailable - using map instead");
        } else if (error.code === 3) {
          errorMsg = "⏱️ Location request timed out. Please try again.";
          showToast(errorMsg, "error");
        } else {
          showToast(errorMsg, "error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="h-screen w-screen bg-[#e8f5e9] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-6 border-b border-[#ccf5d1] bg-[#e8f5e9] shrink-0">
        <h1 className="text-3xl font-bold text-[#1b5e20] flex items-center gap-2">
          <FiMapPin /> Add Your Address
        </h1>
      </div>

      {/* Permission states */}
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
              </div>
            </div>
          </div>
        </div>
      )}

      {permission === "denied" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 flex flex-col items-center gap-4 max-w-md">
            <p className="text-red-700 font-semibold text-lg">📍 Location Permission Denied</p>
            <p className="text-sm text-red-600 text-center">Allow location access in your browser settings.</p>
            <div className="flex gap-2 flex-col w-full">
              <button
                className="px-4 py-2 bg-[#689f38] text-white font-semibold rounded-lg hover:bg-[#1b5e20] transition w-full"
                onClick={() => {
                  setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
                  setShowMap(true);
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

      {/* Map and form */}
      {(location || showMap) && permission === "granted" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          {/* LEFT SIDE - Map */}
          <div className="flex flex-col bg-white border-r border-[#ccf5d1] overflow-hidden">
            {/* Search bar */}
            <div className="p-3 bg-[#e8f5e9] border-b border-[#ccf5d1] shrink-0 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full px-4 py-2 border border-[#ccf5d1] rounded-lg focus:outline-none focus:border-[#689f38]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={20} />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleGetCurrentLocation}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                >
                  📍 Current
                </button>
              </div>
              <button
                onClick={fillPredefinedAddress}
                disabled={isFillingForm}
                className="w-full px-4 py-2 bg-[#689f38] text-white font-semibold rounded-lg hover:bg-[#1b5e20] transition disabled:opacity-50"
              >
                📌 Fill Test Address
              </button>

              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto bg-white border border-[#ccf5d1] rounded-lg">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => selectSearchResult(result)}
                      className="w-full text-left px-4 py-2 hover:bg-[#e8f5e9] border-b border-[#ccf5d1] last:border-b-0 text-sm"
                    >
                      {result.place_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div ref={mapContainer} className="flex-1 overflow-hidden w-full h-full" style={{ minHeight: 0 }} />

            {/* Address display */}
            <div className="border-t border-[#ccf5d1] p-4 bg-white shrink-0">
              <p className="text-sm text-gray-600 mb-2">Selected Address:</p>
              <p className="text-base font-semibold text-[#1b5e20] line-clamp-2">{address}</p>
            </div>
          </div>

          {/* RIGHT SIDE - Form */}
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
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]"
                />
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="Street"
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]"
                />
                <input
                  name="village"
                  value={form.village}
                  onChange={handleChange}
                  placeholder="Village"
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]"
                />
                <input
                  name="mandal"
                  value={form.mandal}
                  onChange={handleChange}
                  placeholder="Mandal"
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]"
                />
                <input
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="District"
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]"
                />
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#689f38]"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="border-t border-[#ccf5d1] p-6 bg-white shrink-0 flex gap-4">
              <button
                onClick={handleConfirm}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#689f38] text-white font-bold py-3 rounded-xl hover:bg-[#1b5e20] transition disabled:opacity-50"
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
                className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-400 transition disabled:opacity-50"
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
