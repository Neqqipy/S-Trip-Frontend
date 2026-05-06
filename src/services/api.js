// src/services/api.js
const BASE_URL = 'http://127.0.0.1:5000';

export const fetchAutocomplete = async (query) => {
  try {
    const res = await fetch(`${BASE_URL}autocomplete?q=${encodeURIComponent(query)}`);
    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) { return []; }
};

export const fetchTripPlan = async (location, budget, days = 3, origin, passengers) => {
  try {
    // Thêm origin và passengers vào Query String để Backend xử lý
    const url = `${BASE_URL}/api/plan-trip?location=${encodeURIComponent(location)}&budget=${budget}&days=${days}&origin=${encodeURIComponent(origin)}&passengers=${passengers}`;
    
    const res = await fetch(url);
    const result = await res.json();
    
    // Trả về đúng cấu trúc plan để App.js sử dụng
    return result.success ? result.plan : null;
  } catch (error) { 
    console.error("Lỗi fetchTripPlan:", error);
    return null; 
  }
};

export const sendChatMessage = async (messages, context = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const lastUserMsg = messages[messages.length - 1].content;
    const res = await fetch(`${BASE_URL}/api/chat-gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: lastUserMsg, location: context.location }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Lỗi kết nối AI:", error);
    return { success: false, text: "Mạng có chút vấn đề, bạn thử lại nhé!" };
  }
};

