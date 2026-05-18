import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWandMagicSparkles, faHotel, faUtensils, faMapLocationDot,
  faPenToSquare, faStar, faXmark, faLocationArrow, faPlane,
  faSun, faCloudSun, faMoon, faMap, faImages, faComments, faSpinner,
  faUsers, faBed, faHome, faUserGroup,
  faBookmark as faBookmarkSolid,
  faHeart as faHeartSolid,
  faMugHot, faChevronLeft, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { 
  faCalendar as faRegularCalendar,
  faBookmark as faBookmarkRegular,
  faHeart as faHeartRegular
 } from '@fortawesome/free-regular-svg-icons';
import { fetchReviews, fetchImages, fetchWeather } from '../services/api';

// 🖼️ Proxy ảnh Google qua backend để tránh bị chặn hotlink
const BASE_URL = 'http://localhost:5000';
const GOOGLE_IMG_DOMAINS = ['googleusercontent.com', 'ggpht.com', 'googleapis.com', 'googleapi'];
const proxyImage = (url) => {
  if (!url) return null;
  if (url.includes('placehold.co') || url.includes('placeholder')) return url;
  if (GOOGLE_IMG_DOMAINS.some(d => url.includes(d))) {
    return `${BASE_URL}/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
};

// 📦 Mock data dự phòng
const mockRepo = {
  'Khách sạn': [
    { name: "Colline Hotel", rating: "4.8", price: "1.200.000đ/đêm", desc: "Khách sạn 4 sao hiện đại ngay trung tâm." },
    { name: "Terracotta Resort", rating: "4.7", price: "1.500.000đ/đêm", desc: "Không gian xanh mát bên bờ hồ." }
  ],
  'Điểm tham quan': [
    { name: "Địa điểm tham quan 1", rating: "4.8", price: "150.000đ", desc: "Địa điểm nổi tiếng tại điểm đến." },
    { name: "Địa điểm tham quan 2", rating: "4.5", price: "200.000đ", desc: "Trải nghiệm độc đáo không thể bỏ qua." },
    { name: "Địa điểm tham quan 3", rating: "4.7", price: "170.000đ", desc: "Khám phá vẻ đẹp thiên nhiên." }
  ],
  'Địa điểm ăn uống': [
    { name: "Nhà hàng địa phương 1", rating: "4.6", price: "250.000đ", desc: "Đặc sản địa phương đậm đà hương vị." },
    { name: "Quán ăn ngon 2", rating: "4.7", price: "80.000đ", desc: "Món ăn truyền thống giá bình dân." },
    { name: "Quán ăn ngon 3", rating: "4.8", price: "120.000đ", desc: "Ẩm thực đặc trưng vùng miền." }
  ]
};

const normalizeActivity = (item) => ({
  name: item.name,
  rating: item.rating || "4.5",
  price: item.price || "Giá tùy chọn",
  desc: item.desc || "",
  thumbnail: item.thumbnail || null,
  lat: item.lat || item.latitude || null,
  lng: item.lng || item.longitude || null,
  place_id: item.place_id || "",
});

// 💾 Cache toàn cục — tránh gọi API lại khi đã fetch
const panelCache = {};

// ─────────────────────────────────────────────────────────────
// 🧋 DRINKS PANEL — drawer bên trái lịch trình
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// 🔀 usePanelResize — drag cạnh phải để thay đổi độ rộng panel
// ─────────────────────────────────────────────────────────────
const usePanelResize = (minPct = 20, maxPct = 50, defaultPct = 30) => {
  const [widthPct, setWidthPct] = useState(defaultPct);
  const dragging = useRef(false);
  const startX   = useRef(0);
  const startPct = useRef(defaultPct);

  const onMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    startX.current   = e.clientX;
    startPct.current = widthPct;
    document.body.style.cursor     = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx     = e.clientX - startX.current;
      const vw     = window.innerWidth;
      const newPct = Math.min(maxPct, Math.max(minPct, startPct.current + (dx / vw) * 100));
      setWidthPct(newPct);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [minPct, maxPct]);

  return { widthPct, onMouseDown };
};

const DrinksPanel = ({ location, isOpen, onClose, isDark }) => {
  const cacheKey = `drinks:${location}`;
  const [drinks,  setDrinks]  = useState(panelCache[cacheKey] || []);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [fetched, setFetched] = useState(!!(panelCache[cacheKey]?.length > 0));
  const { widthPct: dpWidth, onMouseDown: dpDragStart } = usePanelResize(30, 40, 35);

  // Fetch khi mở lần đầu
  useEffect(() => {
    if (!isOpen || fetched) return;
    setLoading(true); setError('');
    fetch(`${BASE_URL}/api/activities?location=${encodeURIComponent(location)}&type=${encodeURIComponent('Quán cà phê đồ uống')}`)
      .then(r => r.json())
      .then(d => {
        const results = d.results || [];
        if (results.length > 0) panelCache[cacheKey] = results;
        setDrinks(results);
        setFetched(true);
      })
      .catch(() => setError('Không thể tải dữ liệu đồ uống.'))
      .finally(() => setLoading(false));
  }, [isOpen, location, fetched]);

  // Lock scroll khi mở
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Đóng bằng ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <>
      <style>{`
        @keyframes dpFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes dpSlideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes dpSlideOut{ from{transform:translateX(0)} to{transform:translateX(-100%)} }
        .dp-overlay { animation: dpFadeIn 0.2s ease forwards; }
        .dp-panel   { animation: ${isOpen ? 'dpSlideIn' : 'dpSlideOut'} 0.3s cubic-bezier(.22,1,.36,1) forwards; }
        .dp-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10); transform: translateY(-3px); }
        .dp-card { transition: all 0.25s ease; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Overlay mờ */}
      <div
        className="dp-overlay"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div
        className="dp-panel"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: `${dpWidth}vw`,
          minWidth: '260px',
          backgroundColor: isDark ? '#111827' : 'white', // ✅ Đổi màu
          zIndex: 100000,
          display: 'flex', flexDirection: 'column',
          boxShadow: '8px 0 40px rgba(0,0,0,0.18)',
          overflow: 'hidden'
        }}
      >
        {/* Drag handle */}
        <div
          onMouseDown={dpDragStart}
          title="Kéo để thay đổi kích thước"
          style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: 14, cursor: 'ew-resize', zIndex: 10,
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ width: 3, height: 40, borderRadius: 99, background: 'rgba(16,185,129,0.5)' }} />
        </div>
        {/* Header */}
        <div style={{
          padding: '24px 22px 16px',
          paddingRight: '32px',
          background: isDark ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', // ✅ Đổi màu
          borderBottom: isDark ? '1px solid #065f46' : '1px solid #d1fae5', // ✅ Đổi màu
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              }}>
                <FontAwesomeIcon icon={faMugHot} style={{ color: 'white', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: isDark ? '#ffffff' : '#065f46' }}>Đồ uống & Cà phê</div> {/* ✅ Đổi màu */}
                <div style={{ fontSize: 12, color: '#6ee7b7' }}>Quán ngon tại {location}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', background: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)', // ✅ Đổi màu
                color: isDark ? '#34d399' : '#059669', cursor: 'pointer', // ✅ Đổi màu
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: '0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)'}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Số lượng kết quả */}
          {!loading && drinks.length > 0 && (
            <div style={{
              marginTop: 12, padding: '6px 12px', borderRadius: 20,
              background: 'rgba(16,185,129,0.1)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                🧋 {drinks.length} quán được tìm thấy
              </span>
            </div>
          )}
        </div>

        {/* Body — danh sách quán */}
        <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', paddingRight: '10px', marginRight: '14px' }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, height: 220, color: '#9ca3af' }}>
              <FontAwesomeIcon icon={faSpinner} style={{ fontSize: 30, color: '#10b981', animation: 'rvSpin 1s linear infinite' }} />
              <div style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 600 }}>Đang tìm quán ngon...</div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>☕</div>
              <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600 }}>{error}</div>
              <button
                onClick={() => { setFetched(false); }}
                style={{ marginTop: 14, padding: '8px 18px', borderRadius: 10, border: 'none', background: '#10b981', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && drinks.length === 0 && fetched && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14 }}>Chưa tìm thấy quán đồ uống nào.</div>
            </div>
          )}

          {/* Danh sách */}
          {!loading && !error && drinks.map((d, i) => (
            <DrinkCard key={i} item={d} location={location} isDark={isDark} /> // ✅ Truyền isDark
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 18px', borderTop: isDark ? '1px solid #1e293b' : '1px solid #f0fdf4', // ✅ Đổi màu
          flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: isDark ? '#0f172a' : '#f9fafb', // ✅ Đổi màu
        }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>Dữ liệu từ Google Maps · SerpAPI</span>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px', borderRadius: 10, border: 'none',
              background: '#10b981', color: 'white', fontWeight: 700,
              fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 10 }} /> Đóng
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

// ─────────────────────────────────────────────────────────────
// 🧃 DRINK CARD — card cho từng quán đồ uống
// ─────────────────────────────────────────────────────────────
const DrinkCard = ({ item, location, isDark }) => { // ✅ Thêm isDark
  const [saved, setSaved] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [fallbackImg, setFallbackImg] = useState(null);

  // Khi ảnh thumbnail lỗi → thử reviews trước, rồi mới images (tuần tự, tránh gọi thừa)
  const handleImgError = async () => {
    setImgError(true);
    try {
      const revData = await fetchReviews(item.name, item.place_id || '');
      const photos = (revData?.reviews || []).flatMap(r => r.photos || []);
      if (photos.length > 0) { setFallbackImg(photos[0]); return; }
      const imgData = await fetchImages(item.name, item.place_id || '');
      const imgs = imgData?.images || [];
      if (imgs.length > 0) setFallbackImg(imgs[0]);
    } catch (_) {}
  };

  const displayImg = !imgError ? proxyImage(item.thumbnail) : (fallbackImg ? proxyImage(fallbackImg) : null);

  return (
    <>
      <div
        className="dp-card"
        style={{
          backgroundColor: isDark ? '#1e293b' : 'white', // ✅ Đổi màu
          borderRadius: 18,
          border: isDark ? '1px solid #334155' : '1px solid #f1f5f9', // ✅ Đổi màu
          padding: '14px',
          marginBottom: 12,
          display: 'flex', gap: 14,
          position: 'relative',
          cursor: 'default',
        }}
      >
        {/* Bookmark */}
        <button
          onClick={() => setSaved(!saved)}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 30, height: 30, borderRadius: 8,
            border: 'none', background: saved ? (isDark ? '#854d0e' : '#fef08a') : (isDark ? '#334155' : '#f8fafc'), // ✅ Đổi màu
            color: saved ? (isDark ? '#fde047' : '#eab308') : '#9ca3af', // ✅ Đổi màu
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, transition: '0.2s', zIndex: 2,
          }}
        >
          <FontAwesomeIcon icon={saved ? faBookmarkSolid : faBookmarkRegular} />
        </button>

        {/* Ảnh */}
        <div style={{
          width: 80, height: 80, flexShrink: 0,
          borderRadius: 12, overflow: 'hidden',
          background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {(item.thumbnail || fallbackImg) && displayImg ? (
            <img
              src={displayImg}
              alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={imgError ? undefined : handleImgError}
            />
          ) : (
            <FontAwesomeIcon icon={faMugHot} style={{ fontSize: 28, color: '#10b981' }} />
          )}
        </div>

        {/* Nội dung */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
          {/* Badge loại */}
          <div style={{
            fontSize: 10, fontWeight: 800, color: '#059669',
            textTransform: 'uppercase', letterSpacing: '0.4px',
            marginBottom: 3,
          }}>
            🧋 Đồ uống & Cà phê
          </div>

          {/* Tên */}
          <div style={{
            fontSize: 15, fontWeight: 900, color: isDark ? '#f8fafc' : '#111827', // ✅ Đổi màu
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            lineHeight: 1.35, marginBottom: 4,
          }}>
            {item.name}
          </div>

          {/* Rating + Giá */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
              ⭐ {item.rating || 'N/A'}
            </span>
            {item.price && item.price !== 'Giá tùy chọn' && (
              <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700 }}>{item.price}</span>
            )}
          </div>

          {/* Mô tả */}
          {item.desc && (
            <div style={{
              fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.4, // ✅ Đổi màu
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              marginBottom: 8,
            }}>
              {item.desc}
            </div>
          )}

          {/* Nút hành động */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setMapOpen(true)}
              style={{
                padding: '5px 12px', borderRadius: 8, border: 'none',
                background: '#3b82f6', color: 'white',
                fontWeight: 700, fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <FontAwesomeIcon icon={faLocationArrow} style={{ fontSize: 9 }} /> Vị trí
            </button>
            <button
              onClick={() => setReviewsOpen(true)}
              style={{
                padding: '5px 12px', borderRadius: 8,
                border: '1.5px solid #0d9488',
                background: isDark ? '#111827' : 'white', color: '#0d9488', // ✅ Đổi màu
                fontWeight: 700, fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                transition: '0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#111827' : 'white'; e.currentTarget.style.color = '#0d9488'; }} // ✅ Đổi màu hover
            >
              <FontAwesomeIcon icon={faStar} style={{ fontSize: 9 }} /> Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Mini map popup */}
      {mapOpen && (
        <MapModal
          placeName={item.name}
          query={`${item.name} ${location}`}
          onClose={() => setMapOpen(false)}
        />
      )}
      {reviewsOpen && (
        <ReviewsModal
          placeName={item.name}
          placeId={item.place_id || ''}
          onClose={() => setReviewsOpen(false)}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// 🍜 SPECIALTIES PANEL — drawer đặc sản địa phương
// ─────────────────────────────────────────────────────────────
// 📦 Dữ liệu đặc sản tĩnh theo tỉnh thành (không cần API)
const SPECIALTIES_DB = {
  'đà lạt': { items: ['Mứt dâu tây', 'Rượu vang Đà Lạt', 'Atiso sấy khô', 'Hồng sấy dẻo', 'Mắc ca rang muối', 'Trà Ô Long', 'Bánh tráng nướng', 'Cà phê chồn'], tip: 'Mua tại chợ Đà Lạt hoặc các shop ven đường Phan Đình Phùng để được giá tốt hơn.' },
  'hội an': { items: ['Cao lầu khô', 'Bánh đậu xanh', 'Cơm gà Hội An', 'Mì Quảng sấy', 'Bánh in', 'Chè đậu ván', 'Đèn lồng thủ công', 'Tơ lụa Mã Châu'], tip: 'Phố cổ bán hàng lưu niệm giá cao hơn, ra ngoài chợ Hội An để mua đặc sản thực phẩm.' },
  'hà nội': { items: ['Phở bò khô', 'Bánh cốm', 'Chả cá Lã Vọng', 'Ô mai mơ', 'Rượu nếp cẩm', 'Kẹo lạc', 'Cốm làng Vòng', 'Bánh cuốn Thanh Trì'], tip: 'Phố Hàng Đường chuyên kẹo bánh, Hàng Buồm có nhiều đặc sản khô đóng hộp tiện làm quà.' },
  'hồ chí minh': { items: ['Bánh tráng phơi sương Tây Ninh', 'Mắm tôm chà Gò Công', 'Bánh pía Sóc Trăng', 'Muối tôm', 'Kẹo dừa Bến Tre', 'Cà phê Trung Nguyên', 'Bì cuốn', 'Tương hoisin'], tip: 'Siêu thị Co.opmart hoặc chợ Bình Tây là nơi mua đặc sản miền Nam với giá ổn định.' },
  'sài gòn': { items: ['Bánh tráng phơi sương', 'Mắm tôm chà', 'Kẹo dừa Bến Tre', 'Muối tôm', 'Cà phê Trung Nguyên', 'Bánh pía', 'Bì cuốn', 'Tương đen'], tip: 'Chợ Bình Tây và siêu thị Co.opmart là điểm mua đặc sản Nam Bộ giá tốt nhất.' },
  'đà nẵng': { items: ['Mì Quảng', 'Bánh tráng cuốn thịt heo', 'Nước mắm Nam Ô', 'Bánh khô mè', 'Mắm cá cơm', 'Bê thui Cầu Mống', 'Chả bò Đà Nẵng', 'Bánh ướt'], tip: 'Chợ Hàn và chợ Cồn là nơi lý tưởng mua đặc sản tươi và khô mang về.' },
  'nha trang': { items: ['Tôm hùm khô', 'Mực một nắng', 'Yến sào Khánh Hòa', 'Nước mắm Phan Thiết', 'Bánh căn', 'Chả cá Nha Trang', 'Rong biển sấy', 'Nem Ninh Hòa'], tip: 'Mua hải sản khô tại chợ Đầm hoặc cảng Cầu Đá để đảm bảo tươi ngon và giá gốc.' },
  'phú quốc': { items: ['Nước mắm Phú Quốc', 'Tiêu Phú Quốc', 'Rượu sim', 'Khô mực', 'Ngọc trai', 'Cá trích rim', 'Nhum biển sấy', 'Mật ong rừng'], tip: 'Nước mắm Phú Quốc chỉ đúng chuẩn khi mua tại xưởng sản xuất hoặc chợ Dương Đông.' },
  'huế': { items: ['Mè xửng', 'Bánh in Huế', 'Tôm chua', 'Ruốc Huế', 'Mắm sả ớt', 'Bánh đậu xanh', 'Chè hạt sen', 'Nón lá Thủy Thanh'], tip: 'Đường Đinh Tiên Hoàng có nhiều tiệm bán đặc sản Huế chính gốc, tránh hàng nhái ở phố du lịch.' },
  'sapa': { items: ['Thịt lợn gác bếp', 'Rượu táo mèo', 'Cá suối một nắng', 'Chè Shan Tuyết', 'Thảo quả', 'Mật ong bạc hà', 'Miến dong', 'Vải thổ cẩm'], tip: 'Mua tại chợ phiên bản địa cuối tuần để có hàng thủ công thật và giá người dân tộc.' },
  'phan thiết': { items: ['Nước mắm Phan Thiết', 'Bánh rế', 'Mực khô Bình Thuận', 'Thanh long ruột đỏ', 'Cá mai khô', 'Bánh tráng Bình Thuận', 'Rượu cần', 'Hải sản khô'], tip: 'Nước mắm Phan Thiết mua tại các cơ sở sản xuất ven biển sẽ đặc và thơm hơn ngoài siêu thị.' },
  'cần thơ': { items: ['Bánh cống', 'Cá khô sặt', 'Nem Lai Vung', 'Kẹo dừa', 'Khô cá lóc', 'Rượu nếp than', 'Bánh tét lá cẩm', 'Mắm cá linh'], tip: 'Chợ nổi Cái Răng và chợ An Bình có nhiều đặc sản miền Tây tươi ngon giá hợp lý.' },
};

// Tìm đặc sản phù hợp với location (tìm kiếm mờ)
const normalizeTextForMatch = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]/g, '');

const getLocalSpecialties = (location) => {
  if (!location) return null;
  const locNorm = normalizeTextForMatch(location);
  const entries = Object.entries(SPECIALTIES_DB);
  for (const [key, val] of entries) {
    const keyNorm = normalizeTextForMatch(key);
    // Nhờ xóa khoảng trắng, "ho chi minh" hay "hochiminh" đều sẽ khớp với nhau
    if (locNorm.includes(keyNorm) || keyNorm.includes(locNorm)) return val;
  }
  return null;
};

// ─────────────────────────────────────────────────────────────
const SpecialtiesPanel = ({ location, isOpen, onClose, isDark }) => {
  const cacheKey = `specialties:${location}`;
  const [specialties, setSpecialties] = useState(panelCache[cacheKey] || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(!!(panelCache[cacheKey]?.length > 0));
  const { widthPct: spWidth, onMouseDown: spDragStart } = usePanelResize(30, 40, 35);

  const localTips = getLocalSpecialties(location);

  // Fetch danh sách cửa hàng
  useEffect(() => {
    if (!isOpen || fetched) return;
    setLoading(true); setError('');
    fetch(`${BASE_URL}/api/activities?location=${encodeURIComponent(location)}&type=${encodeURIComponent('Đặc sản địa phương món ăn truyền thống')}`)
      .then(r => r.json())
      .then(d => {
        const results = d.results || [];
        if (results.length > 0) panelCache[cacheKey] = results;
        setSpecialties(results);
        setFetched(true);
      })
      .catch(() => setError('Không thể tải dữ liệu đặc sản.'))
      .finally(() => setLoading(false));
  }, [isOpen, location, fetched]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <>
      <style>{`
        @keyframes spFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes spSlideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        .sp-overlay { animation: spFadeIn 0.2s ease forwards; }
        .sp-panel   { animation: spSlideIn 0.3s cubic-bezier(.22,1,.36,1) forwards; }
        .sp-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10); transform: translateY(-3px); }
        .sp-card { transition: all 0.25s ease; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div className="sp-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} />

      <div className="sp-panel" onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: `${spWidth}vw`, minWidth: '260px', backgroundColor: isDark ? '#111827' : 'white', zIndex: 100000, display: 'flex', flexDirection: 'column', boxShadow: '8px 0 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}> {/* ✅ Đổi màu */}
        {/* Drag handle */}
        <div onMouseDown={spDragStart} title="Kéo để thay đổi kích thước" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 14, cursor: 'ew-resize', zIndex: 10, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.18)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: 3, height: 40, borderRadius: 99, background: 'rgba(249,115,22,0.5)' }} />
        </div>
        {/* Header */}
        <div style={{ padding: '28px 24px 20px', paddingRight: '32px', background: isDark ? '#1e293b' : 'white', borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0', flexShrink: 0, zIndex: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}> {/* ✅ Đổi màu */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
                <FontAwesomeIcon icon={faMugHot} style={{ color: 'white', fontSize: 22 }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: isDark ? '#ffffff' : '#064e3b', letterSpacing: '-0.3px' }}>Đồ uống & Cà phê</div> {/* ✅ Đổi màu */}
                <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Khám phá quán ngon tại {location}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#cbd5e1' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: '0.2s' }} onMouseEnter={e => {e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444';}} onMouseLeave={e => {e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9'; e.currentTarget.style.color = isDark ? '#cbd5e1' : '#64748b';}}> {/* ✅ Đổi màu */}
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          {!loading && specialties.length > 0 && (
            <div style={{ marginTop: 12, padding: '6px 12px', borderRadius: 20, background: 'rgba(249,115,22,0.1)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}>🍜 {specialties.length} đặc sản được tìm thấy</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', paddingRight: '10px', marginRight: '14px' }}>

          {/* 🍜 GỢI Ý ĐẶC SẢN TĨNH */}
          {localTips && (
            <div style={{ marginBottom: 16, borderRadius: 18, overflow: 'hidden', border: isDark ? '1.5px solid #9a3412' : '1.5px solid #fed7aa', boxShadow: isDark ? 'none' : '0 4px 16px rgba(249,115,22,0.10)' }}> {/* ✅ Đổi màu */}
              <div style={{ padding: '12px 16px', background: isDark ? 'linear-gradient(135deg, #c2410c, #7c2d12)' : 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', gap: 8 }}> {/* ✅ Đổi màu */}
                <span style={{ fontSize: 18 }}>🛍️</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>Nên mua gì tại {location}?</span>
              </div>
              <div style={{ padding: '12px 14px', background: isDark ? '#2a1508' : '#fff7ed' }}> {/* ✅ Đổi màu */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: localTips.tip ? 10 : 0 }}>
                  {(localTips.items || []).map((item, i) => (
                    <span key={i} style={{ padding: '5px 12px', borderRadius: 99, background: isDark ? '#111827' : 'white', border: isDark ? '1px solid #7c2d12' : '1.5px solid #fed7aa', fontSize: 12, fontWeight: 700, color: isDark ? '#fdba74' : '#9a3412', display: 'flex', alignItems: 'center', gap: 5 }}> {/* ✅ Đổi màu */}
                      <span style={{ color: '#f97316' }}>•</span> {item}
                    </span>
                  ))}
                </div>
                {localTips.tip && (
                  <div style={{ fontSize: 14, color: isDark ? '#fdba74' : '#78350f', lineHeight: 1.5, padding: '8px 10px', background: isDark ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.08)', borderRadius: 10, marginTop: 4 }}> {/* ✅ Đổi màu */}
                    💡 <em>{localTips.tip}</em>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tiêu đề danh sách cửa hàng */}
          {!loading && (specialties.length > 0 || fetched) && (
            <div style={{ fontSize: 13, fontWeight: 800, color: '#9a3412', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FontAwesomeIcon icon={faMapLocationDot} style={{ color: '#f97316' }} />
              Cửa hàng đặc sản gần đây
            </div>
          )}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, height: 220, color: '#9ca3af' }}>
              <FontAwesomeIcon icon={faSpinner} style={{ fontSize: 30, color: '#f97316', animation: 'rvSpin 1s linear infinite' }} />
              <div style={{ fontSize: 13, color: '#fb923c', fontWeight: 600 }}>Đang tìm đặc sản ngon...</div>
            </div>
          )}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🍽️</div>
              <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600 }}>{error}</div>
              <button onClick={() => setFetched(false)} style={{ marginTop: 14, padding: '8px 18px', borderRadius: 10, border: 'none', background: '#f97316', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Thử lại</button>
            </div>
          )}
          {!loading && !error && specialties.length === 0 && fetched && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14 }}>Chưa tìm thấy đặc sản nào.</div>
            </div>
          )}
          {!loading && !error && specialties.map((s, i) => (
            <SpecialtyCard key={i} item={s} location={location} isDark={isDark} /> // ✅ Truyền isDark
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: isDark ? '1px solid #1e293b' : '1px solid #fff7ed', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#0f172a' : '#f9fafb' }}> {/* ✅ Đổi màu */}
          <span style={{ fontSize: 11, color: '#64748b' }}>Dữ liệu từ Google Maps · SerpAPI</span>
          <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 10, border: 'none', background: '#f97316', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 10 }} /> Đóng
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

// 🍜 SPECIALTY CARD
const SpecialtyCard = ({ item, location, isDark }) => { // ✅ Thêm isDark
  const [saved, setSaved] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [fallbackImg, setFallbackImg] = useState(null);

  // Khi ảnh thumbnail lỗi → thử reviews trước, rồi mới images (tuần tự, tránh gọi thừa)
  const handleImgError = async () => {
    setImgError(true);
    try {
      const revData = await fetchReviews(item.name, item.place_id || '');
      const photos = (revData?.reviews || []).flatMap(r => r.photos || []);
      if (photos.length > 0) { setFallbackImg(photos[0]); return; }
      const imgData = await fetchImages(item.name, item.place_id || '');
      const imgs = imgData?.images || [];
      if (imgs.length > 0) setFallbackImg(imgs[0]);
    } catch (_) {}
  };

  const displayImg = !imgError ? proxyImage(item.thumbnail) : (fallbackImg ? proxyImage(fallbackImg) : null);

  return (
    <>
      <div className="sp-card" style={{ backgroundColor: isDark ? '#1e293b' : 'white', borderRadius: 18, border: isDark ? '1px solid #334155' : '1px solid #f1f5f9', padding: '14px', marginBottom: 12, display: 'flex', gap: 14, position: 'relative', cursor: 'default' }}> {/* ✅ Đổi màu */}
        <button onClick={() => setSaved(!saved)} style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 8, border: 'none', background: saved ? (isDark ? '#854d0e' : '#fef08a') : (isDark ? '#334155' : '#f8fafc'), color: saved ? (isDark ? '#fde047' : '#eab308') : '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, transition: '0.2s', zIndex: 2 }}> {/* ✅ Đổi màu */}
          <FontAwesomeIcon icon={saved ? faBookmarkSolid : faBookmarkRegular} />
        </button>

        <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(135deg, #ffedd5, #fed7aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(item.thumbnail || fallbackImg) && displayImg ? (
            <img src={displayImg} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={imgError ? undefined : handleImgError} />
          ) : (
            <FontAwesomeIcon icon={faUtensils} style={{ fontSize: 28, color: '#f97316' }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>🍜 Đặc sản địa phương</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: isDark ? '#ffffff' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.35, marginBottom: 4 }}>{item.name}</div> {/* ✅ Đổi màu */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>⭐ {item.rating || 'N/A'}</span>
            {item.price && item.price !== 'Giá tùy chọn' && (
              <span style={{ color: '#f97316', fontSize: 12, fontWeight: 700 }}>{item.price}</span>
            )}
          </div>
          {item.desc && (
            <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 8 }}>{item.desc}</div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setMapOpen(true)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FontAwesomeIcon icon={faLocationArrow} style={{ fontSize: 9 }} /> Vị trí
            </button>
            <button
              onClick={() => setReviewsOpen(true)}
              style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid #0d9488', background: isDark ? '#111827' : 'white', color: '#0d9488', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: '0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#111827' : 'white'; e.currentTarget.style.color = '#0d9488'; }}
            >
              <FontAwesomeIcon icon={faStar} style={{ fontSize: 9 }} /> Reviews
            </button>
          </div>
        </div>
      </div>
      {mapOpen && <MapModal placeName={item.name} query={`${item.name} ${location}`} onClose={() => setMapOpen(false)} />}
      {reviewsOpen && <ReviewsModal placeName={item.name} placeId={item.place_id || ''} onClose={() => setReviewsOpen(false)} />}
    </>
  );
};

// 🗺️ MAP MODAL POPUP
const MapModal = ({ placeName, query, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const modalContent = (
    <>
      <style>{`
        @keyframes mapFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes mapSlideUp { from { transform: translateY(40px) scale(0.97); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
        .map-overlay { animation: mapFadeIn 0.2s ease forwards; }
        .map-box { animation: mapSlideUp 0.25s ease forwards; }
        .map-close-btn:hover { background-color: #e2e8f0 !important; }
      `}</style>
      <div
        className="map-overlay"
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 999999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '20px', boxSizing: 'border-box',
        }}
      >
        <div
          className="map-box"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white', borderRadius: '24px', width: '100%',
            maxWidth: '760px', overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FontAwesomeIcon icon={faMap} style={{ color: '#3b82f6', fontSize: '17px' }} />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '900', color: '#111827' }}>{placeName}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Bản đồ vị trí · Bấm ESC hoặc ra ngoài để đóng</div>
              </div>
            </div>
            <button className="map-close-btn" onClick={onClose} style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.15s', fontSize: '16px', color: '#374151' }}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <div style={{ height: '450px', flexShrink: 0 }}>
            <iframe title={`map-popup-${placeName}`} width="100%" height="100%" style={{ border: 0, display: 'block' }} src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`} allowFullScreen />
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#3b82f6', color: 'white', fontWeight: '700', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <FontAwesomeIcon icon={faLocationArrow} /> Mở Google Maps
            </a>
          </div>
        </div>
      </div>
    </>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};

// ⭐ Stars
const Stars = ({ rating = 0 }) => (
  <span style={{ color: '#f59e0b', fontSize: 13 }}>
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i}>{i < Math.round(rating) ? '★' : '☆'}</span>
    ))}
  </span>
);

// 📸 ReviewsModal
const ReviewsModal = ({ placeName, placeId, onClose }) => {
  const [tab,      setTab]      = useState('images');
  const [reviews,  setReviews]  = useState([]);
  const [images,   setImages]   = useState([]);
  const [total,    setTotal]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [filterStar, setFilterStar] = useState('all'); 
  const [visibleCount, setVisibleCount] = useState(5);
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') lightbox ? setLightbox(null) : onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, lightbox]);

  useEffect(() => {
    setLoading(true); setError('');
    Promise.all([fetchReviews(placeName, placeId), fetchImages(placeName, placeId)])
      .then(([revData, imgData]) => {
        setReviews(revData.reviews || []);
        setTotal(revData.total || null);
        setImages(imgData.images || []);
      })
      .catch(() => setError('Không thể tải dữ liệu. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [placeName, placeId]);

  const stats = {
    all: reviews.length,
    5: reviews.filter(r => Math.round(r.rating || 0) === 5).length,
    4: reviews.filter(r => Math.round(r.rating || 0) === 4).length,
    3: reviews.filter(r => Math.round(r.rating || 0) === 3).length,
    2: reviews.filter(r => Math.round(r.rating || 0) === 2).length,
    1: reviews.filter(r => Math.round(r.rating || 0) === 1).length,
  };

  const filteredReviews = reviews.filter(r => filterStar === 'all' || Math.round(r.rating || 0) === filterStar);
  const displayedReviews = filteredReviews.slice(0, visibleCount);

  return ReactDOM.createPortal(
    <>
      <style>{`
        @keyframes rvFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes rvSlideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes rvSpin    { to{transform:rotate(360deg)} }
        .rv-overlay { animation: rvFadeIn 0.2s ease forwards; }
        .rv-box     { animation: rvSlideUp 0.25s cubic-bezier(.22,1,.36,1) forwards; }
        .rv-img:hover { transform: scale(1.06); }
      `}</style>
      <div
        className="rv-overlay"
        onClick={() => lightbox ? setLightbox(null) : onClose()}
        style={{ position: 'fixed', inset: 0, zIndex: 9999999, backgroundColor: lightbox ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {lightbox && (
          <img src={proxyImage(lightbox)} alt="" referrerPolicy="no-referrer" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 14, objectFit: 'contain', boxShadow: '0 8px 50px rgba(0,0,0,0.7)' }}
          />
        )}
        {!lightbox && (
          <div className="rv-box" onClick={e => e.stopPropagation()} style={{ width: 'min(620px, 95vw)', maxHeight: '85vh', backgroundColor: 'white', borderRadius: 24, boxShadow: '0 30px 90px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '44px', lineHeight: '1.4' }}>{placeName}</div>
                  {total && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{Number(total).toLocaleString()} đánh giá trên Google</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: 12 }}>
                  <button onClick={() => setIsFavorited(!isFavorited)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: isFavorited ? '#fee2e2' : '#f1f5f9', color: isFavorited ? '#ef4444' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: '0.2s' }} title="Yêu thích">
                    <FontAwesomeIcon icon={isFavorited ? faHeartSolid : faHeartRegular} />
                  </button>
                  <button onClick={() => setIsSaved(!isSaved)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: isSaved ? '#fef08a' : '#f1f5f9', color: isSaved ? '#eab308' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: '0.2s' }} title="Lưu trữ">
                    <FontAwesomeIcon icon={isSaved ? faBookmarkSolid : faBookmarkRegular} />
                  </button>
                  <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#374151' }}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', gap: 4 }}>
                {[{ key: 'images', label: 'Hình ảnh', icon: faImages }, { key: 'reviews', label: 'Đánh giá', icon: faComments }].map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: tab === t.key ? '#8b5cf6' : '#9ca3af', borderBottom: tab === t.key ? '2px solid #8b5cf6' : '2px solid transparent', marginBottom: -2, transition: '0.15s' }}>
                    <FontAwesomeIcon icon={t.icon} />
                    {t.label}
                    {t.key === 'images' && images.length > 0 && (
                      <span style={{ background: '#8b5cf620', color: '#8b5cf6', fontSize: 10, fontWeight: 900, padding: '1px 6px', borderRadius: 99 }}>{images.length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
              {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: 180, color: '#9ca3af' }}><FontAwesomeIcon icon={faSpinner} style={{ fontSize: 28, color: '#8b5cf6', animation: 'rvSpin 1s linear infinite' }} /><div style={{ fontSize: 13 }}>Đang tải dữ liệu...</div></div>}
              {!loading && error && <div style={{ textAlign: 'center', color: '#ef4444', fontSize: 14, padding: '50px 0' }}>{error}</div>}
              {!loading && !error && tab === 'reviews' && (
                reviews.length === 0
                  ? <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, padding: '50px 0' }}>Chưa có đánh giá nào.</div>
                  : <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {['all', 5, 4, 3, 2, 1].map(star => (
                          <button key={star} onClick={() => { setFilterStar(star); setVisibleCount(10); }} style={{ padding: '6px 14px', borderRadius: '20px', border: filterStar === star ? '1px solid #8b5cf6' : '1px solid #e2e8f0', backgroundColor: filterStar === star ? '#f5f3ff' : '#f8fafc', color: filterStar === star ? '#8b5cf6' : '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', display: stats[star] === 0 && star !== 'all' ? 'none' : 'block' }}>
                            {star === 'all' ? 'Tất cả' : `${star} Sao`} ({stats[star]})
                          </button>
                        ))}
                      </div>
                      {displayedReviews.length === 0
                        ? <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px 0', fontSize: 14 }}>Không có đánh giá {filterStar} sao nào.</div>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {displayedReviews.map((r, i) => (
                              <div key={i} style={{ background: '#f8fafc', borderRadius: 16, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                    {r.avatar ? <img src={r.avatar} referrerPolicy="no-referrer" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 900, fontSize: 15 }}>{(r.user || 'U')[0].toUpperCase()}</span>}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{r.user || 'Người dùng ẩn danh'}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Stars rating={r.rating} /><span style={{ fontSize: 11, color: '#9ca3af' }}>{r.date || ''}</span></div>
                                  </div>
                                </div>
                                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.65 }}>{r.content || 'Không có nội dung.'}</p>
                                {r.photos && r.photos.length > 0 && (
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                                    {r.photos.map((photoUrl, idx) => (
                                      <img key={idx} src={photoUrl} referrerPolicy="no-referrer" alt="review-pic" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #f1f5f9', flexShrink: 0 }} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                      }
                      {visibleCount < filteredReviews.length && (
                        <button onClick={() => setVisibleCount(prev => prev + 10)} style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', border: '1px dashed #cbd5e1', backgroundColor: 'transparent', color: '#64748b', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: '0.2s', textAlign: 'center' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.color = '#8b5cf6'; e.currentTarget.style.backgroundColor = '#f5f3ff'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          Xem thêm đánh giá ({filteredReviews.length - visibleCount} cái nữa) ⬇️
                        </button>
                      )}
                    </div>
              )}
              {!loading && !error && tab === 'images' && (
                images.length === 0
                  ? <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, padding: '50px 0' }}>Chưa có hình ảnh nào.</div>
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                      {images.map((url, i) => (
                        <div key={i} onClick={() => setLightbox(url)} style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'zoom-in', background: '#f1f5f9' }}>
                          <img src={proxyImage(url)} alt="" className="rv-img" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.2s', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                      ))}
                    </div>
              )}
            </div>
            <div style={{ padding: '12px 22px', borderTop: '1px solid #f1f5f9', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#d1d5db' }}>Dữ liệu từ Google Maps · SerpAPI</span>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', textDecoration: 'none' }}>Xem trên Google Maps ↗</a>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

// 🎨 PlaceCard
const PlaceCard = ({ type, data, sessionLabel, locationName, setMapQuery, onShowMap, onEdit, guestCount, isDark }) => {
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [isHovered,   setIsHovered]   = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [imgError, setImgError] = useState(false);
  const [fallbackImg, setFallbackImg] = useState(null);

  const isHotel  = type === 'Khách sạn';
  const isFlight = type === 'Chuyến bay';
  const icon      = isHotel ? faHotel : (isFlight ? faPlane : (type === 'Địa điểm ăn uống' ? faUtensils : faMapLocationDot));
  const mainColor = isHotel ? '#3b82f6' : (isFlight ? '#10b981' : (type === 'Điểm tham quan' ? '#8b5cf6' : '#f97316'));
  const sessionIcon = sessionLabel === 'Sáng' ? faSun : (sessionLabel === 'Chiều' ? faCloudSun : faMoon);

  const getRoomIcon = (roomType) => {
    if (roomType?.includes("Nguyên căn") || roomType?.includes("Bungalow")) return faHome;
    if (roomType?.includes("Family") || roomType?.includes("Tập thể")) return faUsers;
    if (roomType?.includes("Đôi")) return faUserGroup;
    return faBed;
  };

  const handleLocation = () => {
    const query = `${data.name} ${locationName}`;
    if (setMapQuery) setMapQuery(query);
    else if (onShowMap) onShowMap(query, data.name);
  };

  const handleImgError = async () => {
    setImgError(true);
    try {
      const revData = await fetchReviews(data.name, data.place_id || '');
      const photos = (revData?.reviews || []).flatMap(r => r.photos || []);
      if (photos.length > 0) { setFallbackImg(photos[0]); return; }
      const imgData = await fetchImages(data.name, data.place_id || '');
      const imgs = imgData?.images || [];
      if (imgs.length > 0) setFallbackImg(imgs[0]);
    } catch (_) {}
  };

  const displayImg = !imgError ? proxyImage(data.thumbnail) : (fallbackImg ? proxyImage(fallbackImg) : null);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isDark ? '#22252a' : 'white',
        borderRadius: '20px', padding: '18px 20px',
        display: 'flex', gap: '16px',
        border: isDark ? '1px solid #3e4451' : '1px solid #f1f5f9',
        flex: 1,
        boxShadow: isHovered ? (isDark ? '0 15px 35px rgba(0,0,0,0.4)' : '0 15px 35px rgba(0,0,0,0.12)') : '0 2px 8px rgba(0,0,0,0.06)',
        alignItems: 'center',
        transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: isHovered ? 10 : 1, position: 'relative',
      }}
    >
      <button onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }} style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: isSaved ? (isDark ? '#854d0e' : '#fef08a') : (isDark ? '#374151' : 'rgba(255,255,255,0.85)'), color: isSaved ? (isDark ? '#fde047' : '#eab308') : (isDark ? '#9ca3af' : '#9ca3af'), border: isDark ? '1px solid #4b5563' : '1px solid #f1f5f9', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20, backdropFilter: 'blur(4px)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: '0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title={isSaved ? "Bỏ lưu" : "Lưu địa điểm"}
      >
        <FontAwesomeIcon icon={isSaved ? faBookmarkSolid : faBookmarkRegular} style={{ fontSize: '15px' }} />
      </button>

      {/* Thêm điều kiện isFlight ? 'white' : ... để ép nền trắng cho logo hãng bay */}
      <div style={{ width: '120px', height: '120px', flexShrink: 0, borderRadius: '14px', overflow: 'hidden', backgroundColor: isFlight ? 'white' : (isDark ? '#111827' : '#f8fafc'), display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {(data.thumbnail || fallbackImg) && displayImg ? (
          <img src={displayImg} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isHovered ? 'scale(1.09)' : 'scale(1)', transition: 'transform 0.4s ease', display: 'block' }} onError={imgError ? (e => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x120?text=S-Trip'; }) : handleImgError} />
        ) : (
          <FontAwesomeIcon icon={sessionLabel ? sessionIcon : icon} style={{ fontSize: '28px', color: mainColor }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: mainColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{sessionLabel ? `${sessionLabel} · ${type}` : type}</div>
        
        {/* Ép chữ tên địa điểm hoặc tên hãng máy bay (Vietjet/Vietnam Airlines) sang màu trắng */}
        <div style={{ fontSize: '16px', fontWeight: '900', color: isDark ? '#ffffff' : '#111827', margin: '4px 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.35', wordBreak: 'break-word' }}>
          {data.name || data.airline}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ color: '#eab308', fontWeight: '700', fontSize: '13px' }}><FontAwesomeIcon icon={faStar} /> {data.rating || 'N/A'}</span>
          <span style={{ color: '#10b981', fontWeight: '800', fontSize: '13px' }}>{data.price}</span>
        </div>
        
        {/* Ép chữ mô tả (Hãng bay... Thời gian bay...) sang màu xám trắng sáng */}
        <div style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#64748b', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '10px' }}>
          {data.desc}
        </div>

        {(isHotel || isFlight) && guestCount && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: isFlight ? (isDark ? '#064e3b' : '#ecfdf5') : (isDark ? '#1e3a8a' : '#eff6ff'), padding: '4px 10px', borderRadius: '6px', border: `1px solid ${isFlight ? (isDark ? '#059669' : '#a7f3d0') : (isDark ? '#2563eb' : '#dbeafe')}` }}>
              <FontAwesomeIcon icon={faUsers} style={{ fontSize: '10px', color: isFlight ? (isDark ? '#34d399' : '#059669') : (isDark ? '#93c5fd' : '#3b82f6') }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: isFlight ? (isDark ? '#a7f3d0' : '#065f46') : (isDark ? '#bfdbfe' : '#1e40af') }}>{isFlight ? `Vé cho ${guestCount} khách` : `${guestCount} khách`}</span>
            </div>
            {isHotel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: isDark ? '#4c1d95' : '#f5f3ff', padding: '4px 10px', borderRadius: '6px', border: isDark ? '1px solid #7c3aed' : '1px solid #ede9fe' }}>
                <FontAwesomeIcon icon={getRoomIcon(data.room_type)} style={{ fontSize: '10px', color: isDark ? '#c4b5fd' : '#8b5cf6' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: isDark ? '#ddd6fe' : '#5b21b6' }}>{data.room_type || "Phòng tiêu chuẩn"}</span>
              </div>
            )}
            {isFlight && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: isDark ? '#7c2d12' : '#fff7ed', padding: '4px 10px', borderRadius: '6px', border: `1px solid ${isDark ? '#9a3412' : '#ffedd5'}` }}>
                <FontAwesomeIcon icon={faPlane} style={{ fontSize: '10px', color: isDark ? '#fdba74' : '#f97316' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: isDark ? '#ffedd5' : '#c2410c' }}>Hạng {data.ticket_class || "Phổ thông"}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          {!isFlight && !isHotel && (
            <button onClick={handleLocation} style={{ padding: '7px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FontAwesomeIcon icon={faLocationArrow} style={{ fontSize: '10px' }} /> Vị trí
            </button>
          )}
          {!isFlight && (
            <button onClick={() => setReviewsOpen(true)} style={{ padding: '7px 14px', borderRadius: '10px', border: '1.5px solid #0d9488', backgroundColor: isDark ? '#111827' : 'white', color: '#0d9488', fontWeight: '700', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', transition: '0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#111827' : 'white'; e.currentTarget.style.color = '#0d9488'; }}
            >
              <FontAwesomeIcon icon={faStar} style={{ fontSize: '10px' }} /> Reviews
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit} style={{ padding: '7px 12px', borderRadius: '10px', border: `1.5px solid ${mainColor}`, color: mainColor, backgroundColor: isDark ? '#111827' : 'white', fontWeight: '700', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: '10px' }} /> Đổi
            </button>
          )}
        </div>
      </div>

      {reviewsOpen && <ReviewsModal placeName={data.name || data.airline} placeId={data.place_id || ""} onClose={() => setReviewsOpen(false)} />}
    </div>
  );
};

// ── TRANSPORT CARD — có hiệu ứng hover nổi lên ───────────────
const TransportCard = ({ opt, isCombined, isDark }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: isDark ? '#22252a' : 'white', borderRadius: '24px', padding: '24px',
        border: opt.recommended
          ? '2.5px solid #10b981'
          : hovered ? '2px solid #cbd5e1' : '2px solid #f1f5f9',
        boxShadow: hovered
          ? '0 32px 64px rgba(0,0,0,0.18)'
          : opt.recommended
            ? '0 12px 30px rgba(16,185,129,0.15)'
            : '0 4px 12px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-16px)' : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative', display: 'flex', flexDirection: 'column',
        cursor: 'default',
      }}
    >
      {opt.recommended && (
        <div style={{ position: 'absolute', top: '-12px', left: '24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '4px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '800', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
          ✨ Khuyên dùng
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', marginTop: opt.recommended ? '8px' : '0' }}>
        {opt.thumbnail && (
          <div style={{ 
            width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0, overflow: 'hidden',
            backgroundColor: isDark ? '#2e333d' : '#f8fafc', 
            border: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: opt.label.includes("Vietnam Airlines") ? '0' : '5px'
          }}>
            <img
              src={opt.label.includes("Vietnam Airlines") 
                ? "https://thuvienvector.vn/wp-content/uploads/2025/04/hoa-sen-vang-logo-vietnam-airlines.jpg" 
                : proxyImage(opt.thumbnail)} 
              alt="logo" 
              style={{ width: '100%', height: '100%', objectFit: opt.label.includes("Vietnam Airlines") ? 'cover' : 'contain' }} 
            />
          </div>
        )}
        <div style={{ fontSize: '20px', fontWeight: '900', color: hovered ? '#10b981' : (isDark ? '#ffffff' : '#111827'), transition: 'color 0.2s' }}>
          {opt.label}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6', background: '#eff6ff', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          ⏱ {opt.duration}
        </span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#ea580c', background: '#fff7ed', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          💰 {opt.price_range}
        </span>
        {opt.distance && (
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', background: '#ecfdf4', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            📍 {opt.distance}
          </span>
        )}
        {opt.ticket_type && (
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#8b5cf6', background: '#f5f3ff', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            🎟️ {opt.ticket_type}
          </span>
        )}
      </div>

      <div style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#475569', lineHeight: '1.5', flex: 1 }}>
        {opt.tips}
      </div>

      {isCombined && opt.legs && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
          <div style={{ position: 'absolute', left: '16px', top: '24px', bottom: '24px', width: '2px', background: '#e2e8f0', zIndex: 1 }} />
          {opt.legs.map((leg, lIdx) => (
            <div key={lIdx} style={{ display: 'flex', gap: '14px', zIndex: 2 }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'white', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>
                {leg.icon}
              </div>
              <div style={{ background: isDark ? '#334155' : '#f8fafc', padding: '12px 14px', borderRadius: '14px', flex: 1, border: `1px solid ${isDark ? '#475569' : '#f1f5f9'}` }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: isDark ? '#9ca3af' : '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Chặng {leg.step}</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: isDark ? '#ffffff' : '#1e293b', marginBottom: '4px' }}>{leg.label}</div>
                <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '700' }}>{leg.duration} • {leg.price_range}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 🌤️ WEATHER WIDGET — hiển thị thời tiết điểm đến
// ─────────────────────────────────────────────────────────────
const WeatherWidget = ({ location, isDark, externalData }) => {
  const [weather, setWeather] = useState(externalData || null);
  const [loading, setLoading] = useState(!externalData);

  useEffect(() => {
    if (externalData) { setWeather(externalData); setLoading(false); return; }
    if (!location) return;
    setLoading(true);
    fetchWeather(location)
      .then(data => setWeather(data))
      .finally(() => setLoading(false));
  }, [location, externalData]);

  const cardBg   = isDark ? '#1e293b' : 'white';
  const border   = isDark ? '1px solid #334155' : '1px solid #e2e8f0';
  const textMain = isDark ? '#f8fafc' : '#111827';
  const textSub  = isDark ? '#94a3b8' : '#64748b';

  if (loading) return (
    <div style={{ marginBottom: 48, padding: '28px 32px', borderRadius: 28, background: cardBg, border, display: 'flex', alignItems: 'center', gap: 14 }}>
      <FontAwesomeIcon icon={faSpinner} style={{ fontSize: 22, color: '#3b82f6', animation: 'rvSpin 1s linear infinite' }} />
      <span style={{ fontSize: 15, color: textSub, fontWeight: 600 }}>Đang tải thông tin thời tiết...</span>
    </div>
  );

  if (!weather) return null;

  const { current, forecast, travel_advice } = weather;

  return (
    <div style={{ marginBottom: 55, borderRadius: 32, overflow: 'hidden', border, boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(59,130,246,0.10)' }}>

      {/* Header gradient */}
      <div style={{ background: isDark ? 'linear-gradient(135deg, #1e3a5f 0%, #0f2540 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)', padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'nowrap' }}>

        {/* Thời tiết hiện tại */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ fontSize: 52, lineHeight: 1 }}>{current.icon}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#93c5fd' : '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
              🌍 Thời tiết tại {location}
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, color: isDark ? '#ffffff' : '#1e40af', lineHeight: 1, marginBottom: 2 }}>
              {current.temp_c !== null ? `${current.temp_c}°C` : '--'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#bfdbfe' : '#3b82f6' }}>
              {current.condition || 'Không xác định'}
            </div>
            {current.feels_like_c !== null && (
              <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', marginTop: 1 }}>
                Cảm giác như {current.feels_like_c}°C
              </div>
            )}
          </div>
        </div>

        {/* Chỉ số phụ — co đều theo chiều ngang */}
        <div style={{ display: 'flex', gap: 8, flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {[
            { label: '💧 Độ ẩm',    val: current.humidity      != null ? `${current.humidity}%`        : '--' },
            { label: '💨 Gió',       val: current.wind_kph      != null ? `${current.wind_kph} km/h`    : '--' },
            { label: '🌞 UV',        val: current.uv_index      != null ? `${current.uv_index}`          : '--' },
            { label: '👁️ Tầm nhìn', val: current.visibility_km != null ? `${current.visibility_km} km` : '--' },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '8px 12px', minWidth: 72, textAlign: 'center', flex: '1 1 72px', maxWidth: 110 }}>
              <div style={{ fontSize: 10, color: isDark ? '#93c5fd' : '#2563eb', fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: isDark ? '#ffffff' : '#1e40af', marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lời khuyên du lịch */}
      {travel_advice && (
        <div style={{ padding: '10px 24px', background: isDark ? '#0f172a' : '#eff6ff', borderTop: isDark ? '1px solid #1e3a5f' : '1px solid #dbeafe', fontSize: 13, fontWeight: 700, color: isDark ? '#bfdbfe' : '#1e40af' }}>
          {travel_advice}
        </div>
      )}

      {/* Dự báo — grid tự co vừa khung, không tràn */}
      {forecast && forecast.length > 0 && (
        <div style={{ padding: '16px 24px 20px', background: cardBg }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            📅 Dự báo {forecast.length} ngày tới
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${forecast.length}, 1fr)`, gap: 8 }}>
            {forecast.map((day, i) => (
              <div key={i} style={{ background: isDark ? '#0f172a' : '#f8fafc', border: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9', borderRadius: 14, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: textSub, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{day.day || `N${i+1}`}</div>
                <div style={{ fontSize: 22, marginBottom: 3 }}>{day.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: textMain }}>{day.high_c !== null ? `${day.high_c}°` : '--'}</div>
                <div style={{ fontSize: 11, color: textSub }}>{day.low_c !== null ? `${day.low_c}°` : '--'}</div>
                {day.rain_chance != null && (
                  <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: '#3b82f6' }}>💧{day.rain_chance}%</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// iCal Export — tao file .ics chuan RFC 5545
// ─────────────────────────────────────────────────────────────
const _pad  = (n) => String(n).padStart(2, '0');
const _fmt  = (d) => d.getFullYear()+_pad(d.getMonth()+1)+_pad(d.getDate())+'T'+_pad(d.getHours())+_pad(d.getMinutes())+'00';
const _uid  = () => 'strip-'+Math.random().toString(36).slice(2,10)+'@strip.app';
const _esc  = (s='') => String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
const _fold = (line) => {
  if (line.length<=75) return line;
  let out='',pos=0;
  while(pos<line.length){out+=(pos===0?'':' ')+line.slice(pos,pos+(pos===0?75:74))+'\r\n';pos+=pos===0?75:74;}
  return out.trimEnd();
};
const _vevent = ({summary,description,location,dtStart,dtEnd}) =>
  ['BEGIN:VEVENT','UID:'+_uid(),'DTSTAMP:'+_fmt(new Date()),'DTSTART:'+_fmt(dtStart),'DTEND:'+_fmt(dtEnd),
   'SUMMARY:'+_esc(summary),description?'DESCRIPTION:'+_esc(description):null,location?'LOCATION:'+_esc(location):null,
   'END:VEVENT'].filter(Boolean).map(_fold).join('\r\n');
const _SCFG = {
  morning:   {startH:8, startM:0, dur:2, label:'Sang',  emoji:'[Sang]'},
  afternoon: {startH:13,startM:0, dur:2, label:'Chieu', emoji:'[Chieu]'},
  evening:   {startH:18,startM:30,dur:2, label:'Toi',   emoji:'[Toi]'},
};
const exportICalFile = ({dailyPlans=[],initialData={},currentHotel=null}) => {
  const loc = initialData.location || 'Diem den';
  let base = initialData.startDate ? new Date(initialData.startDate) : new Date();
  if (isNaN(base.getTime())) base = new Date();
  if (!initialData.startDate) base.setDate(base.getDate()+1);
  base.setHours(0,0,0,0);
  const events = [];
  if (currentHotel?.name) {
    const ci=new Date(base); ci.setHours(14,0,0,0);
    const co=new Date(base); co.setDate(co.getDate()+dailyPlans.length); co.setHours(12,0,0,0);
    events.push(_vevent({summary:'[Khach san] '+currentHotel.name,
      description:[currentHotel.desc,currentHotel.price&&'Gia: '+currentHotel.price,currentHotel.rating&&'Danh gia: '+currentHotel.rating].filter(Boolean).join(' | '),
      location:currentHotel.name+', '+loc,dtStart:ci,dtEnd:co}));
  }
  dailyPlans.forEach((dayPlan) => {
    const offset=dayPlan.day-1;
    Object.entries(_SCFG).forEach(([session,cfg]) => {
      const sd=dayPlan[session]||{};
      if (sd.tour?.name) {
        const s=new Date(base); s.setDate(s.getDate()+offset); s.setHours(cfg.startH,cfg.startM,0,0);
        const e=new Date(s); e.setHours(e.getHours()+cfg.dur);
        events.push(_vevent({summary:cfg.emoji+' '+sd.tour.name,
          description:[sd.tour.desc,sd.tour.rating&&'Danh gia: '+sd.tour.rating,sd.tour.price&&'Gia: '+sd.tour.price].filter(Boolean).join(' | '),
          location:sd.tour.lat&&sd.tour.lng?sd.tour.name+', '+loc+' ('+sd.tour.lat+','+sd.tour.lng+')':sd.tour.name+', '+loc,
          dtStart:s,dtEnd:e}));
      }
      if (sd.food?.name) {
        const s=new Date(base); s.setDate(s.getDate()+offset); s.setHours(cfg.startH+cfg.dur,cfg.startM,0,0);
        const e=new Date(s); e.setHours(e.getHours()+1); e.setMinutes(e.getMinutes()+30);
        events.push(_vevent({summary:'[An uong] '+cfg.emoji+' '+sd.food.name,
          description:[sd.food.desc,sd.food.rating&&'Danh gia: '+sd.food.rating,sd.food.price&&'Gia: '+sd.food.price].filter(Boolean).join(' | '),
          location:sd.food.name+', '+loc,dtStart:s,dtEnd:e}));
      }
    });
  });
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//S-Trip//S-Trip App//VI',
    'X-WR-CALNAME:'+_esc('S-Trip: '+loc),'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
    'CALSCALE:GREGORIAN','METHOD:PUBLISH',...events,'END:VCALENDAR'].join('\r\n');
  const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=Object.assign(document.createElement('a'),{href:url,download:'strip-'+loc.replace(/\s+/g,'-').toLowerCase()+'.ics'});
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
};

const ICalButton = ({ dailyPlans, initialData, currentHotel, isDark }) => {
  const [status, setStatus] = React.useState('idle');
  const handleClick = () => {
    try {
      exportICalFile({ dailyPlans, initialData, currentHotel });
      setStatus('success'); setTimeout(() => setStatus('idle'), 3000);
    } catch(err) { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  };
  const cfgMap = {
    idle:    { label: 'Xuat lich (.ics)', bg: '#2563eb', shadow: '0 12px 30px rgba(37,99,235,0.35)' },
    success: { label: 'Da tai xuong!',    bg: '#059669', shadow: 'none' },
    error:   { label: 'Co loi xay ra',    bg: '#dc2626', shadow: 'none' },
  };
  const cfg = cfgMap[status];
  return (
    <button onClick={handleClick} disabled={status !== 'idle'} title="Import vao Google Calendar / Apple Calendar"
      style={{ backgroundColor: cfg.bg, color: 'white', padding: '22px 50px', borderRadius: '99px', border: 'none',
        fontWeight: '800', fontSize: '22px', cursor: status==='idle'?'pointer':'default',
        boxShadow: cfg.shadow, transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: '10px',
        opacity: status!=='idle' ? 0.85 : 1 }}>
      {status === 'idle' ? '📅' : ''} {cfg.label}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// 📸 ScreenshotButton — chụp DOM thật, cắt thành nhiều ảnh
// Dùng html2canvas (npm install html2canvas)
// ─────────────────────────────────────────────────────────────

// Chuyển tất cả <img> trong el sang blob URL để html2canvas đọc được (fix ảnh trắng)
const _preloadImages = async (el) => {
  const imgs = [...el.querySelectorAll('img')];
  const origSrcs = [];

  await Promise.all(imgs.map(async (img, i) => {
    origSrcs[i] = img.src;
    if (!img.src || img.src.startsWith('data:') || img.src.startsWith('blob:')) return;
    try {
      const res  = await fetch(img.src, { mode: 'cors' });
      const blob = await res.blob();
      img.src = URL.createObjectURL(blob);
      await new Promise(r => { img.onload = r; img.onerror = r; });
    } catch (_) { /* giữ nguyên nếu lỗi */ }
  }));

  // Trả về hàm restore để hoàn lại src gốc sau khi chụp
  return () => imgs.forEach((img, i) => { img.src = origSrcs[i]; });
};

const ScreenshotButton = ({ contentRef, location, isDark }) => {
  const [status,   setStatus]   = React.useState('idle');
  const [progress, setProgress] = React.useState('');

  const handleClick = async () => {
    if (status !== 'idle') return;
    const el = contentRef?.current;
    if (!el) return;

    setStatus('loading');
    try {
      const html2canvas = (await import('html2canvas')).default;

      // 1. Pre-load ảnh → blob URL (fix ảnh proxy bị trắng)
      setProgress('Đang tải ảnh...');
      const restore = await _preloadImages(el);

      // 2. Chụp toàn bộ element thành 1 canvas duy nhất
      setProgress('Đang chụp...');
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: isDark ? '#111827' : '#ffffff',
        logging: false,
        ignoreElements: (node) => node.tagName === 'IFRAME',
        onclone: (doc) => {
          // Ẩn iframe map, hiện overlay placeholder
          doc.querySelectorAll('iframe').forEach(f => { f.style.display = 'none'; });
          doc.querySelectorAll('.map-screenshot-overlay').forEach(d => { d.style.display = 'flex'; });
          // Bỏ hover transform
          doc.querySelectorAll('button').forEach(b => {
            b.style.transform = 'none';
            b.style.boxShadow = 'none';
          });
        },
      });

      // 3. Restore src gốc
      restore();

      // 4. Download 1 ảnh duy nhất
      setProgress('Đang lưu...');
      const loc = (location || 's-trip').toLowerCase().replace(/\s+/g, '-');
      await new Promise((res) => {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a   = Object.assign(document.createElement('a'), {
            href:     url,
            download: `strip-${loc}.png`,
          });
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          res();
        }, 'image/png');
      });

      setStatus('success');
      setProgress('');
    } catch (err) {
      console.error('[ScreenshotButton]', err);
      setStatus('error');
      setProgress('');
    } finally {
      setTimeout(() => setStatus('idle'), 3500);
    }
  };

  const cfgMap = {
    idle:    { label: '📸 Xuất ảnh lịch trình', bg: '#7c3aed', shadow: '0 12px 30px rgba(124,58,237,0.35)' },
    loading: { label: progress || 'Đang xử lý...', bg: '#6d28d9', shadow: 'none' },
    success: { label: '✅ Đã tải xong!',           bg: '#059669', shadow: 'none' },
    error:   { label: '❌ Có lỗi — thử lại',       bg: '#dc2626', shadow: 'none' },
  };
  const cfg = cfgMap[status];

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      style={{
        backgroundColor: cfg.bg,
        color: 'white',
        padding: '22px 50px',
        borderRadius: '99px',
        border: 'none',
        fontWeight: '800',
        fontSize: '22px',
        cursor: status === 'loading' ? 'wait' : 'pointer',
        boxShadow: cfg.shadow,
        transition: 'all 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        opacity: status === 'loading' ? 0.85 : 1,
        minWidth: 280,
        justifyContent: 'center',
      }}
    >
      {cfg.label}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// 🔗 ShareButton — tạo link chia sẻ + copy + Zalo/Messenger
// ─────────────────────────────────────────────────────────────
const ShareButton = ({ dailyPlans, initialData, currentHotel, plan, isDark }) => {
  const [status,   setStatus]   = React.useState('idle');
  const [shareUrl, setShareUrl] = React.useState('');
  const [copied,   setCopied]   = React.useState(false);
  const [panelOpen, setPanelOpen] = React.useState(false);

  const handleShare = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const body = {
        plan:       plan || {},
        dailyPlans: dailyPlans || [],
        meta: {
          location:  initialData.location,
          days:      parseInt(String(initialData.days || '3').split(' ')[0]),
          origin:    initialData.origin || initialData.from || '',
          startDate: initialData.startDate || initialData.departure_date || '',
        },
      };
      const res  = await fetch(`${BASE_URL}/api/trip/save`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Lỗi server');

      setShareUrl(data.share_url);
      setStatus('success');
      setPanelOpen(true);
    } catch (err) {
      console.error('[ShareButton]', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`Xem lịch trình ${initialData.location} của mình trên S-Trip! `);

  const btnBase = {
    padding: '12px 24px', borderRadius: 99, border: 'none',
    fontWeight: 800, fontSize: 15, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'all 0.2s',
  };

  return (
    <>
      {/* Nút chính */}
      <button
        onClick={handleShare}
        disabled={status === 'loading'}
        title="Tạo link chia sẻ lịch trình"
        style={{
          backgroundColor: '#0ea5e9',
          color: 'white',
          padding: '22px 50px',
          borderRadius: '99px',
          border: 'none',
          fontWeight: '800',
          fontSize: '22px',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          boxShadow: status === 'idle' ? '0 12px 30px rgba(14,165,233,0.35)' : 'none',
          transition: 'all 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          opacity: status === 'loading' ? 0.8 : 1,
        }}
      >
        {status === 'loading' ? '⏳' : status === 'error' ? '❌' : '🔗'}
        {status === 'loading' ? 'Đang tạo link...' : status === 'error' ? 'Có lỗi xảy ra' : 'Chia sẻ lịch trình'}
      </button>

      {/* Panel chia sẻ */}
      {panelOpen && shareUrl && ReactDOM.createPortal(
        <>
          <style>{`
            @keyframes spShareFade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
            .share-panel { animation: spShareFade 0.25s cubic-bezier(.22,1,.36,1) forwards; }
          `}</style>
          {/* Overlay */}
          <div
            onClick={() => setPanelOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99998,
              backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />
          {/* Panel */}
          <div
            className="share-panel"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', bottom: 40, left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 99999,
              backgroundColor: isDark ? '#1e293b' : 'white',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: 28,
              padding: '28px 32px',
              width: 'min(480px, 92vw)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: isDark ? '#f8fafc' : '#111827' }}>
                  🔗 Chia sẻ lịch trình
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Link hoạt động ngay · Có OG preview cho Zalo & Messenger
                </div>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                style={{ width: 34, height: 34, borderRadius: '50%', border: 'none',
                  background: isDark ? '#334155' : '#f1f5f9', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#64748b' }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* URL box */}
            <div style={{
              display: 'flex', gap: 8, marginBottom: 20,
              padding: '12px 16px',
              background: isDark ? '#0f172a' : '#f8fafc',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: 14,
            }}>
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 600,
                color: isDark ? '#94a3b8' : '#475569',
                wordBreak: 'break-all', lineHeight: 1.4,
              }}>
                {shareUrl}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  ...btnBase,
                  padding: '8px 16px', fontSize: 13,
                  backgroundColor: copied ? '#059669' : '#0ea5e9',
                  color: 'white', flexShrink: 0,
                }}
              >
                {copied ? '✅ Đã copy' : '📋 Copy'}
              </button>
            </div>

            {/* Social buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

              {/* Zalo */}
              <a
                href={`https://zalo.me/share?url=${encodedUrl}&text=${encodedText}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  ...btnBase,
                  backgroundColor: '#0068ff', color: 'white',
                  textDecoration: 'none', flex: '1 1 120px',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" fill="white">
                  <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4zm8.7 28.5l-2.5-1.5c-1.2 1.3-2.9 2.1-4.8 2.1-3.9 0-7-3.1-7-7s3.1-7 7-7c1.7 0 3.2.6 4.4 1.6l2.2-2c-1.7-1.5-4-2.4-6.6-2.4-5.5 0-10 4.5-10 10s4.5 10 10 10c2.9 0 5.5-1.2 7.3-3.1v.3z"/>
                </svg>
                Chia sẻ Zalo
              </a>

              {/* Messenger */}
              <a
                href={`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=966242223397117&redirect_uri=${encodedUrl}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  ...btnBase,
                  backgroundColor: '#0099ff', color: 'white',
                  textDecoration: 'none', flex: '1 1 120px',
                  justifyContent: 'center',
                }}
              >
                💬 Messenger
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  ...btnBase,
                  backgroundColor: '#1877f2', color: 'white',
                  textDecoration: 'none', flex: '1 1 120px',
                  justifyContent: 'center',
                }}
              >
                👤 Facebook
              </a>
            </div>

            <div style={{ marginTop: 16, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
              Khi chia sẻ qua Zalo / Messenger, link sẽ hiện preview ảnh + mô tả lịch trình tự động ✨
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

// ── COMPONENT CHÍNH ──────────────────────────────────────────
const AiSchedule = ({ data: initialData, plan, onSave, onPlanChange, isDark = false }) => {
  const numDays  = parseInt(initialData?.days?.toString().split(' ')[0]) || 3;
  const [dailyPlans,  setDailyPlans]  = useState([]);
  const [mapQuery,    setMapQuery]    = useState('');
  const [modal,       setModal]       = useState({ show: false, type: '', day: null, session: '', subType: '' });
  const [mapModal,    setMapModal]    = useState({ show: false, query: '', placeName: '' });
  const contentRef = useRef(null);

  // 🌤️ Weather data — lift lên đây để chia sẻ với từng ngày
  const [weatherData, setWeatherData] = useState(null);
  useEffect(() => {
    if (!initialData.location) return;
    fetchWeather(initialData.location).then(data => setWeatherData(data));
  }, [initialData.location]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🧋 State nút Tham Khảo Đồ Uống
  const [drinksOpen, setDrinksOpen] = useState(false);
  // 🍜 State nút Tham Khảo Đặc Sản
  const [specialtiesOpen, setSpecialtiesOpen] = useState(false);

  // 🚀 Prefetch đồ uống + đặc sản ngay khi mount (chạy ngầm, không block UI)
  useEffect(() => {
    const loc = initialData.location;
    if (!loc) return;

    const prefetch = (cacheKey, type) => {
      if (panelCache[cacheKey]) return; // đã có cache rồi, bỏ qua
      fetch(`${BASE_URL}/api/activities?location=${encodeURIComponent(loc)}&type=${encodeURIComponent(type)}`)
        .then(r => r.json())
        .then(d => { const r = d.results || []; if (r.length > 0) panelCache[cacheKey] = r; })
        .catch(() => {}); // im lặng nếu lỗi, panel sẽ tự retry khi mở
    };

    // Delay nhẹ để không tranh băng thông với các fetch chính
    const timer = setTimeout(() => {
      prefetch(`drinks:${loc}`, 'Quán cà phê đồ uống');
      prefetch(`specialties:${loc}`, 'Đặc sản địa phương món ăn truyền thống');
    }, 1500);

    return () => clearTimeout(timer);
  }, [initialData.location]); // eslint-disable-line react-hooks/exhaustive-deps

  const passengers = initialData.passengers || 1;

  const realHotels = (initialData.realHotels || []).map(h => ({
    name: h.name, rating: h.rating,
    price: h.price_per_night?.toLocaleString() + "đ/đêm" || "Liên hệ",
    thumbnail: h.thumbnail,
    desc: h.desc || "Lựa chọn tốt nhất dựa trên ngân sách.",
    lat: h.lat, lng: h.lng, place_id: h.place_id || "", room_type: h.room_type,
  }));

  const realTours = (initialData.realTours || []).map(normalizeActivity);
  const realFoods = (initialData.realFoods || []).map(normalizeActivity);

  const realFlights = initialData.realFlights || initialData.flights || [];

  const hotelsPool = realHotels.length > 0 ? realHotels : mockRepo['Khách sạn'];
  const toursPool  = realTours.length  > 0 ? realTours  : mockRepo['Điểm tham quan'];
  const foodsPool  = realFoods.length  > 0 ? realFoods  : mockRepo['Địa điểm ăn uống'];

  const [currentHotel, setCurrentHotel] = useState(hotelsPool[0]);

  useEffect(() => {
    const plans = [];
    for (let i = 0; i < numDays; i++) {
      plans.push({
        day: i + 1,
        morning:   { tour: toursPool[(i*3)   % toursPool.length], food: foodsPool[(i*3)   % foodsPool.length] },
        afternoon: { tour: toursPool[(i*3+1) % toursPool.length], food: foodsPool[(i*3+1) % foodsPool.length] },
        evening:   { tour: toursPool[(i*3+2) % toursPool.length], food: foodsPool[(i*3+2) % foodsPool.length] },
      });
    }
    setDailyPlans(plans);
    if (onPlanChange) onPlanChange(plans);
    setMapQuery(`${currentHotel.name} ${initialData.location}`);
  }, [initialData.location, numDays]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!dailyPlans.length) return;
    const coordMap = {};
    [...(initialData.realTours || []), ...(initialData.realFoods || [])].forEach(p => {
      if (p.lat && p.lng) coordMap[p.name] = { lat: p.lat, lng: p.lng };
    });
    if (!Object.keys(coordMap).length) return;
    setDailyPlans(prev => {
      const updated = prev.map(d => ({
        ...d,
        morning:   { tour: { ...d.morning.tour,   ...(coordMap[d.morning.tour?.name]   || {}) }, food: { ...d.morning.food,   ...(coordMap[d.morning.food?.name]   || {}) } },
        afternoon: { tour: { ...d.afternoon.tour, ...(coordMap[d.afternoon.tour?.name] || {}) }, food: { ...d.afternoon.food, ...(coordMap[d.afternoon.food?.name] || {}) } },
        evening:   { tour: { ...d.evening.tour,   ...(coordMap[d.evening.tour?.name]   || {}) }, food: { ...d.evening.food,   ...(coordMap[d.evening.food?.name]   || {}) } },
      }));
      if (onPlanChange) onPlanChange(updated);
      return updated;
    });
  }, [initialData.realTours, initialData.realFoods]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShowMap = (query, placeName) => setMapModal({ show: true, query, placeName });

  const handleUpdate = (newVal) => {
    if (modal.type === 'Khách sạn') {
      setCurrentHotel(newVal);
      window.dispatchEvent(new CustomEvent('sTripHotelChanged', { detail: newVal }));
      setMapQuery(`${newVal.name} ${initialData.location}`);
    } else {
      setDailyPlans(prev => {
        const next = prev.map(d => d.day === modal.day
          ? { ...d, [modal.session]: { ...d[modal.session], [modal.subType]: newVal } }
          : d);
        if (onPlanChange) onPlanChange(next);
        return next;
      });
    }
    setModal({ show: false, type: '', day: null, session: '', subType: '' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>

      {/* 🗺️ MAP MODAL */}
      {mapModal.show && (
        <MapModal placeName={mapModal.placeName} query={mapModal.query} onClose={() => setMapModal({ show: false, query: '', placeName: '' })} />
      )}

      {/* 🧋 DRINKS PANEL */}
      {drinksOpen && (
        <DrinksPanel
          location={initialData.location}
          isOpen={drinksOpen}
          onClose={() => setDrinksOpen(false)}
          isDark={isDark}
        />
      )}

      {/* 🍜 SPECIALTIES PANEL */}
      {specialtiesOpen && (
        <SpecialtiesPanel
          location={initialData.location}
          isOpen={specialtiesOpen}
          onClose={() => setSpecialtiesOpen(false)}
          isDark={isDark}
        />
      )}

      {/* MODAL ĐỔI LỰA CHỌN */}
      {modal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }} onClick={() => setModal({ show: false })}>
          <div
            style={{ backgroundColor: 'white', borderRadius: '35px', width: '550px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header cố định — không scroll */}
            <div style={{ padding: '28px 35px 20px', flexShrink: 0, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>Chọn {modal.type} tại {initialData.location}</h2>
                <FontAwesomeIcon icon={faXmark} style={{ cursor: 'pointer', fontSize: '24px', color: '#9ca3af' }} onClick={() => setModal({ show: false })} />
              </div>
            </div>
            {/* Body scroll — thanh cuộn nằm trong modal */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 35px 28px' }}>
              {(modal.type === 'Khách sạn' ? hotelsPool : (modal.subType === 'tour' ? toursPool : foodsPool)).map((opt, i) => (
                <div key={i} onClick={() => handleUpdate(opt)} style={{ padding: '16px 18px', borderRadius: '20px', border: '2px solid #f1f5f9', marginBottom: '10px', cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <img src={proxyImage(opt.thumbnail) || "https://placehold.co/60x60?text=S-Trip"} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} alt="thumb" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/60x60?text=S-Trip"; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.name} · <span style={{ color: '#eab308' }}>{opt.rating}⭐</span></div>
                    <div style={{ color: '#10b981', fontWeight: '700', fontSize: '13px', marginTop: 3 }}>{opt.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER — bọc từ đây đến hết dailyPlans bằng contentRef để chụp ảnh */}
      <div ref={contentRef}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '80px', fontWeight: '900' }}>
          <FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: '#10b981', marginRight: '18px' }} />
          Hành trình tại <span style={{ color: '#10b981' }}>{initialData.location}</span>
        </h1>
        <p style={{ fontSize: '28px', color: '#64748b' }}>Hành trình {numDays} ngày {numDays - 1} đêm của bạn sẵn sàng ✨</p>
      </div>

      {/* 🌤️ THỜI TIẾT */}
      <WeatherWidget location={initialData.location} isDark={isDark} externalData={weatherData} />

      {/* 1. PHƯƠNG TIỆN & CHUYẾN BAY ĐỀ XUẤT */}
      {((initialData.transport && initialData.transport.options && initialData.transport.options.length > 0) || realFlights.length > 0) && (
        <div style={{ marginBottom: '55px' }}>
          
          {/* --- PHẦN A: DANH SÁCH PHƯƠNG TIỆN --- */}
          {initialData.transport && initialData.transport.options && initialData.transport.options.length > 0 && (
            <>
              <div style={{ fontSize: '36px', fontWeight: '900', color: isDark ? '#ffffff' : '#111827', marginBottom: '20px' }}>
                🛣️ Phương tiện từ <span style={{color: '#10b981'}}>{initialData.origin || 'Điểm đi'}</span> đến <span style={{color: '#10b981'}}>{initialData.location}</span>
              </div>
              
              {initialData.transport.note && (
                <div style={{ fontSize: '15px', color: isDark ? '#ccfbf1' : '#0f766e', marginBottom: '25px', padding: '14px 20px', background: isDark ? 'rgba(20, 184, 166, 0.15)' : '#ccfbf1', border: isDark ? '1px solid #0d9488' : '1px solid #99f6e4', borderRadius: '14px', display: 'inline-block', fontWeight: '600' }}>
                  💡 {initialData.transport.note}
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', marginBottom: '30px' }}>
                {initialData.transport.options.map((opt, idx) => (
                  <TransportCard key={idx} opt={opt} isCombined={opt.type === 'combined'} isDark={isDark} />
                ))}
              </div>
            </>
          )}
          
          {/* --- PHẦN B: CHI TIẾT VÉ MÁY BAY --- */}
          {realFlights.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: isDark ? '#f8fafc' : '#1f2937', marginBottom: '16px' }}>
                ✈️ Chi tiết chuyến bay tham khảo
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                {realFlights.slice(0, 2).map((f, i) => (
                  <PlaceCard 
                    key={i} 
                    type="Chuyến bay" 
                    data={{ 
                      airline: f.airline, 
                      price: f.price?.toLocaleString() + "đ", 
                      thumbnail: f.airline === "Vietnam Airlines" 
                        ? "https://thuvienvector.vn/wp-content/uploads/2025/04/hoa-sen-vang-logo-vietnam-airlines.jpg" 
                        : f.thumbnail, 
                      desc: `Hãng bay: ${f.airline} • Thời gian bay: ${f.duration || 'N/A'}` 
                    }} 
                    locationName={initialData.location} 
                    onShowMap={handleShowMap} 
                    guestCount={passengers} 
                    isDark={isDark} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. KHÁCH SẠN */}
<div style={{ marginBottom: '60px' }}>
  <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>🛌 Chỗ ở {initialData.realHotels?.length > 0 ? '(Dữ liệu thực)' : '(Gợi ý)'}</div>
  <div style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc', padding: '30px', borderRadius: '40px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
    <PlaceCard type="Khách sạn" data={currentHotel} locationName={initialData.location} setMapQuery={setMapQuery} guestCount={passengers} onEdit={() => setModal({ show: true, type: 'Khách sạn' })} isDark={isDark} />
    
    <div style={{ borderRadius: '25px', overflow: 'hidden', height: '450px', border: isDark ? 'none' : '1px solid #e2e8f0', position: 'relative' }}>
      <iframe title="map" width="100%" height="100%" style={{ border: 0, display: 'block' }} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} />
      {/* Overlay hiển thị khi chụp ảnh (iframe không chụp được) */}
      <div className="map-screenshot-overlay" style={{
        display: 'none',
        position: 'absolute', inset: 0,
        background: isDark ? 'linear-gradient(135deg,#0f2540,#064e3b)' : 'linear-gradient(135deg,#dbeafe,#dcfce7)',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
        borderRadius: '25px',
      }}>
        <span style={{ fontSize: 48 }}>📍</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: isDark ? '#ffffff' : '#1e293b' }}>{mapQuery}</span>
        <span style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#64748b' }}>Xem trên Google Maps</span>
      </div>
    </div>
  </div>
</div>

      {/* 3. LỊCH TRÌNH */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', alignItems: 'center', marginTop: '0px', marginBottom: '50px' }}>
          {/* 🧋 NÚT THAM KHẢO ĐỒ UỐNG */}
          <button
            onClick={() => setDrinksOpen(true)}
            style={{
              flex: 1, maxWidth: 360,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
              padding: '20px 40px', borderRadius: 99,
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '2.5px solid #a7f3d0',
              color: '#059669',
              fontWeight: 800, fontSize: 20,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16,185,129,0.15)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.boxShadow = '0 18px 40px rgba(16,185,129,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)';
              e.currentTarget.style.color = '#059669';
              e.currentTarget.style.borderColor = '#a7f3d0';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.15)';
            }}
          >
            <FontAwesomeIcon icon={faMugHot} />
            Tham Khảo Đồ Uống
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} />
          </button>

          {/* 🍜 NÚT THAM KHẢO ĐẶC SẢN */}
          <button
            onClick={() => setSpecialtiesOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '20px 40px', borderRadius: 99,
              border: '2.5px solid #f97316',
              background: 'white', color: '#ea580c',
              fontWeight: 800, fontSize: 20,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(249,115,22,0.15)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.background = '#f97316';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.boxShadow = '0 18px 40px rgba(249,115,22,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#ea580c';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.15)';
            }}
          >
            <FontAwesomeIcon icon={faUtensils} />
            Tham Khảo Đặc Sản
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} />
          </button>
        </div>
        <div style={{ fontSize: '36px', fontWeight: '800', lineHeight: '1', marginBottom: '16px' }}>🧩 Kế hoạch chi tiết theo buổi</div>
      </div>

      {dailyPlans.map(d => {
        // 🌤️ Lấy dự báo thời tiết cho ngày tương ứng (d.day bắt đầu từ 1 → index 0)
        const dayForecast = weatherData?.forecast?.[d.day - 1] || null;

        return (
        <div key={d.day} style={{ marginBottom: '45px', padding: '35px', backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderRadius: '40px', marginTop: '40px' }}>
          {/* Header ngày + badge thời tiết */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '30px' }}>
            <div style={{ fontWeight: '900', color: '#10b981', fontSize: '26px' }}>
              <FontAwesomeIcon icon={faRegularCalendar} /> Ngày {d.day}
            </div>

            {/* 🌤️ Badge thời tiết ngày — chi tiết */}
            {dayForecast && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
                background: isDark ? 'rgba(15,36,64,0.85)' : 'rgba(219,234,254,0.7)',
                border: isDark ? '1px solid #1e3a5f' : '1px solid #bfdbfe',
                padding: '6px 14px', borderRadius: '16px',
                backdropFilter: 'blur(8px)',
              }}>
                {/* Icon + nhiệt độ */}
                <span style={{ fontSize: '20px' }}>{dayForecast.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '900', color: isDark ? '#f0f9ff' : '#1e40af' }}>
                  {dayForecast.high_c !== null ? `${dayForecast.high_c}°` : '--'}
                  <span style={{ fontWeight: 400, opacity: 0.6 }}> / </span>
                  {dayForecast.low_c !== null ? `${dayForecast.low_c}°` : '--'}
                </span>
                {/* Điều kiện */}
                <span style={{
                  fontSize: '12px', fontWeight: '700',
                  color: isDark ? '#93c5fd' : '#2563eb',
                  background: isDark ? 'rgba(37,99,235,0.18)' : 'rgba(219,234,254,0.8)',
                  padding: '2px 8px', borderRadius: '8px',
                }}>
                  {dayForecast.condition}
                </span>
                {/* % mưa */}
                {dayForecast.rain_chance != null && dayForecast.rain_chance > 0 && (
                  <span style={{
                    fontSize: '12px', fontWeight: '800',
                    color: '#3b82f6',
                    background: isDark ? 'rgba(59,130,246,0.18)' : '#eff6ff',
                    padding: '2px 8px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '3px',
                  }}>
                    💧 {dayForecast.rain_chance}%
                  </span>
                )}
                {/* Giờ mưa — hiện nếu có */}
                {dayForecast.rain_hours && dayForecast.rain_hours.length > 0 && (
                  <span style={{
                    fontSize: '11px', fontWeight: '700',
                    color: isDark ? '#7dd3fc' : '#0369a1',
                    background: isDark ? 'rgba(14,165,233,0.15)' : '#e0f2fe',
                    padding: '2px 8px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '3px',
                    cursor: 'default',
                    title: dayForecast.rain_hours.join(', '),
                  }}
                    title={`Mưa dự kiến: ${dayForecast.rain_hours.join(', ')}`}
                  >
                    🕐 {dayForecast.rain_hours.slice(0, 2).join(' · ')}
                    {dayForecast.rain_hours.length > 2 && ` +${dayForecast.rain_hours.length - 2}`}
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            
            {/* SÁNG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '800', color: '#f59e0b', fontSize: '14px' }}><FontAwesomeIcon icon={faSun} /> BUỔI SÁNG</div>
              <div style={{ display: 'flex', gap: '25px' }}>
                <PlaceCard type="Điểm tham quan" sessionLabel="Sáng" data={d.morning.tour} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day, session: 'morning', subType: 'tour' })} isDark={isDark} />
                <PlaceCard type="Địa điểm ăn uống" sessionLabel="Sáng" data={d.morning.food} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day, session: 'morning', subType: 'food' })} isDark={isDark} />
              </div>
            </div>
            
            {/* CHIỀU */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '800', color: '#3b82f6', fontSize: '14px' }}><FontAwesomeIcon icon={faCloudSun} /> BUỔI CHIỀU</div>
              <div style={{ display: 'flex', gap: '25px' }}>
                <PlaceCard type="Điểm tham quan" sessionLabel="Chiều" data={d.afternoon.tour} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day, session: 'afternoon', subType: 'tour' })} isDark={isDark} />
                <PlaceCard type="Địa điểm ăn uống" sessionLabel="Chiều" data={d.afternoon.food} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day, session: 'afternoon', subType: 'food' })} isDark={isDark} />
              </div>
            </div>
            
            {/* TỐI */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '800', color: '#8b5cf6', fontSize: '14px' }}><FontAwesomeIcon icon={faMoon} /> BUỔI TỐI</div>
              <div style={{ display: 'flex', gap: '25px' }}>
                <PlaceCard type="Điểm tham quan" sessionLabel="Tối" data={d.evening.tour} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day, session: 'evening', subType: 'tour' })} isDark={isDark} />
                <PlaceCard type="Địa điểm ăn uống" sessionLabel="Tối" data={d.evening.food} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day, session: 'evening', subType: 'food' })} isDark={isDark} />
              </div>
            </div>

          </div>
        </div>
        );
      })}
      </div>{/* end contentRef */}

      {/* ── ACTION PANEL ── */}
      <style>{`
        @keyframes apFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .ap-card {
          position: relative; display: flex; flex-direction: column; align-items: flex-start;
          gap: 6px; padding: 20px 22px; border-radius: 20px; border: none; cursor: pointer;
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease, background 0.2s;
          overflow: hidden; text-align: left;
        }
        .ap-card::before {
          content: ''; position: absolute; inset: 0; opacity: 0;
          transition: opacity 0.2s;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%);
          pointer-events: none;
        }
        .ap-card:hover::before { opacity: 1; }
        .ap-card:hover { transform: translateY(-5px) scale(1.025); }
        .ap-card:active { transform: scale(0.97); }
        .ap-icon-ring {
          width: 44px; height: 44px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .ap-label { font-size: 15px; font-weight: 900; color: white; line-height: 1.2; }
        .ap-sub   { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.72); }
      `}</style>

      <div style={{
        marginTop: '64px', marginBottom: '48px',
        padding: '32px 36px',
        borderRadius: '32px',
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #fdf4ff 100%)',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: isDark
          ? '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}>
        {/* Title */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 6px 18px rgba(16,185,129,0.35)',
          }}>✨</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: isDark ? '#f8fafc' : '#111827' }}>
              Lưu & Chia sẻ lịch trình
            </div>
            <div style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', fontWeight: 600 }}>
              4 tùy chọn · Xuất ra mọi định dạng bạn cần
            </div>
          </div>
        </div>

        {/* 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

          {/* 1. Lưu Dashboard */}
          <button className="ap-card" onClick={onSave}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 8px 28px rgba(16,185,129,0.40)' }}>
            <div className="ap-icon-ring" style={{ background: 'rgba(255,255,255,0.2)' }}>💾</div>
            <div className="ap-label">Lưu vào Dashboard</div>
            <div className="ap-sub">Truy cập lại bất cứ lúc nào</div>
          </button>

          {/* 2. iCal */}
          <ICalButtonNew dailyPlans={dailyPlans} initialData={initialData} currentHotel={currentHotel} />

          {/* 3. Screenshot */}
          <ScreenshotButtonNew contentRef={contentRef} location={initialData.location} isDark={isDark} />

          {/* 4. Share */}
          <ShareButtonNew dailyPlans={dailyPlans} initialData={initialData} currentHotel={currentHotel} plan={plan} isDark={isDark} />

        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// 🎨 NEW SLIM BUTTON VARIANTS (dùng trong ActionPanel)
// ─────────────────────────────────────────────────────────────
const ICalButtonNew = ({ dailyPlans, initialData, currentHotel }) => {
  const [status, setStatus] = React.useState('idle');
  const handleClick = () => {
    try {
      exportICalFile({ dailyPlans, initialData, currentHotel });
      setStatus('ok'); setTimeout(() => setStatus('idle'), 2500);
    } catch { setStatus('err'); setTimeout(() => setStatus('idle'), 2500); }
  };
  return (
    <button className="ap-card" onClick={handleClick} disabled={status !== 'idle'}
      style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 8px 28px rgba(37,99,235,0.40)', opacity: status !== 'idle' ? 0.85 : 1 }}>
      <div className="ap-icon-ring" style={{ background: 'rgba(255,255,255,0.2)' }}>
        {status === 'ok' ? '✅' : status === 'err' ? '❌' : '📅'}
      </div>
      <div className="ap-label">{status === 'ok' ? 'Đã tải xuống!' : status === 'err' ? 'Có lỗi xảy ra' : 'Xuất lịch .ics'}</div>
      <div className="ap-sub">Google / Apple Calendar</div>
    </button>
  );
};

const ScreenshotButtonNew = ({ contentRef, location, isDark }) => {
  const [status, setStatus] = React.useState('idle');
  const [prog, setProg]     = React.useState('');
  const handleClick = async () => {
    if (status !== 'idle') return;
    const el = contentRef?.current;
    if (!el) return;
    setStatus('loading');
    try {
      const html2canvas = (await import('html2canvas')).default;
      setProg('Đang tải ảnh...');
      const restore = await _preloadImages(el);
      setProg('Đang chụp...');
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: isDark ? '#111827' : '#ffffff', logging: false,
        ignoreElements: (n) => n.tagName === 'IFRAME',
        onclone: (doc) => {
          doc.querySelectorAll('iframe').forEach(f => { f.style.display = 'none'; });
          doc.querySelectorAll('.map-screenshot-overlay').forEach(d => { d.style.display = 'flex'; });
          doc.querySelectorAll('button').forEach(b => { b.style.transform = 'none'; b.style.boxShadow = 'none'; });
        },
      });
      restore();
      setProg('Đang lưu...');
      const loc = (location || 's-trip').toLowerCase().replace(/\s+/g, '-');
      await new Promise(res => {
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const a = Object.assign(document.createElement('a'), { href: url, download: `strip-${loc}.png` });
          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
          res();
        }, 'image/png');
      });
      setStatus('ok');
    } catch { setStatus('err'); }
    finally { setProg(''); setTimeout(() => setStatus('idle'), 3000); }
  };
  const labels = { idle: '📸 Xuất ảnh lịch trình', loading: prog || 'Đang xử lý...', ok: '✅ Đã tải xong!', err: '❌ Thử lại' };
  return (
    <button className="ap-card" onClick={handleClick} disabled={status === 'loading'}
      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 8px 28px rgba(124,58,237,0.40)', cursor: status === 'loading' ? 'wait' : 'pointer', opacity: status === 'loading' ? 0.85 : 1 }}>
      <div className="ap-icon-ring" style={{ background: 'rgba(255,255,255,0.2)' }}>
        {status === 'ok' ? '✅' : status === 'err' ? '❌' : '📸'}
      </div>
      <div className="ap-label">{labels[status]}</div>
      <div className="ap-sub">Tải về ảnh PNG chất lượng cao</div>
    </button>
  );
};

const ShareButtonNew = ({ dailyPlans, initialData, currentHotel, plan, isDark }) => {
  const [status,   setStatus]   = React.useState('idle');
  const [shareUrl, setShareUrl] = React.useState('');
  const [copied,   setCopied]   = React.useState(false);
  const [open,     setOpen]     = React.useState(false);

  const handleShare = async () => {
    if (status === 'loading') return;
    if (shareUrl) { setOpen(true); return; }
    setStatus('loading');
    try {
      const body = { plan: plan || {}, dailyPlans: dailyPlans || [],
        meta: { location: initialData.location, days: parseInt(String(initialData.days||'3').split(' ')[0]),
                origin: initialData.origin||initialData.from||'', startDate: initialData.startDate||initialData.departure_date||'' } };
      const res  = await fetch(`${BASE_URL}/api/trip/save`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error||'Lỗi server');
      setShareUrl(data.share_url); setStatus('ok'); setOpen(true);
    } catch { setStatus('err'); setTimeout(() => setStatus('idle'), 2500); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  const encodedUrl  = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`Xem lịch trình ${initialData.location} trên S-Trip! `);

  return (
    <>
      <button className="ap-card" onClick={handleShare} disabled={status === 'loading'}
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', boxShadow: '0 8px 28px rgba(14,165,233,0.40)', cursor: status === 'loading' ? 'wait' : 'pointer', opacity: status === 'loading' ? 0.85 : 1 }}>
        <div className="ap-icon-ring" style={{ background: 'rgba(255,255,255,0.2)' }}>
          {status === 'loading' ? '⏳' : status === 'err' ? '❌' : '🔗'}
        </div>
        <div className="ap-label">{status === 'loading' ? 'Đang tạo link...' : status === 'err' ? 'Có lỗi — thử lại' : 'Chia sẻ lịch trình'}</div>
        <div className="ap-sub">Gửi link qua Zalo / Messenger</div>
      </button>

      {/* Share panel popup */}
      {open && shareUrl && ReactDOM.createPortal(
        <>
          <style>{`@keyframes spUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
          <div onClick={() => setOpen(false)} style={{ position:'fixed',inset:0,zIndex:9999999,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
            <div onClick={e=>e.stopPropagation()} style={{ background: isDark?'#1e293b':'white', borderRadius:24, padding:'28px 28px 24px', width:'min(480px,95vw)', boxShadow:'0 32px 80px rgba(0,0,0,0.4)', animation:'spUp 0.25s ease', border: isDark?'1px solid #334155':'1px solid #e2e8f0' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
                <div style={{ fontSize:17,fontWeight:900,color:isDark?'#f8fafc':'#111827' }}>🔗 Chia sẻ lịch trình</div>
                <button onClick={()=>setOpen(false)} style={{ width:34,height:34,borderRadius:'50%',border:'none',background:isDark?'#334155':'#f1f5f9',color:isDark?'#94a3b8':'#64748b',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
              </div>
              {/* URL box */}
              <div style={{ display:'flex',gap:8,marginBottom:18 }}>
                <input readOnly value={shareUrl} style={{ flex:1,padding:'10px 14px',borderRadius:12,border:isDark?'1px solid #475569':'1px solid #e2e8f0',background:isDark?'#0f172a':'#f8fafc',color:isDark?'#f8fafc':'#1e293b',fontSize:13,fontWeight:600,outline:'none' }} />
                <button onClick={handleCopy} style={{ padding:'10px 18px',borderRadius:12,border:'none',background:copied?'#059669':'#10b981',color:'white',fontWeight:800,fontSize:13,cursor:'pointer',whiteSpace:'nowrap',transition:'0.2s' }}>
                  {copied ? '✅ Đã copy' : '📋 Copy'}
                </button>
              </div>
              {/* Social buttons */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                {[
                  { label:'💬 Zalo',     bg:'#0068ff', href:`https://zalo.me/share/url?url=${encodedUrl}&title=${encodedText}` },
                  { label:'📘 Messenger',bg:'#0084ff', href:`https://m.me/share?link=${encodedUrl}` },
                  { label:'🐦 Twitter',  bg:'#1da1f2', href:`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
                  { label:'📋 Copy link',bg:'#64748b', href:null, onClick: handleCopy },
                ].map(s => (
                  s.href
                    ? <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                        style={{ padding:'12px 14px',borderRadius:12,background:s.bg,color:'white',fontWeight:800,fontSize:13,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                        {s.label}
                      </a>
                    : <button key={s.label} onClick={s.onClick}
                        style={{ padding:'12px 14px',borderRadius:12,background:s.bg,color:'white',fontWeight:800,fontSize:13,border:'none',cursor:'pointer' }}>
                        {s.label}
                      </button>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default AiSchedule;