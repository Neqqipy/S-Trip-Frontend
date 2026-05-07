// src/services/geocodeUtils.js
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const provinceBoundsCache = {};
const HEADERS = { 'User-Agent': 'STrip-App/1.0' };

// ── Persistent cache dùng localStorage ───────────────────────
const CACHE_KEY   = 'strip_geocode_cache';
const BOUNDS_KEY  = 'strip_bounds_cache';
const CACHE_TTL   = 30 * 24 * 60 * 60 * 1000; // 30 ngày (ms)

function loadCache(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const now = Date.now();
    // Lọc bỏ entry hết hạn
    const valid = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v._expires && v._expires > now) valid[k] = v;
    }
    return valid;
  } catch { return {}; }
}

function saveCache(storageKey, cache) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cache));
  } catch (e) {
    // localStorage đầy → xóa toàn bộ cache cũ rồi thử lại
    try { localStorage.removeItem(storageKey); localStorage.setItem(storageKey, JSON.stringify(cache)); } catch {}
  }
}

// Tải cache từ localStorage khi module load
const geocodeCache = loadCache(CACHE_KEY);
const boundsCache  = loadCache(BOUNDS_KEY);

// ── Xử lý tên ─────────────────────────────────────────────────
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g,'d').replace(/Đ/g,'D');
}
function extractKeywords(name) {
  const stop = new Set(['nhà','hàng','quán','ăn','uống','điểm','khu','du',
    'lịch','đường','phố','không','gian','xưa','địa','phương','ngon','đặc','sản']);
  const words = name.split(/\s+/).filter(w => !stop.has(w.toLowerCase()) && w.length > 1);
  return words.length >= 2 ? words.join(' ') : name;
}

// ── Lấy bounding box tỉnh ─────────────────────────────────────
async function getProvinceBounds(location) {
  // 1. Kiểm tra memory cache
  if (provinceBoundsCache[location]) return provinceBoundsCache[location];

  // 2. Kiểm tra localStorage cache
  if (boundsCache[location] && boundsCache[location]._expires > Date.now()) {
    const { _expires, ...bounds } = boundsCache[location];
    provinceBoundsCache[location] = bounds;
    return bounds;
  }

  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location+', Vietnam')}&format=json&limit=1&countrycodes=vn`,
      { headers: HEADERS }
    );
    const data = await res.json();
    if (data[0]?.boundingbox) {
      const [s,n,w,e] = data[0].boundingbox;
      const b = { minLat:+s, maxLat:+n, minLng:+w, maxLng:+e, centerLat:+data[0].lat, centerLng:+data[0].lon };
      provinceBoundsCache[location] = b;
      // Lưu vào localStorage
      boundsCache[location] = { ...b, _expires: Date.now() + CACHE_TTL };
      saveCache(BOUNDS_KEY, boundsCache);
      return b;
    }
  } catch {}
  return null;
}

function inBounds(lat, lng, b) {
  if (!b) return true;
  const pad = 0.2;
  const dlat = (b.maxLat - b.minLat) * pad;
  const dlng = (b.maxLng - b.minLng) * pad;
  return lat >= b.minLat-dlat && lat <= b.maxLat+dlat
      && lng >= b.minLng-dlng && lng <= b.maxLng+dlng;
}

// ── Chiến lược 1: Nominatim ───────────────────────────────────
async function tryNominatim(query, b) {
  try {
    let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=vn&accept-language=vi`;
    if (b) url += `&viewbox=${b.minLng},${b.maxLat},${b.maxLng},${b.minLat}&bounded=1`;
    const res  = await fetch(url, { headers: HEADERS });
    const data = await res.json();
    return data.find(d => inBounds(+d.lat, +d.lon, b)) || null;
  } catch { return null; }
}

// ── Chiến lược 2: Overpass API ────────────────────────────────
async function tryOverpass(name, b) {
  if (!b) return null;
  try {
    const nameLatin  = removeDiacritics(name);
    const keyword    = extractKeywords(name);
    const keyLatin   = removeDiacritics(keyword);
    const bbox       = `${b.minLat},${b.minLng},${b.maxLat},${b.maxLng}`;

    const queries = [name, nameLatin, keyword, keyLatin].filter(Boolean);
    for (const q of queries) {
      const escaped = q.replace(/"/g, '\\"');
      const overpassQ = `[out:json][timeout:10];
(
  node["name"~"${escaped}",i](${bbox});
  way["name"~"${escaped}",i](${bbox});
);
out center 5;`;
      const res  = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQ,
        headers: { 'Content-Type': 'text/plain' }
      });
      const data = await res.json();
      const elements = data.elements || [];
      for (const el of elements) {
        const lat = el.lat || el.center?.lat;
        const lng = el.lon || el.center?.lon;
        if (lat && lng && inBounds(lat, lng, b)) {
          return { lat, lon: lng };
        }
      }
      await sleep(300);
    }
  } catch {}
  return null;
}

// ── Chiến lược 3: Photon ─────────────────────────────────────
async function tryPhoton(query, b) {
  try {
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=vi`;
    if (b) url += `&lon=${(b.minLng+b.maxLng)/2}&lat=${(b.minLat+b.maxLat)/2}&zoom=11`;
    const res  = await fetch(url);
    const data = await res.json();
    for (const f of (data.features||[])) {
      const [lng, lat] = f.geometry.coordinates;
      if (inBounds(lat, lng, b)) return { lat, lon: lng };
    }
  } catch {}
  return null;
}

// ── Geocode 1 địa điểm: thử nhiều chiến lược ────────────────
async function geocodeOne(name, location, b) {
  const key = `${name}__${location}`;

  // 1. Kiểm tra memory cache
  if (geocodeCache[key] && geocodeCache[key]._expires > Date.now()) {
    const { _expires, ...coords } = geocodeCache[key];
    return coords;
  }

  const save = (hit) => {
    if (!hit) return null;
    const coords = { lat: +hit.lat, lng: +(hit.lon || hit.lng) };
    // Lưu vào memory + localStorage
    geocodeCache[key] = { ...coords, _expires: Date.now() + CACHE_TTL };
    saveCache(CACHE_KEY, geocodeCache);
    return coords;
  };

  const variants = [
    `${name}, ${location}, Vietnam`,
    `${name}, ${location}`,
    `${removeDiacritics(name)}, ${removeDiacritics(location)}, Vietnam`,
    `${extractKeywords(name)}, ${location}, Vietnam`,
  ];

  // Nominatim
  for (const q of variants) {
    const hit = await tryNominatim(q, b);
    if (hit) return save(hit);
    await sleep(350);
  }

  // Overpass
  const overpassHit = await tryOverpass(name, b);
  if (overpassHit) return save(overpassHit);
  await sleep(300);

  // Photon
  for (const q of variants.slice(0, 2)) {
    const hit = await tryPhoton(q, b);
    if (hit) return save(hit);
    await sleep(200);
  }

  return null;
}

// ── Fallback: phân tán quanh trung tâm tỉnh ─────────────────
function fallbackCoords(b, idx, total) {
  if (!b?.centerLat) return null;
  const r = 0.012;
  const a = (2 * Math.PI * idx) / Math.max(total, 1);
  return { lat: b.centerLat + r*Math.sin(a), lng: b.centerLng + r*Math.cos(a), isFallback: true };
}

// ── Export chính ─────────────────────────────────────────────
export async function enrichPlacesWithCoords(location, tours = [], foods = []) {
  const b = await getProvinceBounds(location);
  await sleep(400);

  const all = [
    ...tours.map(p => ({ ...p, _g: 'tours' })),
    ...foods.map(p => ({ ...p, _g: 'foods' })),
  ];
  const enrichedTours = [];
  const enrichedFoods = [];
  let fbIdx = 0;

  for (const place of all) {
    const eLat = place.lat || place.latitude;
    const eLng = place.lng || place.longitude;
    let result;

    if (eLat && eLng && inBounds(+eLat, +eLng, b)) {
      // Tọa độ đã có sẵn (từ SerpAPI) → dùng luôn, không geocode
      result = { ...place, lat: +eLat, lng: +eLng };
    } else {
      // Thử tìm trong localStorage cache trước khi gọi API
      const cacheKey = `${place.name}__${location}`;
      const cached = geocodeCache[cacheKey];
      if (cached && cached._expires > Date.now()) {
        result = { ...place, lat: cached.lat, lng: cached.lng };
      } else {
        const coords = await geocodeOne(place.name, location, b);
        if (coords) {
          result = { ...place, ...coords };
        } else {
          const fb = fallbackCoords(b, fbIdx++, all.length);
          result = fb ? { ...place, ...fb } : { ...place, lat: null, lng: null };
        }
      }
    }
    (place._g === 'tours' ? enrichedTours : enrichedFoods).push(result);
    await sleep(400);
  }
  return { tours: enrichedTours, foods: enrichedFoods };
}

// ── Tiện ích xóa cache (dùng khi cần debug) ──────────────────
export function clearGeocodeCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(BOUNDS_KEY);
  Object.keys(geocodeCache).forEach(k => delete geocodeCache[k]);
  Object.keys(provinceBoundsCache).forEach(k => delete provinceBoundsCache[k]);
  console.log('[Geocode] Cache đã xóa.');
}