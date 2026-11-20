import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  Plus, 
  Minus, 
  Layers, 
  Crosshair, 
  Copy, 
  ExternalLink, 
  Share2, 
  MapPin, 
  Loader2 
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { formatCoordinates, copyToClipboard } from '../utils/helpers';
import { reverseGeocode } from '../services/nominatim';

// Map Layers configurations
const MAP_LAYERS = {
  standard: {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  voyager: {
    name: 'Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
    maxZoom: 20,
  },
  dark: {
    name: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
    maxZoom: 20,
  }
};

/**
 * Helper component to handle map interactions: flyTo, fitBounds, click-to-reverse-geocode
 */
function MapController({ 
  selectedPlace, 
  userLocation, 
  routeData, 
  onMapClick,
  activeStepLocation
}) {
  const map = useMap();

  // Fly to selected place
  useEffect(() => {
    if (selectedPlace && selectedPlace.lat != null && selectedPlace.lng != null) {
      map.flyTo([selectedPlace.lat, selectedPlace.lng], 16, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [selectedPlace, map]);

  // Fit bounds when route is generated
  useEffect(() => {
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      const bounds = L.latLngBounds(routeData.coordinates);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 17,
        animate: true,
        duration: 1.2,
      });
    }
  }, [routeData, map]);

  // Fly to specific step maneuver location when clicked in directions
  useEffect(() => {
    if (activeStepLocation) {
      map.flyTo(activeStepLocation, 18, {
        duration: 0.8,
      });
    }
  }, [activeStepLocation, map]);

  // Handle map click for reverse geocoding
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
}

/**
 * Create modern SVG divIcon for places
 */
function createPlaceIcon(color = '#4f46e5') {
  return L.divIcon({
    className: 'custom-place-marker',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 48px;
        filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      " class="hover:scale-110">
        <svg viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
          <path d="M19 0C8.50659 0 0 8.50659 0 19C0 32.25 19 48 19 48C19 48 38 32.25 38 19C38 8.50659 29.4934 0 19 0Z" fill="${color}"/>
          <circle cx="19" cy="18" r="8" fill="white"/>
          <circle cx="19" cy="18" r="4" fill="${color}"/>
        </svg>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -44],
  });
}

/**
 * Create pulsing blue dot for user location
 */
const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div class="user-marker-container">
      <div class="user-marker-pulse"></div>
      <div class="user-marker-dot"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

/**
 * Route Start Icon (Emerald)
 */
const routeStartIcon = L.divIcon({
  className: 'route-start-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

export function MapView({
  selectedPlace,
  userLocation,
  routeData,
  onSelectPlace,
  onLocateUser,
  isLocating,
  activeStepLocation,
  onOpenDirections,
  onShowToast,
}) {
  const { lang, t } = useLanguage();
  const [activeLayer, setActiveLayer] = useState(() => {
    // If dark mode is active on load, default to dark layer, otherwise voyager
    return document.documentElement.classList.contains('dark') ? 'dark' : 'voyager';
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const mapRef = useRef(null);

  // Sync layer with system/theme changes if user hasn't explicitly locked it
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setActiveLayer(isDark ? 'dark' : 'voyager');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Center coordinate: selected place, or user location, or Tashkent default
  const defaultCenter = useMemo(() => {
    if (selectedPlace) return [selectedPlace.lat, selectedPlace.lng];
    if (userLocation) return [userLocation.lat, userLocation.lng];
    return [41.2995, 69.2401]; // Tashkent
  }, [selectedPlace, userLocation]);

  const handleMapClick = async (lat, lng) => {
    try {
      const place = await reverseGeocode(lat, lng, lang);
      if (place) {
        onSelectPlace(place);
      }
    } catch (err) {
      console.error('Reverse geocode error on map click:', err);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleCopyCoords = (place) => {
    const coordsStr = formatCoordinates(place.lat, place.lng);
    copyToClipboard(coordsStr);
    onShowToast?.(t.coordsCopied);
  };

  const currentLayerConfig = MAP_LAYERS[activeLayer] || MAP_LAYERS.voyager;
  const placeIcon = useMemo(() => {
    const color = selectedPlace?.categoryInfo?.pinColor || '#4f46e5';
    return createPlaceIcon(color);
  }, [selectedPlace]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        zoomControl={false}
        attributionControl={true}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          key={activeLayer}
          url={currentLayerConfig.url}
          attribution={currentLayerConfig.attribution}
          maxZoom={currentLayerConfig.maxZoom}
        />

        <MapController
          selectedPlace={selectedPlace}
          userLocation={userLocation}
          routeData={routeData}
          onMapClick={handleMapClick}
          activeStepLocation={activeStepLocation}
        />

        {/* User Location Pulsing Dot Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-2 text-center">
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400">
                  {t.locationActive}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {formatCoordinates(userLocation.lat, userLocation.lng)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Selected Place Marker */}
        {selectedPlace && (
          <Marker position={[selectedPlace.lat, selectedPlace.lng]} icon={placeIcon}>
            <Popup>
              <div className="p-3 max-w-[260px] text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t.categories[selectedPlace.categoryKey] || selectedPlace.categoryKey}</span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                  {selectedPlace.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {selectedPlace.subtitle || selectedPlace.displayName}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">
                    {formatCoordinates(selectedPlace.lat, selectedPlace.lng)}
                  </span>
                  <button
                    onClick={() => handleCopyCoords(selectedPlace)}
                    type="button"
                    className="p-1 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title={t.copyCoords}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {onOpenDirections && (
                  <button
                    onClick={() => onOpenDirections(selectedPlace)}
                    type="button"
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-sm transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t.getDirections}</span>
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline when Directions mode is active */}
        {routeData && routeData.coordinates && routeData.coordinates.length > 0 && (
          <>
            {/* Start Pin */}
            {routeData.start && (
              <Marker position={[routeData.start.lat, routeData.start.lng]} icon={routeStartIcon} />
            )}

            {/* Polyline Halo / Background for contrast */}
            <Polyline
              positions={routeData.coordinates}
              pathOptions={{
                color: '#1e1b4b',
                weight: 9,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Main Route Polyline */}
            <Polyline
              positions={routeData.coordinates}
              pathOptions={{
                color: '#4f46e5',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Floating Map Controls on the Right */}
      <div className="absolute right-3 sm:right-4 bottom-24 sm:bottom-8 flex flex-col gap-2 z-20">
        {/* Layer Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            type="button"
            title="Xarita qatlamini o'zgartirish"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80 shadow-premium flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <Layers className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-full mr-2 bottom-0 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-right-2 duration-150">
              {Object.entries(MAP_LAYERS).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveLayer(key);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors
                    ${activeLayer === key 
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span>{t.mapLayers[key] || config.name}</span>
                  {activeLayer === key && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* My Location Button (Target for Onboarding Tour) */}
        <button
          id="my-location-tour-target"
          onClick={onLocateUser}
          disabled={isLocating}
          type="button"
          title={t.myLocation}
          className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80 shadow-premium flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 group"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          ) : (
            <Crosshair className={`w-5 h-5 ${userLocation ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300'} group-hover:scale-110 transition-transform`} />
          )}
          {userLocation && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary-600 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-premium overflow-hidden">
          <button
            onClick={handleZoomIn}
            type="button"
            title="Kattalashtirish"
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            type="button"
            title="Kichiklashtirish"
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

