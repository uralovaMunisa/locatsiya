import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { MapView } from './components/MapView';
import { PlaceCard } from './components/PlaceCard';
import { DirectionsPanel } from './components/DirectionsPanel';
import { HowItWorks } from './components/HowItWorks';
import { OnboardingModal } from './components/OnboardingModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { RecentSearchesModal } from './components/RecentSearchesModal';
import { Toast } from './components/Toast';
import { useGeolocation, DEFAULT_COORDINATES } from './hooks/useGeolocation';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLanguage } from './i18n';
import { getRoute } from './services/osrm';
import { reverseGeocode } from './services/nominatim';

export function App() {
  const { lang, t } = useLanguage();

  // Selected place & directions state
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState('driving');
  const [routeData, setRouteData] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [activeStepLocation, setActiveStepLocation] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);

  // Modals / Drawers state
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  // Persistent storage
  const [favorites, setFavorites] = useLocalStorage('joyni_top_favs_v1', []);
  const [recentSearches, setRecentSearches] = useLocalStorage('joyni_top_recents_v1', []);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage('joyni_top_onboarding_v1', false);

  // Geolocation hook
  const {
    location: userLocation,
    loading: isLocating,
    error: locationError,
    permissionDenied,
    getCurrentLocation,
    setLocation: setUserLocation,
  } = useGeolocation(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Show onboarding tour automatically for first-time visitors
  useEffect(() => {
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  // Handle URL parameters for shared places (e.g. ?lat=41.31&lng=69.24&name=Chorsu)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lat = params.get('lat');
    const lng = params.get('lng');
    const name = params.get('name');

    if (lat && lng) {
      const numLat = parseFloat(lat);
      const numLng = parseFloat(lng);
      if (!isNaN(numLat) && !isNaN(numLng)) {
        reverseGeocode(numLat, numLng, lang).then(place => {
          if (place) {
            if (name) place.name = decodeURIComponent(name);
            handleSelectPlace(place);
          } else {
            handleSelectPlace({
              id: `${numLat}-${numLng}`,
              name: name ? decodeURIComponent(name) : 'Ulashilgan manzil',
              displayName: `${numLat}, ${numLng}`,
              subtitle: `${numLat.toFixed(5)}, ${numLng.toFixed(5)}`,
              lat: numLat,
              lng: numLng,
              categoryKey: 'default',
            });
          }
        });
      }
    }
  }, []);

  // Fetch route when directions are active and start/dest coordinates change
  const fetchRoute = useCallback(async (start, end, mode) => {
    if (!start || !end) return;
    setIsLoadingRoute(true);
    setRouteError(null);

    try {
      const data = await getRoute(start, end, mode, lang);
      setRouteData(data);
    } catch (err) {
      console.error('Failed to compute route:', err);
      setRouteError(t.routeNotFound);
      setRouteData(null);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [lang, t]);

  // Update route when mode changes or destinations change
  useEffect(() => {
    if (isDirectionsOpen && selectedPlace) {
      const start = userLocation || DEFAULT_COORDINATES;
      const end = { lat: selectedPlace.lat, lng: selectedPlace.lng };
      fetchRoute(start, end, currentMode);
    }
  }, [isDirectionsOpen, selectedPlace, userLocation, currentMode, fetchRoute]);

  // Handle place selection
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setActiveStepLocation(null);

    // Save to recent searches (prevent duplicates)
    setRecentSearches(prev => {
      const filtered = prev.filter(item => {
        if (typeof item === 'object') return item.id !== place.id && item.name !== place.name;
        return item !== place.name;
      });
      return [place, ...filtered].slice(0, 15);
    });
  };

  // Locate User handler
  const handleLocateUser = async () => {
    try {
      const coords = await getCurrentLocation(true);
      showToast(t.locationActive);

      // If directions mode is open, update route immediately with new position
      if (isDirectionsOpen && selectedPlace) {
        fetchRoute(coords, { lat: selectedPlace.lat, lng: selectedPlace.lng }, currentMode);
      }
    } catch (err) {
      console.warn('Location error:', err);
      if (err.code === 1) {
        showToast(t.locationDenied, 'error');
      } else {
        showToast(t.locationUnavailable, 'error');
      }
    }
  };

  // Open directions for a place
  const handleOpenDirections = async (place) => {
    const targetPlace = place || selectedPlace;
    if (!targetPlace) return;

    setSelectedPlace(targetPlace);
    setIsDirectionsOpen(true);

    // If user location is not active yet, request it automatically
    if (!userLocation) {
      try {
        await getCurrentLocation(false);
      } catch (err) {
        // Fallback to default coordinates if denied
        showToast(t.selectStartHint, 'error');
      }
    }
  };

  // Toggle favorite place
  const handleToggleFavorite = (place) => {
    const isFav = favorites.some(f => f.id === place.id || (f.lat === place.lat && f.lng === place.lng));
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== place.id && !(f.lat === place.lat && f.lng === place.lng)));
      showToast(t.removeFromFavorites);
    } else {
      setFavorites(prev => [place, ...prev]);
      showToast(t.addToFavorites);
    }
  };

  const isCurrentPlaceFavorite = selectedPlace
    ? favorites.some(f => f.id === selectedPlace.id || (f.lat === selectedPlace.lat && f.lng === selectedPlace.lng))
    : false;

  const handleResetView = () => {
    setSelectedPlace(null);
    setIsDirectionsOpen(false);
    setRouteData(null);
    setActiveStepLocation(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Floating Navbar */}
      <Navbar
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenRecent={() => setIsRecentOpen(true)}
        favoritesCount={favorites.length}
        recentCount={recentSearches.length}
        onResetView={handleResetView}
      />

      {/* Floating Hero Search Bar */}
      <div className="absolute top-20 sm:top-20 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[540px] z-20 pointer-events-auto">
        <SearchBar
          onSelectPlace={handleSelectPlace}
          userLocation={userLocation}
          recentSearches={recentSearches}
          onSelectRecent={handleSelectPlace}
          onClearRecent={() => setRecentSearches([])}
          selectedCategory={selectedCategoryFilter}
          onCategoryFilter={setSelectedCategoryFilter}
        />
      </div>

      {/* Full-bleed Interactive Map */}
      <div className="w-full h-full">
        <MapView
          selectedPlace={selectedPlace}
          userLocation={userLocation}
          routeData={routeData}
          onSelectPlace={handleSelectPlace}
          onLocateUser={handleLocateUser}
          isLocating={isLocating}
          activeStepLocation={activeStepLocation}
          onOpenDirections={handleOpenDirections}
          onShowToast={showToast}
        />
      </div>

      {/* Place Details Card (Desktop Sidebar / Mobile Bottom Sheet) */}
      {selectedPlace && !isDirectionsOpen && (
        <PlaceCard
          place={selectedPlace}
          userLocation={userLocation}
          isFavorite={isCurrentPlaceFavorite}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedPlace(null)}
          onGetDirections={() => handleOpenDirections(selectedPlace)}
          onShowToast={showToast}
        />
      )}

      {/* Directions & Navigation Step-by-step Panel */}
      {isDirectionsOpen && selectedPlace && (
        <DirectionsPanel
          destination={selectedPlace}
          userLocation={userLocation}
          routeData={routeData}
          currentMode={currentMode}
          onChangeMode={setCurrentMode}
          isLoadingRoute={isLoadingRoute}
          routeError={routeError}
          onClose={() => {
            setIsDirectionsOpen(false);
            setRouteData(null);
            setActiveStepLocation(null);
          }}
          onStepClick={(coords) => setActiveStepLocation(coords)}
        />
      )}

      {/* How it Works & Landmark Explorer Modal */}
      <HowItWorks
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onSelectLandmark={handleSelectPlace}
        onStartTour={() => setIsOnboardingOpen(true)}
      />

      {/* Onboarding Interactive Tour */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          setHasSeenOnboarding(true);
        }}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectFavorite={handleSelectPlace}
        onRemoveFavorite={(id) => setFavorites(prev => prev.filter(f => f.id !== id))}
        onClearAllFavorites={() => setFavorites([])}
      />

      {/* Recent Searches Modal */}
      <RecentSearchesModal
        isOpen={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
        recentSearches={recentSearches}
        onSelectRecent={handleSelectPlace}
        onRemoveRecent={(idx) => setRecentSearches(prev => prev.filter((_, i) => i !== idx))}
        onClearAll={() => setRecentSearches([])}
      />

      {/* Floating Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

