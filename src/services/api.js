// src/services/api.js
const BASE_URL = 'https://urban-engine-pj56vg6pp4jw364p7-5000.app.github.dev/'; // proxy qua React dev server

export const fetchAutocomplete = async (query) => {
  try {
    const res = await fetch(`${BASE_URL}/autocomplete?q=${encodeURIComponent(query)}`);
    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) { return []; }
};

export const fetchTripPlan = async (location, budget, days, origin, passengers, departureDate) => {
  try {
    const cleanDays   = parseInt(days) || 3;
    const cleanBudget = budget.toString().replace(/\D/g, "");
    const url = `${BASE_URL}/api/plan-trip?location=${encodeURIComponent(location)}&budget=${cleanBudget}&days=${cleanDays}&origin=${encodeURIComponent(origin)}&passengers=${passengers}&departure_date=${departureDate}`;
    const res    = await fetch(url);
    const result = await res.json();
    return result.success ? result.plan : null;
  } catch (error) {
    console.error("Lỗi fetchTripPlan:", error);
    return null;
  }
};

export const fetchDirections = async (origin, destination) => {
  try {
    const url  = `${BASE_URL}/api/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    const res  = await fetch(url);
    const data = await res.json();
    return data.success ? data.modes : [];
  } catch (e) {
    console.error("Lỗi fetchDirections:", e);
    return [];
  }
};

export const sendChatMessage = async (messages, context = {}) => {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 60000);
  try {
    const lastUserMsg = messages[messages.length - 1].content;
    const res = await fetch(`${BASE_URL}/api/chat-gemini`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message: lastUserMsg, location: context.location }),
      signal:  controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Lỗi kết nối AI:", error);
    return { success: false, text: "Mạng có chút vấn đề, bạn thử lại nhé!" };
  }
};

const reviewsCache = {};
const imagesCache = {};
const pendingReviews = {};
const pendingImages = {};

export const fetchReviews = async (place, placeId = '') => {
  const cacheKey = placeId || place;
  
  // Nếu đã có trong RAM (do nãy vừa mở modal xong đóng lại), lấy ra dùng luôn
  if (reviewsCache[cacheKey]) return reviewsCache[cacheKey];
  if (pendingReviews[cacheKey]) return pendingReviews[cacheKey];

  const fetchPromise = (async () => {
    try {
      const params = new URLSearchParams({ place });
      if (placeId) params.append('place_id', placeId);
      const res = await fetch(`${BASE_URL}/api/reviews?${params}`);
      const data = await res.json();
      const result = data.success ? data : { reviews: [] };
      
      reviewsCache[cacheKey] = result; 
      return result;
    } catch (e) {
      return { reviews: [] };
    } finally {
      delete pendingReviews[cacheKey];
    }
  })();

  pendingReviews[cacheKey] = fetchPromise;
  return fetchPromise;
};

export const fetchProvinceImages = async (place) => {
  try {
    const res = await fetch(`${BASE_URL}/api/province-images?place=${encodeURIComponent(place)}`);
    const data = await res.json();
    return data.success ? data.images : [];
  } catch (e) {
    console.error("Lỗi fetchProvinceImages:", e);
    return [];
  }
};

export const fetchWeather = async (location, departureDate = '') => {
  // Guard: không gọi nếu location rỗng hoặc không phải string
  if (!location || typeof location !== 'string' || !location.trim()) {
    console.warn('[fetchWeather] location không hợp lệ:', location);
    return null;
  }
  const cleanLocation = location.trim();
  const dateParam = departureDate ? `&departure_date=${departureDate}` : '';
  const url = `${BASE_URL}/api/weather?location=${encodeURIComponent(cleanLocation)}${dateParam}`;
  console.log('[fetchWeather] Gọi:', url);
  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (!data.success) {
      console.warn('[fetchWeather] API trả lỗi:', data.error, '| error_code:', data.error_code);
    }
    return data.success ? data : null;
  } catch (e) {
    console.error('[fetchWeather] Lỗi fetch:', e);
    return null;
  }
};

export const fetchImages = async (place, placeId = '') => {
  const cacheKey = placeId || place;
  
  if (imagesCache[cacheKey]) return imagesCache[cacheKey];
  if (pendingImages[cacheKey]) return pendingImages[cacheKey];

  const fetchPromise = (async () => {
    try {
      const params = new URLSearchParams({ place });
      if (placeId) params.append('place_id', placeId);
      const res = await fetch(`${BASE_URL}/api/images?${params}`);
      const data = await res.json();
      const result = data.success ? data : { images: [] };
      
      imagesCache[cacheKey] = result;
      return result;
    } catch (e) {
      return { images: [] };
    } finally {
      delete pendingImages[cacheKey];
    }
  })();

  pendingImages[cacheKey] = fetchPromise;
  return fetchPromise;
};

// ─────────────────────────────────────────────────────────────
// 🔖 SAVED PLACES — kết nối Supabase qua Flask backend
// ─────────────────────────────────────────────────────────────

export const fetchSavedPlaces = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/saved-places`, { credentials: 'include' });
    const data = await res.json();
    return data.success ? data.savedPlaces : [];
  } catch (e) {
    console.error('Lỗi fetchSavedPlaces:', e);
    return [];
  }
};

export const addSavedPlace = async ({ name, location = '', rating = '', thumbnail = '', type = 'default' }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/saved-places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, location, rating: String(rating), thumbnail, type }),
    });
    const data = await res.json();
    return data.success ? data : { success: false };
  } catch (e) {
    console.error('Lỗi addSavedPlace:', e);
    return { success: false };
  }
};

export const deleteSavedPlace = async (name, location = '') => {
  try {
    const res = await fetch(`${BASE_URL}/api/saved-places/remove-by-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, location }),
    });
    const data = await res.json();
    return data.success ? data : { success: false };
  } catch (e) {
    console.error('Lỗi deleteSavedPlace:', e);
    return { success: false };
  }
};

export const checkPlaceSavedStatus = async (name, location = '') => {
  try {
    const params = new URLSearchParams({ name });
    if (location) params.append('location', location);
    const res = await fetch(`${BASE_URL}/api/saved-places/check?${params}`, { credentials: 'include' });
    const data = await res.json();
    return data.success ? data.isSaved : false;
  } catch (e) {
    console.error('Lỗi checkPlaceSavedStatus:', e);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────
// 🗺️ TRIPS — lịch trình theo tài khoản
// ─────────────────────────────────────────────────────────────

export const fetchMyTrips = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/my-trips`, { credentials: 'include' });
    const data = await res.json();
    return data.success ? data.trips : [];
  } catch (e) {
    console.error('Lỗi fetchMyTrips:', e);
    return [];
  }
};

export const fetchTripById = async (tripId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/trip/${tripId}`, { credentials: 'include' });
    const data = await res.json();
    return data.success ? data : null;
  } catch (e) {
    console.error('Lỗi fetchTripById:', e);
    return null;
  }
};

export const deleteTrip = async (tripId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/my-trips/${tripId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    return data.success ? data : { success: false };
  } catch (e) {
    console.error('Lỗi deleteTrip:', e);
    return { success: false };
  }
};

// ─────────────────────────────────────────────────────────────
// 🔍 SEARCH HISTORY — lịch sử tìm kiếm theo tài khoản
// ─────────────────────────────────────────────────────────────

export const fetchSearchHistory = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/search-history`, { credentials: 'include' });
    const data = await res.json();
    return data.success ? data.history : [];
  } catch (e) {
    console.error('Lỗi fetchSearchHistory:', e);
    return [];
  }
};

// Gọi hàm này mỗi khi user bấm nút tìm kiếm
export const saveSearchHistory = async ({ location, origin = '', budget = 0, days = 3, passengers = 1, departure_date = '' }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/search-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ location, origin, budget, days, passengers, departure_date }),
    });
    const data = await res.json();
    return data.success ? data : { success: false };
  } catch (e) {
    console.error('Lỗi saveSearchHistory:', e);
    return { success: false };
  }
};

export const deleteSearchHistory = async (historyId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/search-history/${historyId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    return data.success ? data : { success: false };
  } catch (e) {
    console.error('Lỗi deleteSearchHistory:', e);
    return { success: false };
  }
};

export const clearSearchHistory = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/search-history/clear`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    return data.success ? data : { success: false };
  } catch (e) {
    console.error('Lỗi clearSearchHistory:', e);
    return { success: false };
  }
};