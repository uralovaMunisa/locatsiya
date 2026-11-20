import { detectCategory, CATEGORY_CONFIG } from '../utils/categories';
import { formatPlaceTitleAndSubtitle } from '../utils/helpers';

// Simple in-memory cache to avoid duplicate requests and respect OSM rate limits
const cache = new Map();

/**
 * Search places using free Nominatim OpenStreetMap API
 * @param {string} query Search text
 * @param {object} options Optional settings: { lang, viewbox, bounded, limit }
 */
export async function searchPlaces(query, options = {}) {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const lang = options.lang || 'uz';
  const limit = options.limit || 8;
  const cacheKey = `search:${trimmed.toLowerCase()}:${lang}:${limit}:${options.viewbox || ''}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const params = new URLSearchParams({
    q: trimmed,
    format: 'json',
    addressdetails: '1',
    extratags: '1',
    limit: limit.toString(),
    'accept-language': `${lang},uz,ru,en`,
  });

  if (options.viewbox) {
    params.append('viewbox', options.viewbox);
    if (options.bounded) {
      params.append('bounded', '1');
    }
  }

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) {
      if (res.status === 429) {
        console.warn('Nominatim rate limit reached. Waiting before retrying.');
      }
      throw new Error(`Nominatim error: ${res.statusText}`);
    }

    const data = await res.json();

    const formattedResults = data.map(item => {
      const categoryKey = detectCategory(item);
      const { title, subtitle } = formatPlaceTitleAndSubtitle(item);

      return {
        id: item.place_id || `${item.lat}-${item.lon}`,
        osmId: item.osm_id,
        osmType: item.osm_type,
        name: title,
        displayName: item.display_name,
        subtitle: subtitle,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        categoryKey,
        categoryInfo: CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.default,
        rawAddress: item.address,
        importance: item.importance || 0,
        type: item.type,
        boundingBox: item.boundingbox,
      };
    });

    cache.set(cacheKey, formattedResults);
    return formattedResults;
  } catch (error) {
    console.error('Failed to search Nominatim:', error);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to place details
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @param {string} lang Language code
 */
export async function reverseGeocode(lat, lng, lang = 'uz') {
  if (lat == null || lng == null) return null;

  const cacheKey = `reverse:${lat.toFixed(5)},${lng.toFixed(5)}:${lang}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    format: 'json',
    addressdetails: '1',
    extratags: '1',
    'accept-language': `${lang},uz,ru,en`,
  });

  const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) throw new Error(`Reverse geocoding error: ${res.statusText}`);

    const item = await res.json();
    if (!item || item.error) return null;

    const categoryKey = detectCategory(item);
    const { title, subtitle } = formatPlaceTitleAndSubtitle(item);

    const result = {
      id: item.place_id || `${item.lat}-${item.lon}`,
      osmId: item.osm_id,
      name: title,
      displayName: item.display_name,
      subtitle: subtitle,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      categoryKey,
      categoryInfo: CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.default,
      rawAddress: item.address,
      type: item.type,
      boundingBox: item.boundingbox,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Failed reverse geocoding:', error);
    return null;
  }
}

