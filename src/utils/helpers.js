/**
 * Calculate distance between two lat/lng coordinates in meters (Haversine formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

/**
 * Format distance in meters to a human readable string (e.g. "450 m" or "3.4 km")
 */
export function formatDistance(meters, lang = 'uz') {
  if (meters == null || isNaN(meters)) return '';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Format duration in seconds to human readable string (e.g. "12 daqiqa", "1 s 15 daq")
 */
export function formatDuration(seconds, lang = 'uz') {
  if (seconds == null || isNaN(seconds)) return '';
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    if (lang === 'ru') return `${mins} мин`;
    if (lang === 'en') return `${mins} min`;
    return `${mins} daq`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (lang === 'ru') return `${hours} ч ${remainingMins > 0 ? remainingMins + ' мин' : ''}`;
  if (lang === 'en') return `${hours} hr ${remainingMins > 0 ? remainingMins + ' min' : ''}`;
  return `${hours} soat ${remainingMins > 0 ? remainingMins + ' daq' : ''}`;
}

/**
 * Estimate travel time for driving, cycling, and walking given distance in meters
 */
export function estimateTravelTimes(distanceMeters) {
  if (!distanceMeters) return null;
  // Estimated average speeds:
  // Driving in city: 35 km/h -> ~9.72 m/s
  // Cycling: 15 km/h -> ~4.16 m/s
  // Walking: 4.8 km/h -> ~1.33 m/s
  return {
    drivingSeconds: Math.round(distanceMeters / 9.72),
    cyclingSeconds: Math.round(distanceMeters / 4.16),
    walkingSeconds: Math.round(distanceMeters / 1.33),
  };
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, using fallback', err);
    }
  }

  // Fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Copy fallback failed', err);
    return false;
  }
}

/**
 * Share location via Web Share API or copy link fallback
 */
export async function sharePlace(place) {
  if (!place) return false;
  const lat = place.lat || place.latitude;
  const lng = place.lon || place.lng || place.longitude;
  const title = place.name || 'Joyni Top';
  const url = `${window.location.origin}${window.location.pathname}?lat=${lat}&lng=${lng}&name=${encodeURIComponent(title)}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: `Manzil: ${title} (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        url: url,
      });
      return { shared: true, copied: false };
    } catch (err) {
      // AbortError is triggered if user closes share sheet
      if (err.name === 'AbortError') return { shared: false, copied: false };
    }
  }

  // Fallback to copy link
  const copied = await copyToClipboard(url);
  return { shared: false, copied };
}

/**
 * Format coordinates to clean string
 */
export function formatCoordinates(lat, lng) {
  if (lat == null || lng == null) return '';
  const numLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const numLng = typeof lng === 'number' ? lng : parseFloat(lng);
  return `${numLat.toFixed(5)}, ${numLng.toFixed(5)}`;
}

/**
 * Clean Nominatim display_name into short title and address
 */
export function formatPlaceTitleAndSubtitle(item) {
  if (!item) return { title: '', subtitle: '' };

  const address = item.address || {};
  let title = item.name;

  if (!title) {
    title = address.amenity || address.shop || address.tourism || address.leisure || 
            address.road || address.building || address.suburb || address.city || address.town;
  }

  // If still no title, take first segment of display_name
  if (!title && item.display_name) {
    const parts = item.display_name.split(',');
    title = parts[0]?.trim();
  }

  // Generate clean subtitle (e.g. "Chilonzor tumani, Toshkent, O'zbekiston")
  const subParts = [];
  if (address.road && address.road !== title) subParts.push(address.road);
  if (address.suburb && address.suburb !== title) subParts.push(address.suburb);
  if (address.district && address.district !== title) subParts.push(address.district);
  if (address.city && address.city !== title) subParts.push(address.city);
  if (address.town && address.town !== title) subParts.push(address.town);
  if (address.country && address.country !== title) subParts.push(address.country);

  let subtitle = subParts.slice(0, 3).join(', ');
  if (!subtitle && item.display_name) {
    const parts = item.display_name.split(',').map(s => s.trim());
    subtitle = parts.slice(1, 4).join(', ');
  }

  return {
    title: title || 'Nomsiz manzil',
    subtitle: subtitle || item.display_name || ''
  };
}

