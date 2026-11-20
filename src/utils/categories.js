import React from 'react';
import { 
  Utensils, 
  Coffee, 
  HeartPulse, 
  Pill, 
  Trees, 
  Landmark, 
  ShoppingBag, 
  Hotel, 
  Fuel, 
  Building2, 
  GraduationCap, 
  Car, 
  MapPin, 
  Compass, 
  Plane, 
  Train 
} from 'lucide-react';

export const CATEGORY_CONFIG = {
  restaurant: {
    id: 'restaurant',
    labelKey: 'restaurant',
    icon: Utensils,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
    pinColor: '#f97316',
  },
  cafe: {
    id: 'cafe',
    labelKey: 'cafe',
    icon: Coffee,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    pinColor: '#d97706',
  },
  hospital: {
    id: 'hospital',
    labelKey: 'hospital',
    icon: HeartPulse,
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    pinColor: '#f43f5e',
  },
  pharmacy: {
    id: 'pharmacy',
    labelKey: 'pharmacy',
    icon: Pill,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    pinColor: '#10b981',
  },
  park: {
    id: 'park',
    labelKey: 'park',
    icon: Trees,
    color: 'text-green-600 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800',
    pinColor: '#16a34a',
  },
  attraction: {
    id: 'attraction',
    labelKey: 'attraction',
    icon: Landmark,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
    pinColor: '#a855f7',
  },
  shop: {
    id: 'shop',
    labelKey: 'shop',
    icon: ShoppingBag,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    pinColor: '#3b82f6',
  },
  hotel: {
    id: 'hotel',
    labelKey: 'hotel',
    icon: Hotel,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
    pinColor: '#6366f1',
  },
  fuel: {
    id: 'fuel',
    labelKey: 'fuel',
    icon: Fuel,
    color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800',
    pinColor: '#ca8a04',
  },
  bank: {
    id: 'bank',
    labelKey: 'bank',
    icon: Building2,
    color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
    pinColor: '#0d9488',
  },
  education: {
    id: 'education',
    labelKey: 'education',
    icon: GraduationCap,
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
    pinColor: '#0284c7',
  },
  default: {
    id: 'default',
    labelKey: 'placeDetails',
    icon: MapPin,
    color: 'text-primary-600 bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800',
    pinColor: '#4f46e5',
  }
};

/**
 * Determine category key from Nominatim result
 */
export function detectCategory(item) {
  if (!item) return 'default';
  
  const type = (item.type || '').toLowerCase();
  const category = (item.class || item.category || '').toLowerCase();
  const address = item.address || {};
  const name = (item.name || item.display_name || '').toLowerCase();

  if (category === 'amenity') {
    if (['restaurant', 'fast_food', 'food_court'].includes(type)) return 'restaurant';
    if (['cafe', 'bar', 'pub'].includes(type)) return 'cafe';
    if (['hospital', 'clinic', 'doctors'].includes(type)) return 'hospital';
    if (['pharmacy'].includes(type)) return 'pharmacy';
    if (['bank', 'atm'].includes(type)) return 'bank';
    if (['fuel', 'charging_station'].includes(type)) return 'fuel';
    if (['school', 'university', 'college'].includes(type)) return 'education';
  }

  if (category === 'tourism') {
    if (['hotel', 'motel', 'guest_house', 'hostel'].includes(type)) return 'hotel';
    if (['museum', 'monument', 'artwork', 'viewpoint', 'attraction'].includes(type)) return 'attraction';
  }

  if (category === 'leisure') {
    if (['park', 'garden', 'nature_reserve'].includes(type)) return 'park';
  }

  if (category === 'shop') return 'shop';
  if (category === 'historic') return 'attraction';

  // Keyword check in name as fallback
  if (name.includes('restoran') || name.includes('oshxona') || name.includes('choyxona') || name.includes('restaurant')) return 'restaurant';
  if (name.includes('qahva') || name.includes('kofe') || name.includes('cafe') || name.includes('coffee')) return 'cafe';
  if (name.includes('shifoxona') || name.includes('klinika') || name.includes('hospital') || name.includes('balnitsa')) return 'hospital';
  if (name.includes('dorixona') || name.includes('apteka') || name.includes('pharmacy')) return 'pharmacy';
  if (name.includes('bog\'') || name.includes('bog‘') || name.includes('park') || name.includes('xiyobon')) return 'park';
  if (name.includes('mehmonxona') || name.includes('hotel')) return 'hotel';
  if (name.includes('zapravka') || name.includes('yoqilg\'i') || name.includes('benzin') || name.includes('gaz')) return 'fuel';
  if (name.includes('maktab') || name.includes('litsey') || name.includes('institut') || name.includes('universitet')) return 'education';
  if (name.includes('bozor') || name.includes('market') || name.includes('do\'kon') || name.includes('supermarket')) return 'shop';

  return 'default';
}

