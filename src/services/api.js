/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   S-Trip  —  API Service Layer (Frontend-Only)       ║
 * ║   Cập nhật: Smart Fallback tích hợp Hotel Database   ║
 * ╚══════════════════════════════════════════════════════╝
 */

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY || '';

// 💬 CHAT AI — Gọi API hoặc chuyển sang Fallback
export const sendChatMessage = async (messages, context = {}) => {
  if (!ANTHROPIC_KEY) {
    return smartFallbackChat(messages, context);
  }

  const tripCtx = [
    context.location && `Người dùng đang lên kế hoạch đi ${context.location}.`,
    context.budget   && `Ngân sách: ${context.budget}.`,
    context.days     && `Thời gian: ${context.days}.`,
  ].filter(Boolean).join(' ');

  const systemPrompt = `Bạn là trợ lý du lịch thông minh của S-Trip.
Nhiệm vụ: Tư vấn chính xác, ngắn gọn. Chuyên về: ẩm thực, khách sạn tại Việt Nam.${tripCtx ? '\n' + tripCtx : ''}
Luôn trả lời bằng tiếng Việt + Emoji.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method : 'POST',
      headers: {
        'Content-Type'      : 'application/json',
        'x-api-key'         : ANTHROPIC_KEY,
        'anthropic-version' : '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model     : 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system    : systemPrompt,
        messages,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return smartFallbackChat(messages, context);
    const data = await res.json();
    return { success: true, text: data.content?.[0]?.text || '' };
  } catch (err) {
    return smartFallbackChat(messages, context);
  }
};

// ── Fallback thông minh: Lấy dữ liệu thật từ Mock Database ──
const smartFallbackChat = (messages, context) => {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || '';
  const loc  = context.location || 'điểm đến';

  // Logic bốc dữ liệu khách sạn từ Database
  const hotelKey = Object.keys(HOTEL_DATABASE).find(k => loc.includes(k));
  const hotels = hotelKey ? HOTEL_DATABASE[hotelKey] : DEFAULT_HOTELS;
  const hotelSuggestions = hotels.slice(0, 3)
    .map(h => `• ${h.name} (${h.rating}⭐) - khoảng ${h.price}`)
    .join('\n');

  const replies = [
    { 
      keys: ['khách sạn', 'hotel', 'ở đâu', 'nghỉ'],
      text: `🏨 Với ngân sách ${context.budget || 'của bạn'}, mình gợi ý vài chỗ ở "xịn" tại ${loc}:\n${hotelSuggestions}\n\nCác resort này thường có buffet sáng rất ngon, Nhi cân nhắc nhé! 😊` 
    },
    { 
      keys: ['ăn', 'quán', 'đặc sản', 'ngon', 'food'],
      text: `🍜 ${loc} có rất nhiều món ngon! Bạn nên thử ẩm thực đường phố vào buổi tối — vừa rẻ vừa đúng vị địa phương. Đừng quên thử các quán nhỏ ven đường nhé 🌟` 
    },
    { 
      keys: ['tham quan', 'chơi', 'đi đâu', 'cảnh'],
      text: `🗺️ Ở ${loc}, đừng bỏ qua các điểm check-in nổi tiếng. Đi sớm buổi sáng sẽ vắng khách và chụp ảnh đẹp hơn nhiều đó 📸` 
    },
    { 
      keys: ['thời tiết', 'nắng', 'mưa', 'mùa'],
      text: `☀️ ${loc} hiện tại thời tiết khá đẹp để đi chơi. Tuy nhiên Nhi nhớ mang theo ô hoặc áo khoác mỏng vì thời tiết vùng này hay thay đổi đột ngột nhé! 🌤️` 
    }
  ];

  for (const r of replies) {
    if (r.keys.some(k => last.includes(k))) {
      return { success: true, text: r.text };
    }
  }

  return {
    success: true,
    text: `✈️ Chuyến đi ${loc} nghe rất thú vị! Hưng muốn mình tư vấn thêm về khách sạn, ẩm thực hay điểm tham quan nào tại đây không? 🌏`,
  };
};

// 🏨 HOTEL DATABASE
const HOTEL_DATABASE = {
  'Đà Lạt': [
    { name: "Colline Hotel", rating: "4.8", price: "1.200.000đ", desc: "Hiện đại, ngay trung tâm." },
    { name: "Terracotta Resort", rating: "4.7", price: "1.500.000đ", desc: "Bên hồ Tuyền Lâm." },
    { name: "Ana Mandara Villas", rating: "4.9", price: "2.500.000đ", desc: "Biệt thự Pháp cổ." }
  ],
  'Đà Nẵng': [
    { name: "Fusion Maia Resort", rating: "4.9", price: "3.800.000đ", desc: "Resort bãi biển, spa miễn phí." },
    { name: "Pullman Da Nang", rating: "4.8", price: "2.200.000đ", desc: "5 sao quốc tế." },
    { name: "Mercure Da Nang", rating: "4.6", price: "1.200.000đ", desc: "Gần cầu Rồng." }
  ],
  'Phú Quốc': [
    { name: "JW Marriott", rating: "5.0", price: "8.500.000đ", desc: "Siêu sang trọng." },
    { name: "Vinpearl Safari", rating: "4.8", price: "3.200.000đ", desc: "Kèm Safari thú vị." },
    { name: "La Veranda", rating: "4.8", price: "3.800.000đ", desc: "Kiến trúc Pháp lãng mạn." }
  ]
};

const DEFAULT_HOTELS = [
  { name: "Khách sạn 4 Sao Trung Tâm", rating: "4.7", price: "1.200.000đ" },
  { name: "Boutique Hotel Phố Cổ", rating: "4.6", price: "900.000đ" }
];

// --- CÁC HÀM MOCK KHÁC GIỮ NGUYÊN ---
export const fetchHotels = async (location = '') => {
  const key = Object.keys(HOTEL_DATABASE).find(k => location.includes(k));
  return { success: true, data: key ? HOTEL_DATABASE[key] : DEFAULT_HOTELS };
};

export const fetchAutocomplete = async (prefix) => {
  const CITIES = ["Đà Lạt", "Đà Nẵng", "Hà Nội", "Hội An", "Phú Quốc", "Nha Trang", "TP. Hồ Chí Minh"];
  const q = prefix.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const data = CITIES
    .filter(c => c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q))
    .slice(0, 5)
    .map(name => ({ name, rating: 4.5, cat: 'City' }));
  return { success: true, data };
};