import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWandMagicSparkles, faHotel, faUtensils, faMapLocationDot,
  faPenToSquare, faStar, faXmark, faLocationArrow, faPlane,
  faSun, faCloudSun, faMoon, faMap, faImages, faComments, faSpinner,
  faUsers, faBed, faHome, faUserGroup,
  faBookmark as faBookmarkSolid,
  faHeart as faHeartSolid
} from '@fortawesome/free-solid-svg-icons';
import { 
  faCalendar as faRegularCalendar,
  faBookmark as faBookmarkRegular,
  faHeart as faHeartRegular
 } from '@fortawesome/free-regular-svg-icons';
import { fetchReviews, fetchImages } from '../services/api';

// 🖼️ Proxy ảnh Google qua backend để tránh bị chặn hotlink
const BASE_URL = 'http://127.0.0.1:5000'; // Đồng bộ với api.js
const GOOGLE_IMG_DOMAINS = ['googleusercontent.com', 'ggpht.com', 'googleapis.com', 'googleapi'];
const proxyImage = (url) => {
  if (!url) return null;
  // Không wrap placeholder — tránh proxy vô nghĩa
  if (url.includes('placehold.co') || url.includes('placeholder')) return url;
  if (GOOGLE_IMG_DOMAINS.some(d => url.includes(d))) {
    return `${BASE_URL}/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
};

// 📦 Mock data dự phòng khi backend không trả về dữ liệu
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

// ✅ FIX 1: Giữ lại lat/lng để MapBubble vẽ bản đồ được
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

// 🗺️ MAP MODAL POPUP — dùng Portal để thoát khỏi mọi stacking context
const MapModal = ({ placeName, query, onClose }) => {
  useEffect(() => {
    // Khóa scroll trang khi modal mở
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

      {/* Overlay — bấm ngoài để đóng */}
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
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Khung modal — stopPropagation để không đóng khi bấm bên trong */}
        <div
          className="map-box"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '760px',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FontAwesomeIcon icon={faMap} style={{ color: '#3b82f6', fontSize: '17px' }} />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '900', color: '#111827' }}>{placeName}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Bản đồ vị trí · Bấm ESC hoặc ra ngoài để đóng</div>
              </div>
            </div>
            <button
              className="map-close-btn"
              onClick={onClose}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                border: 'none', backgroundColor: '#f1f5f9',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 0.15s', fontSize: '16px', color: '#374151',
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Bản đồ */}
          <div style={{ height: '450px', flexShrink: 0 }}>
            <iframe
              title={`map-popup-${placeName}`}
              width="100%" height="100%"
              style={{ border: 0, display: 'block' }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
              allowFullScreen
            />
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 24px', borderTop: '1px solid #f1f5f9', flexShrink: 0,
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                padding: '10px 20px', borderRadius: '10px',
                backgroundColor: '#3b82f6', color: 'white',
                fontWeight: '700', fontSize: '13px',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '7px',
              }}
            >
              <FontAwesomeIcon icon={faLocationArrow} /> Mở Google Maps
            </a>
          </div>
        </div>
      </div>
    </>
  );

  // ✅ Portal: render thẳng vào document.body, thoát hoàn toàn khỏi mọi z-index cha
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

// 📸 ReviewsModal — hiển thị ảnh + comments qua Portal
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

      {/* Overlay — flex center */}
      <div
        className="rv-overlay"
        onClick={() => lightbox ? setLightbox(null) : onClose()}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999999,
          backgroundColor: lightbox ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Lightbox */}
        {lightbox && (
          <img src={proxyImage(lightbox)} alt="" referrerPolicy="no-referrer" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 14, objectFit: 'contain', boxShadow: '0 8px 50px rgba(0,0,0,0.7)' }}
          />
        )}

        {/* Modal box — bên trong overlay flex, tự căn giữa */}
        {!lightbox && (
          <div
            className="rv-box"
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(620px, 95vw)', maxHeight: '85vh',
              backgroundColor: 'white', borderRadius: 24,
              boxShadow: '0 30px 90px rgba(0,0,0,0.35)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
          {/* Header */}
          <div style={{ padding: '20px 22px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '44px', lineHeight: '1.4' }}>
                  {placeName}
                </div>
                {total && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{Number(total).toLocaleString()} đánh giá trên Google</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: 12 }}>
                
                {/* Nút Trái tim (Yêu thích) */}
                <button 
                  onClick={() => setIsFavorited(!isFavorited)} 
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: isFavorited ? '#fee2e2' : '#f1f5f9', color: isFavorited ? '#ef4444' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: '0.2s' }}
                  title="Yêu thích"
                >
                  <FontAwesomeIcon icon={isFavorited ? faHeartSolid : faHeartRegular} />
                </button>

                {/* Nút Bookmark (Lưu trữ) */}
                <button 
                  onClick={() => setIsSaved(!isSaved)} 
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: isSaved ? '#fef08a' : '#f1f5f9', color: isSaved ? '#eab308' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: '0.2s' }}
                  title="Lưu trữ"
                >
                  <FontAwesomeIcon icon={isSaved ? faBookmarkSolid : faBookmarkRegular} />
                </button>

                {/* Nút X (Đóng) */}
                <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#374151' }}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', gap: 4 }}>
              {[
                { key: 'images',  label: 'Hình ảnh',  icon: faImages  },
                { key: 'reviews', label: 'Đánh giá', icon: faComments },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700,
                  color: tab === t.key ? '#8b5cf6' : '#9ca3af',
                  borderBottom: tab === t.key ? '2px solid #8b5cf6' : '2px solid transparent',
                  marginBottom: -2, transition: '0.15s',
                }}>
                  <FontAwesomeIcon icon={t.icon} />
                  {t.label}
                  {t.key === 'images' && images.length > 0 && (
                    <span style={{ background: '#8b5cf620', color: '#8b5cf6', fontSize: 10, fontWeight: 900, padding: '1px 6px', borderRadius: 99 }}>
                      {images.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: 180, color: '#9ca3af' }}>
                <FontAwesomeIcon icon={faSpinner} style={{ fontSize: 28, color: '#8b5cf6', animation: 'rvSpin 1s linear infinite' }} />
                <div style={{ fontSize: 13 }}>Đang tải dữ liệu...</div>
              </div>
            )}

            {!loading && error && (
              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: 14, padding: '50px 0' }}>{error}</div>
            )}

            {/* Tab Reviews */}
            {!loading && !error && tab === 'reviews' && (
              reviews.length === 0
                ? <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, padding: '50px 0' }}>Chưa có đánh giá nào.</div>
                : <div style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* 🟢 1. BỘ LỌC KIỂU SHOPEE */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      {['all', 5, 4, 3, 2, 1].map(star => (
                        <button
                          key={star}
                          onClick={() => { setFilterStar(star); setVisibleCount(10); }} // Click thì đổi filter và reset lại mốc 10
                          style={{
                            padding: '6px 14px', borderRadius: '20px',
                            border: filterStar === star ? '1px solid #8b5cf6' : '1px solid #e2e8f0',
                            backgroundColor: filterStar === star ? '#f5f3ff' : '#f8fafc',
                            color: filterStar === star ? '#8b5cf6' : '#475569',
                            fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: '0.2s',
                            display: stats[star] === 0 && star !== 'all' ? 'none' : 'block' // Ẩn nút nếu không có sao đó
                          }}
                        >
                          {star === 'all' ? 'Tất cả' : `${star} Sao`} ({stats[star]})
                        </button>
                      ))}
                    </div>

                    {/* 🟢 2. DANH SÁCH ĐÁNH GIÁ (Đã qua bộ lọc) */}
                    {displayedReviews.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px 0', fontSize: 14 }}>Không có đánh giá {filterStar} sao nào.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {displayedReviews.map((r, i) => (
                          <div key={i} style={{ background: '#f8fafc', borderRadius: 16, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                {r.avatar
                                  ? <img src={r.avatar} referrerPolicy="no-referrer" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <span style={{ color: 'white', fontWeight: 900, fontSize: 15 }}>{(r.user || 'U')[0].toUpperCase()}</span>
                                }
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{r.user || 'Người dùng ẩn danh'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Stars rating={r.rating} />
                                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{r.date || ''}</span>
                                </div>
                              </div>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.65 }}>{r.content || 'Không có nội dung.'}</p>
                            
                            {/* Hiển thị Ảnh đính kèm (nếu có) */}
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
                    )}

                    {/* 🟢 3. NÚT XEM THÊM */}
                    {visibleCount < filteredReviews.length && (
                      <button
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        style={{
                          marginTop: '16px', padding: '12px', borderRadius: '12px',
                          border: '1px dashed #cbd5e1', backgroundColor: 'transparent',
                          color: '#64748b', fontWeight: '700', fontSize: '13px',
                          cursor: 'pointer', transition: '0.2s', textAlign: 'center'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.color = '#8b5cf6'; e.currentTarget.style.backgroundColor = '#f5f3ff'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        Xem thêm đánh giá ({filteredReviews.length - visibleCount} cái nữa) ⬇️
                      </button>
                    )}

                  </div>
            )}

            {/* Tab Images */}
            {!loading && !error && tab === 'images' && (
              images.length === 0
                ? <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, padding: '50px 0' }}>Chưa có hình ảnh nào.</div>
                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {images.map((url, i) => (
                      <div key={i} onClick={() => setLightbox(url)}
                        style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'zoom-in', background: '#f1f5f9' }}
                      >
                        <img src={proxyImage(url)} alt="" className="rv-img"
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.2s', display: 'block' }}
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    ))}
                  </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 22px', borderTop: '1px solid #f1f5f9', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#d1d5db' }}>Dữ liệu từ Google Maps · SerpAPI</span>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', textDecoration: 'none' }}
            >
              Xem trên Google Maps ↗
            </a>
          </div>
        </div>
        )}
      </div>
    </>,
    document.body
  );
};

// 🎨 PlaceCard
const PlaceCard = ({ type, data, sessionLabel, locationName, setMapQuery, onShowMap, onEdit, guestCount }) => {
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [isHovered,   setIsHovered]   = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isHotel = type === 'Khách sạn';
  const isFlight = type === 'Chuyến bay';
  const icon = isHotel ? faHotel : (isFlight ? faPlane : (type === 'Địa điểm ăn uống' ? faUtensils : faMapLocationDot));
  const mainColor = isHotel ? '#3b82f6' : (isFlight ? '#10b981' : (type === 'Điểm tham quan' ? '#8b5cf6' : '#f97316'));
  const sessionIcon = sessionLabel === 'Sáng' ? faSun : (sessionLabel === 'Chiều' ? faCloudSun : faMoon);

  const getRoomIcon = (roomType) => {
    if (roomType?.includes("Nguyên căn") || roomType?.includes("Bungalow")) return faHome;
    if (roomType?.includes("Family") || roomType?.includes("Tập thể")) return faUsers;
    if (roomType?.includes("Đôi")) return faUserGroup; // Icon 2 người
    return faBed; // Mặc định cho Phòng đơn / Tiêu chuẩn
  };

  const handleLocation = () => {
    const query = `${data.name} ${locationName}`;
    if (setMapQuery) {
      setMapQuery(query);
    } else if (onShowMap) {
      onShowMap(query, data.name);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'white', borderRadius: '20px', padding: '18px 20px',
        display: 'flex', gap: '16px',
        border: '1px solid #f1f5f9', flex: 1,
        boxShadow: isHovered 
      ? '0 15px 35px rgba(0,0,0,0.12)' 
      : '0 2px 8px rgba(0,0,0,0.06)',
        alignItems: 'center',
        transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: isHovered ? 10 : 1,
        position: 'relative'
      }}
    >

      {/* NÚT BOOKMARK */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }}
        style={{
          position: 'absolute', top: '12px', right: '12px',
          backgroundColor: isSaved ? '#fef08a' : 'rgba(255,255,255,0.85)',
          color: isSaved ? '#eab308' : '#9ca3af',
          border: '1px solid #f1f5f9', borderRadius: '8px',
          width: '32px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 20, backdropFilter: 'blur(4px)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: '0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title={isSaved ? "Bỏ lưu" : "Lưu địa điểm"}
      >
        <FontAwesomeIcon icon={isSaved ? faBookmarkSolid : faBookmarkRegular} style={{ fontSize: '15px' }} />
      </button>

      {/* Ảnh — zoom nhẹ khi hover */}
      <div style={{
        width: '120px', height: '120px', flexShrink: 0,
        borderRadius: '14px', overflow: 'hidden',
        backgroundColor: '#f8fafc',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}>
        {data.thumbnail ? (
          <img
            src={proxyImage(data.thumbnail)}
            alt="thumb"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: isHovered ? 'scale(1.09)' : 'scale(1)',
              transition: 'transform 0.4s ease',
              display: 'block',
            }}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x120?text=S-Trip'; }}
          />
        ) : (
          <FontAwesomeIcon icon={sessionLabel ? sessionIcon : icon} style={{ fontSize: '28px', color: mainColor }} />
        )}
      </div>

      {/* Nội dung */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: mainColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {sessionLabel ? `${sessionLabel} · ${type}` : type}
        </div>
        {/* Tên — khít với khung: tối đa 2 dòng, cắt ellipsis */}
        <div style={{
          fontSize: '16px', fontWeight: '900', color: '#111827',
          margin: '4px 0 5px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.35',
          wordBreak: 'break-word',
        }}>
          {data.name || data.airline}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ color: '#eab308', fontWeight: '700', fontSize: '13px' }}>
            <FontAwesomeIcon icon={faStar} /> {data.rating || 'N/A'}
          </span>
          <span style={{ color: '#10b981', fontWeight: '800', fontSize: '13px' }}>{data.price}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '10px'}}>
          {data.desc}
        </div>

        {(isHotel || isFlight) && guestCount && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            
            {/* Pill Số lượng khách (Màu xanh dương cho KS, xanh ngọc cho Máy bay) */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '5px', 
              backgroundColor: isFlight ? '#ecfdf5' : '#eff6ff', 
              padding: '4px 10px', 
              borderRadius: '6px', border: `1px solid ${isFlight ? '#a7f3d0' : '#dbeafe'}` 
            }}>
              <FontAwesomeIcon icon={faUsers} style={{ fontSize: '10px', color: isFlight ? '#059669' : '#3b82f6' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: isFlight ? '#065f46' : '#1e40af' }}>
                {isFlight ? `Vé cho ${guestCount} khách` : `${guestCount} khách`}
              </span>
            </div>

            {/* Pill Loại phòng (Chỉ Khách sạn mới có) */}
            {isHotel && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '5px', 
                backgroundColor: '#f5f3ff', padding: '4px 10px', 
                borderRadius: '6px', border: '1px solid #ede9fe' 
              }}>
                <FontAwesomeIcon icon={getRoomIcon(data.room_type)} style={{ fontSize: '10px', color: '#8b5cf6' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#5b21b6' }}>
                  {data.room_type || "Phòng tiêu chuẩn"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Nút */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          {!isFlight && (
            <button
              onClick={handleLocation}
              style={{
                padding: '7px 14px', borderRadius: '10px', border: 'none',
                backgroundColor: '#3b82f6', color: 'white', fontWeight: '700',
                cursor: 'pointer', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <FontAwesomeIcon icon={faLocationArrow} style={{ fontSize: '10px' }} /> Vị trí
            </button>
          )}
          {!isFlight && (
            <button
              onClick={() => setReviewsOpen(true)}
              style={{
                padding: '7px 14px', borderRadius: '10px',
                border: '1.5px solid #0d9488', backgroundColor: 'white',
                color: '#0d9488', fontWeight: '700', cursor: 'pointer', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '5px', transition: '0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0d9488'; }}
            >
              <FontAwesomeIcon icon={faStar} style={{ fontSize: '10px' }} /> Reviews
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              style={{
                padding: '7px 12px', borderRadius: '10px',
                border: `1.5px solid ${mainColor}`, color: mainColor,
                backgroundColor: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: '10px' }} /> Đổi
            </button>
          )}
        </div>
      </div>

      {reviewsOpen && (
        <ReviewsModal placeName={data.name || data.airline} placeId={data.place_id || ""} onClose={() => setReviewsOpen(false)} />
      )}
    </div>
  );
};

// ── COMPONENT CHÍNH ──────────────────────────────────────────
const AiSchedule = ({ data: initialData, onSave, onPlanChange }) => {
  const numDays = parseInt(initialData?.days?.toString().split(' ')[0]) || 3;
  const [dailyPlans, setDailyPlans] = useState([]);
  const [mapQuery, setMapQuery] = useState('');           // ← map tĩnh cho khách sạn
  const [modal, setModal] = useState({ show: false, type: '', day: null, session: '', subType: '' });
  const [mapModal, setMapModal] = useState({ show: false, query: '', placeName: '' }); // ← popup cho tham quan/ăn uống
  const passengers = initialData.passengers || 1;

  // ✅ Chuẩn hóa dữ liệu thật từ Backend
  const realHotels = (initialData.realHotels || []).map(h => ({
    name: h.name,
    rating: h.rating,
    price: h.price_per_night?.toLocaleString() + "đ/đêm" || "Liên hệ",
    thumbnail: h.thumbnail,
    desc: h.desc || "Lựa chọn tốt nhất dựa trên ngân sách.",
    lat: h.lat,
    lng: h.lng,
    place_id: h.place_id || "",
    room_type: h.room_type,
  }));

  const realTours = (initialData.realTours || []).map(normalizeActivity);
  const realFoods = (initialData.realFoods || []).map(normalizeActivity);
  
  // ✅ Tạo Pool dữ liệu (ưu tiên dữ liệu thật)
  const hotelsPool = realHotels.length > 0 ? realHotels : mockRepo['Khách sạn'];
  const toursPool = realTours.length > 0 ? realTours : mockRepo['Điểm tham quan'];
  const foodsPool = realFoods.length > 0 ? realFoods : mockRepo['Địa điểm ăn uống'];

  const [currentHotel, setCurrentHotel] = useState(hotelsPool[0]);

  // Effect khởi tạo lịch trình theo số ngày & địa điểm
  useEffect(() => {
    const plans = [];
    for (let i = 0; i < numDays; i++) {
      plans.push({
        day: i + 1,
        morning: {
          tour: toursPool[(i * 3) % toursPool.length],
          food: foodsPool[(i * 3) % foodsPool.length]
        },
        afternoon: {
          tour: toursPool[(i * 3 + 1) % toursPool.length],
          food: foodsPool[(i * 3 + 1) % foodsPool.length]
        },
        evening: {
          tour: toursPool[(i * 3 + 2) % toursPool.length],
          food: foodsPool[(i * 3 + 2) % foodsPool.length]
        }
      });
    }
    setDailyPlans(plans);
    if (onPlanChange) onPlanChange(plans);
    setMapQuery(`${currentHotel.name} ${initialData.location}`);
  }, [initialData.location, numDays]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ FIX 2: Lắng nghe khi geocode hoàn tất (realTours/realFoods được enrich lat/lng từ App.js)
  // Patch tọa độ mới vào dailyPlans để MapBubble nhận được và vẽ bản đồ chính xác
  useEffect(() => {
    if (!dailyPlans.length) return;

    // Xây bảng tra cứu tọa độ theo tên địa điểm
    const coordMap = {};
    [...(initialData.realTours || []), ...(initialData.realFoods || [])].forEach(p => {
      if (p.lat && p.lng) coordMap[p.name] = { lat: p.lat, lng: p.lng };
    });
    if (!Object.keys(coordMap).length) return;

    setDailyPlans(prev => {
      const updated = prev.map(d => ({
        ...d,
        morning: {
          tour: { ...d.morning.tour, ...(coordMap[d.morning.tour?.name] || {}) },
          food: { ...d.morning.food, ...(coordMap[d.morning.food?.name] || {}) },
        },
        afternoon: {
          tour: { ...d.afternoon.tour, ...(coordMap[d.afternoon.tour?.name] || {}) },
          food: { ...d.afternoon.food, ...(coordMap[d.afternoon.food?.name] || {}) },
        },
        evening: {
          tour: { ...d.evening.tour, ...(coordMap[d.evening.tour?.name] || {}) },
          food: { ...d.evening.food, ...(coordMap[d.evening.food?.name] || {}) },
        },
      }));
      if (onPlanChange) onPlanChange(updated); // ← thông báo MapBubble tọa độ đã sẵn sàng
      return updated;
    });
  }, [initialData.realTours, initialData.realFoods]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🆕 Hàm mở Map Modal
  const handleShowMap = (query, placeName) => {
    setMapModal({ show: true, query, placeName });
  };

  const handleUpdate = (newVal) => {
    if (modal.type === 'Khách sạn') {
      setCurrentHotel(newVal);
      window.dispatchEvent(new CustomEvent('sTripHotelChanged', { detail: newVal }));
      setMapQuery(`${newVal.name} ${initialData.location}`); // ← cập nhật map tĩnh khi đổi khách sạn
    } else {
      setDailyPlans(prev => {
        const next = prev.map(d => d.day === modal.day
          ? { ...d, [modal.session]: { ...d[modal.session], [modal.subType]: newVal } }
          : d);
        if (onPlanChange) onPlanChange(next); // 🔗 Thông báo MapBubble địa điểm vừa đổi
        return next;
      });
    }
    setModal({ show: false, type: '', day: null, session: '', subType: '' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>

      {/* 🗺️ MAP MODAL POPUP */}
      {mapModal.show && (
        <MapModal
          placeName={mapModal.placeName}
          query={mapModal.query}
          onClose={() => setMapModal({ show: false, query: '', placeName: '' })}
        />
      )}

      {/* MODAL ĐỔI LỰA CHỌN */}
      {modal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }} onClick={() => setModal({ show: false })}>
          <div style={{ backgroundColor: 'white', borderRadius: '35px', width: '550px', padding: '35px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '900' }}>Chọn {modal.type} tại {initialData.location}</h2>
              <FontAwesomeIcon icon={faXmark} style={{ cursor: 'pointer', fontSize: '28px', color: '#9ca3af' }} onClick={() => setModal({ show: false })} />
            </div>
            
            {(modal.type === 'Khách sạn' ? hotelsPool : (modal.subType === 'tour' ? toursPool : foodsPool)).map((opt, i) => (
              <div key={i} onClick={() => handleUpdate(opt)} style={{ 
                  padding: '20px', borderRadius: '20px', border: '2px solid #f1f5f9', marginBottom: '10px', 
                  cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center' 
                }}>
                <img 
                  src={proxyImage(opt.thumbnail) || "https://placehold.co/60x60?text=S-Trip"} 
                  style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} 
                  alt="thumb" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/60x60?text=S-Trip"; 
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800' }}>{opt.name} · <span style={{ color: '#eab308' }}>{opt.rating}⭐</span></div>
                  <div style={{ color: '#10b981', fontWeight: '700' }}>{opt.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '80px', fontWeight: '900' }}>
          <FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: '#10b981', marginRight: '18px' }} />
          Hành trình tại <span style={{ color: '#10b981' }}>{initialData.location}</span>
        </h1>
        <p style={{ fontSize: '28px', color: '#64748b' }}>Hành trình {numDays} ngày {numDays - 1} đêm của bạn sẵn sàng ✨</p>
      </div>

      {/* 1. CHUYẾN BAY */}
      {initialData.realFlights?.length > 0 && (
        <div style={{ marginBottom: '55px' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>✈️ Chuyến bay đề xuất</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            {initialData.realFlights.slice(0, 2).map((f, i) => (
              <PlaceCard 
                key={i} 
                type="Chuyến bay" 
                data={{
                  airline: f.airline, 
                  price: f.price?.toLocaleString() + "đ",
                  thumbnail: f.thumbnail, 
                  desc: `Hãng bay: ${f.airline} • Thời gian bay: ${f.duration || 'N/A'}`
                }} 
                locationName={initialData.location} 
                onShowMap={handleShowMap} 
                guestCount={passengers} 
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. KHÁCH SẠN */}
      <div style={{ marginBottom: '60px' }}>
        <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>
          🛌 Chỗ ở {initialData.realHotels?.length > 0 ? '(Dữ liệu thực)' : '(Gợi ý)'}
        </div>
        <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '40px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <PlaceCard
            type="Khách sạn"
            data={currentHotel}
            locationName={initialData.location}
            setMapQuery={setMapQuery}
            guestCount={passengers}
            onEdit={() => setModal({ show: true, type: 'Khách sạn' })}
          />
          {/* Map tĩnh giữ nguyên như ban đầu */}
          <div style={{ borderRadius: '25px', overflow: 'hidden', height: '450px', border: '1px solid #e2e8f0' }}>
            <iframe 
              title="map" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              /* ✅ Sửa lại URL chuẩn bên dưới */
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            ></iframe>
          </div>
        </div>
      </div>

      {/* 3. LỊCH TRÌNH 3 BUỔI */}
      <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '25px' }}>🧩 Kế hoạch chi tiết theo buổi</div>
      {dailyPlans.map(d => (
        <div key={d.day} style={{ marginBottom: '45px', padding: '35px', backgroundColor: '#f8fafc', borderRadius: '40px' }}>
          <div style={{ fontWeight: '900', color: '#10b981', fontSize: '26px', marginBottom: '30px' }}>
            <FontAwesomeIcon icon={faRegularCalendar} /> Ngày {d.day}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            {/* Morning */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '800', color: '#f59e0b', fontSize: '14px' }}><FontAwesomeIcon icon={faSun} /> BUỔI SÁNG</div>
              <div style={{ display: 'flex', gap: '25px' }}>
                <PlaceCard type="Điểm tham quan" sessionLabel="Sáng" data={d.morning.tour} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day, session: 'morning', subType: 'tour' })} />
                <PlaceCard type="Địa điểm ăn uống" sessionLabel="Sáng" data={d.morning.food} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day, session: 'morning', subType: 'food' })} />
              </div>
            </div>

            {/* Afternoon */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '800', color: '#3b82f6', fontSize: '14px' }}><FontAwesomeIcon icon={faCloudSun} /> BUỔI CHIỀU</div>
              <div style={{ display: 'flex', gap: '25px' }}>
                <PlaceCard type="Điểm tham quan" sessionLabel="Chiều" data={d.afternoon.tour} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day, session: 'afternoon', subType: 'tour' })} />
                <PlaceCard type="Địa điểm ăn uống" sessionLabel="Chiều" data={d.afternoon.food} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day, session: 'afternoon', subType: 'food' })} />
              </div>
            </div>

            {/* Evening */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '800', color: '#8b5cf6', fontSize: '14px' }}><FontAwesomeIcon icon={faMoon} /> BUỔI TỐI</div>
              <div style={{ display: 'flex', gap: '25px' }}>
                <PlaceCard type="Điểm tham quan" sessionLabel="Tối" data={d.evening.tour} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day, session: 'evening', subType: 'tour' })} />
                <PlaceCard type="Địa điểm ăn uống" sessionLabel="Tối" data={d.evening.food} locationName={initialData.location} onShowMap={handleShowMap} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day, session: 'evening', subType: 'food' })} />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* NÚT LƯU */}
      <div style={{ textAlign: 'center', marginTop: '60px', paddingBottom: '40px' }}>
        <button onClick={onSave} style={{ backgroundColor: '#10b981', color: 'white', padding: '22px 65px', borderRadius: '99px', border: 'none', fontWeight: '800', fontSize: '24px', cursor: 'pointer', boxShadow: '0 12px 35px rgba(16,129,129,0.4)' }}>
          💾 Lưu lịch trình vào Dashboard
        </button>
      </div>
    </div>
  );
};

export default AiSchedule;