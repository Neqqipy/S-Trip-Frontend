// src/services/geocodeUtils.js
// Geocode một lần khi nhận data từ backend, lưu vào searchData
// MapBubble và các component khác dùng trực tiếp lat/lng, không geocode lại

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const geocodeCache       = {};
const provinceBoundsCache = {};

// ── Lấy bounding box của tỉnh ────────────────────────────────
async function getProvinceBounds(location) {
  if (provinceBoundsCache[location]) return provinceBoundsCache[location];
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ', Vietnam')}&format=json&limit=1&countrycodes=vn`,
      { headers: { 'User-Agent': 'STrip-App/1.0' } }
    );
    const data = await res.json();
    if (data[0]?.boundingbox) {
      const [minLat, maxLat, minLng, maxLng] = data[0].boundingbox;
      const bounds = { minLat: parseFloat(minLat), maxLat: parseFloat(maxLat), minLng: parseFloat(minLng), maxLng: parseFloat(maxLng) };
      provinceBoundsCache[location] = bounds;
      return bounds;
    }
  } catch {}
  return null;
}

function isWithinBounds(lat, lng, bounds) {
  if (!bounds) return true;
  return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}

// ── Geocode 1 địa điểm, bounded trong tỉnh ───────────────────
async function geocodeOne(name, location, bounds) {
  const cacheKey = `${name}__${location}`;
  if (geocodeCache[cacheKey]) return geocodeCache[cacheKey];

  const query = `${name}, ${location}, Vietnam`;

  // Thử 1: bounded trong tỉnh
  try {
    let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=vn&accept-language=vi`;
    if (bounds) url += `&viewbox=${bounds.minLng},${bounds.maxLat},${bounds.maxLng},${bounds.minLat}&bounded=1`;
    const res  = await fetch(url, { headers: { 'User-Agent': 'STrip-App/1.0' } });
    const data = await res.json();
    const hit  = data.find(d => isWithinBounds(parseFloat(d.lat), parseFloat(d.lon), bounds));
    if (hit) {
      const coords = { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) };
      geocodeCache[cacheKey] = coords;
      return coords;
    }
  } catch {}

  await sleep(350);

  // Thử 2: bỏ bounded, vẫn validate thủ công
  try {
    const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=vn&accept-language=vi`;
    const res  = await fetch(url, { headers: { 'User-Agent': 'STrip-App/1.0' } });
    const data = await res.json();
    const hit  = data.find(d => isWithinBounds(parseFloat(d.lat), parseFloat(d.lon), bounds));
    if (hit) {
      const coords = { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) };
      geocodeCache[cacheKey] = coords;
      return coords;
    }
  } catch {}

  return null; // Không tìm được trong tỉnh → bỏ qua
}

// ── Hàm chính: enrich realTours & realFoods với lat/lng ──────
export async function enrichPlacesWithCoords(location, tours = [], foods = []) {
  const bounds = await getProvinceBounds(location);
  await sleep(400);

  const enriched = { tours: [], foods: [] };

  for (const place of tours) {
    // Nếu backend đã có tọa độ → dùng luôn
    const existingLat = place.lat || place.latitude;
    const existingLng = place.lng || place.longitude;
    if (existingLat && existingLng) {
      enriched.tours.push({ ...place, lat: parseFloat(existingLat), lng: parseFloat(existingLng) });
    } else {
      const coords = await geocodeOne(place.name, location, bounds);
      enriched.tours.push(coords ? { ...place, ...coords } : { ...place, lat: null, lng: null });
    }
    await sleep(500);
  }

  for (const place of foods) {
    const existingLat = place.lat || place.latitude;
    const existingLng = place.lng || place.longitude;
    if (existingLat && existingLng) {
      enriched.foods.push({ ...place, lat: parseFloat(existingLat), lng: parseFloat(existingLng) });
    } else {
      const coords = await geocodeOne(place.name, location, bounds);
      enriched.foods.push(coords ? { ...place, ...coords } : { ...place, lat: null, lng: null });
    }
    await sleep(500);
  }

  return enriched;
}