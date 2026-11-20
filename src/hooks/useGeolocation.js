import { useState, useEffect, useCallback } from 'react';

// Default center: Tashkent, Uzbekistan
export const DEFAULT_COORDINATES = {
  lat: 41.2995,
  lng: 69.2401,
  city: 'Toshkent',
};

export function useGeolocation(autoLocate = false) {
  const [location, setLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getCurrentLocation = useCallback((highAccuracy = true) => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser',
      });
      return Promise.reject(new Error('Geolocation unsupported'));
    }

    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(coords);
          setAccuracy(position.coords.accuracy);
          setLoading(false);
          setError(null);
          setPermissionDenied(false);
          resolve(coords);
        },
        (err) => {
          setLoading(false);
          if (err.code === 1) { // PERMISSION_DENIED
            setPermissionDenied(true);
          }
          setError(err);
          // If high accuracy failed, try standard accuracy
          if (highAccuracy && err.code === 3) { // TIMEOUT
            getCurrentLocation(false).then(resolve).catch(reject);
            return;
          }
          reject(err);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 8000 : 15000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  useEffect(() => {
    if (autoLocate) {
      getCurrentLocation().catch(() => {
        // Silently fail on auto-locate if user hasn't granted permission yet
      });
    }
  }, [autoLocate, getCurrentLocation]);

  return {
    location,
    accuracy,
    loading,
    error,
    permissionDenied,
    getCurrentLocation,
    setLocation,
  };
}

