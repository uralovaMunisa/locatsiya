/**
 * Free OSRM Routing Service
 * Supports driving, walking, and cycling
 */

const OSRM_PROFILES = {
  driving: 'driving',
  walking: 'foot',
  cycling: 'bike',
};

const routingCache = new Map();

/**
 * Get route directions between start and destination coordinates
 * @param {object} start { lat, lng }
 * @param {object} end { lat, lng }
 * @param {string} mode 'driving' | 'walking' | 'cycling'
 * @param {string} lang Language code ('uz' | 'ru' | 'en')
 */
export async function getRoute(start, end, mode = 'driving', lang = 'uz') {
  if (!start || !end || start.lat == null || start.lng == null || end.lat == null || end.lng == null) {
    throw new Error('Start and destination coordinates are required');
  }

  const profile = OSRM_PROFILES[mode] || 'driving';
  const startCoords = `${start.lng},${start.lat}`;
  const endCoords = `${end.lng},${end.lat}`;
  const cacheKey = `route:${profile}:${startCoords}:${endCoords}`;

  if (routingCache.has(cacheKey)) {
    return routingCache.get(cacheKey);
  }

  // OSRM Public Demo Server
  const url = `https://router.project-osrm.org/route/v1/${profile}/${startCoords};${endCoords}?overview=full&geometries=geojson&steps=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Routing service error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found between these points');
    }

    const route = data.routes[0];

    // Convert GeoJSON [lng, lat] coordinates to Leaflet [lat, lng] format
    const coordinates = (route.geometry?.coordinates || []).map(coord => [coord[1], coord[0]]);

    // Parse step-by-step maneuvers
    const legs = route.legs || [];
    const steps = [];

    legs.forEach(leg => {
      (leg.steps || []).forEach(step => {
        const maneuver = step.maneuver || {};
        const instruction = formatStepInstruction(maneuver, step.name, lang);
        
        steps.push({
          instruction,
          streetName: step.name || '',
          distance: step.distance, // in meters
          duration: step.duration, // in seconds
          type: maneuver.type,
          modifier: maneuver.modifier,
          location: maneuver.location ? [maneuver.location[1], maneuver.location[0]] : null, // [lat, lng]
        });
      });
    });

    const parsedRoute = {
      coordinates, // Leaflet [[lat, lng], ...]
      distance: route.distance, // Total meters
      duration: route.duration, // Total seconds
      steps,
      mode,
      summary: route.legs?.[0]?.summary || '',
      start: { lat: start.lat, lng: start.lng },
      end: { lat: end.lat, lng: end.lng },
    };

    routingCache.set(cacheKey, parsedRoute);
    return parsedRoute;
  } catch (error) {
    console.error('Error fetching route from OSRM:', error);
    throw error;
  }
}

/**
 * Format step maneuver instruction nicely according to language
 */
function formatStepInstruction(maneuver, streetName, lang) {
  const type = maneuver.type || '';
  const modifier = maneuver.modifier || '';
  const street = streetName ? `«${streetName}»` : '';

  if (type === 'depart') {
    if (lang === 'ru') return street ? `Начните движение по ${street}` : 'Начните движение';
    if (lang === 'en') return street ? `Head out on ${street}` : 'Head out';
    return street ? `${street} bo'ylab yo'lga chiqing` : 'Yo\'lga chiqing';
  }

  if (type === 'arrive') {
    if (lang === 'ru') return 'Вы прибыли в пункт назначения';
    if (lang === 'en') return 'You have arrived at your destination';
    return 'Manzilga yetib keldingiz';
  }

  if (type === 'turn' || type === 'end of road') {
    if (modifier.includes('left')) {
      if (lang === 'ru') return street ? `Поверните налево на ${street}` : 'Поверните налево';
      if (lang === 'en') return street ? `Turn left onto ${street}` : 'Turn left';
      return street ? `${street} tomon chapga buriling` : 'Chapga buriling';
    }
    if (modifier.includes('right')) {
      if (lang === 'ru') return street ? `Поверните направо на ${street}` : 'Поверните направо';
      if (lang === 'en') return street ? `Turn right onto ${street}` : 'Turn right';
      return street ? `${street} tomon o'ngga buriling` : 'O\'ngga buriling';
    }
    if (modifier.includes('straight')) {
      if (lang === 'ru') return street ? `Продолжайте прямо по ${street}` : 'Двигайтесь прямо';
      if (lang === 'en') return street ? `Continue straight onto ${street}` : 'Continue straight';
      return street ? `${street} bo'ylab to'g'ri yuring` : 'To\'g\'riga yuring';
    }
  }

  if (type === 'roundabout') {
    if (lang === 'ru') return street ? `На круговом движении съезд на ${street}` : 'Круговое движение';
    if (lang === 'en') return street ? `At the roundabout take the exit onto ${street}` : 'At the roundabout';
    return street ? `Aylanma yo'ldan ${street} ga chiqing` : 'Aylanma yo\'l bo\'ylab harakatlaning';
  }

  if (type === 'fork') {
    if (modifier.includes('left')) {
      if (lang === 'ru') return 'Держитесь левее';
      if (lang === 'en') return 'Keep left';
      return 'Chap tomonda qoling';
    }
    if (modifier.includes('right')) {
      if (lang === 'ru') return 'Держитесь правее';
      if (lang === 'en') return 'Keep right';
      return 'O\'ng tomonda qoling';
    }
  }

  if (lang === 'ru') return street ? `Следуйте по ${street}` : 'Продолжайте движение';
  if (lang === 'en') return street ? `Continue along ${street}` : 'Continue ahead';
  return street ? `${street} bo'ylab davom eting` : 'Yo\'lingizda davom eting';
}

