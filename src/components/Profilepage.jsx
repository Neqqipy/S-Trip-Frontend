// ProfilePage.jsx
// ================================================================
// 👤 TRANG HỒ SƠ CÁ NHÂN — S-Trip
// ================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BASE_URL } from '../config';

// ── Icons SVG inline ──────────────────
const Icon = {
  heart:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  bookmark: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>,
  search:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  trash:    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  camera:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>,
  edit:     <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  back:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  map:      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>,
  clock:    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>,
  star:     <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  plane:    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>,
};

const GOOGLE_IMG_DOMAINS = ['googleusercontent.com', 'ggpht.com', 'googleapis.com', 'googleapi'];

const proxyImage = (url) => {
  if (!url) return null;
  if (url.includes('placehold.co') || url.includes('placeholder')) return url;

  let rawUrl = url;
  let isProxied = false;
  if (url.includes('api/proxy-image')) {
    const match = url.match(/[?&]url=([^&]+)/);
    if (match) {
      rawUrl = decodeURIComponent(match[1]);
      isProxied = true;
    } else {
      return url;
    }
  }

  let optimizedUrl = rawUrl;
  
  if (GOOGLE_IMG_DOMAINS.some(d => rawUrl.includes(d))) {
    if (optimizedUrl.includes('=')) {
      optimizedUrl = optimizedUrl.replace(/=.*$/, '=w600-h450-k-no');
    } else {
      optimizedUrl = `${optimizedUrl}=w600-h450-k-no`;
    }
    return `${BASE_URL}/api/proxy-image?url=${encodeURIComponent(optimizedUrl)}`;
  }

  // Nâng cấp ảnh Tripadvisor từ photo-s (small) hoặc photo-m lên photo-w (wide/high-res)
  if (rawUrl.includes('tripadvisor.com') && rawUrl.includes('/media/photo-')) {
    optimizedUrl = optimizedUrl.replace(/\/media\/photo-[a-z]\//, '/media/photo-w/');
    return `${BASE_URL}/api/proxy-image?url=${encodeURIComponent(optimizedUrl)}`;
  }

  return isProxied ? url : optimizedUrl;
};

// Hook thông minh khử mờ ảnh: Tự gọi API lấy ảnh nét và UPDATE lưu đè vĩnh viễn vào DB
const useCrispImageProfile = (item, tabType, T) => {
  const [imgUrl, setImgUrl] = useState(item?.thumbnail || null);

  useEffect(() => {
    if (!item?.thumbnail) return;
    
    const initialThumbnail = item.thumbnail;
    // Kiểm tra xem ảnh gốc trả về từ DB có phải ảnh mờ gstatic không
    const isLowRes = initialThumbnail.includes('gstatic.com') || initialThumbnail.includes('encrypted-tbn');
    
    // Nếu ảnh ĐÃ NÉT SẴN rồi thì lấy luôn, dừng lại không gọi API nữa (Tốn 0 lượt Serp_API)
    if (!isLowRes) {
      setImgUrl(initialThumbnail);
      return;
    }

    let isMounted = true;
    const updateHighResInDB = async () => {
      try {
        let highResUrl = null;
        
        // 1. Thử tìm ảnh nét trong kho ảnh review
        const revData = await api.get(`/api/places/reviews?name=${encodeURIComponent(item.name)}`);
        const photos = (revData?.reviews || []).flatMap(r => r.photos || []);
        
        if (photos.length > 0) {
          highResUrl = photos[0];
        } else {
          // 2. Nếu review không có, tìm trong kho ảnh chính thức của địa điểm
          const imgData = await api.get(`/api/places/images?name=${encodeURIComponent(item.name)}`);
          if (imgData?.images?.length > 0) highResUrl = imgData.images[0];
        }

        // Nếu tìm được ảnh nét cao và component chưa bị tắt
        if (highResUrl && isMounted) {
          setImgUrl(highResUrl);

          // 💾 GỌI LÊN BACKEND LƯU ĐÈ ẢNH NÉT VÀO DATABASE VĨNH VIỄN
          const endpoint = tabType === 'saved' ? `/api/saved-places/${item.id}` : `/api/favorites/${item.id}`;
          await api.put(endpoint, {
            ...item,
            thumbnail: highResUrl // Lưu đè link nét
          });
          console.log(`Đã đồng bộ ảnh nét vĩnh viễn vào DB cho: ${item.name}`);
        }
      } catch (err) {
        console.error("Lỗi tự động cập nhật ảnh nét:", err);
      }
    };

    updateHighResInDB();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, item?.thumbnail, tabType]);

  return imgUrl;
};

// ── Design Tokens ─────────────────────────────────────────────
// Primary: Emerald mượt mà — đủ sáng, không neon
// Neutral Dark: xanh đen sâu slate-based
// Neutral Light: trắng xám f8fafc
const C = {
  primary:  '#10b981',   // Sky-500 — xanh lam teal hiện đại, thoát khỏi neon-green
  primary2: '#059669',   // Sky-600 — hover/active shade
  primaryBg10: 'rgba(16,185,129,0.10)', // nền nút active nhẹ
  primaryBg15: 'rgba(16,185,129,0.15)', // nền tag/badge
  dark:     '#0f172a',   // Slate-900
  card:     '#1e293b',   // Slate-800
  border:   '#334155',   // Slate-700
  text:     '#f1f5f9',   // Slate-100
  muted:    '#94a3b8',   // Slate-400 — đủ tương phản trên dark bg (4.6:1)
  danger:   '#f87171',   // Red-400 — muted hơn ef4444, vẫn đọc được
  dangerBg: 'rgba(248,113,113,0.10)',
  warn:     '#fbbf24',   // Amber-400 — ấm hơn f59e0b
  warnBg:   'rgba(251,191,36,0.10)',
};

const THEME = {
  // Dark: nền slate đơn sắc, card layer rõ ràng, border mờ nhẹ
  dark: {
    bg:          '#0b1120',                      // xanh đen sâu — không gradient
    text:        '#f1f5f9',                      // Slate-100
    muted:       '#94a3b8',                      // Slate-400
    card:        '#1e293b',                      // Slate-800 — solid, rõ layer
    cardBorder:  'rgba(255,255,255,0.07)',        // mờ tối 7%
    inputBg:     'rgba(255,255,255,0.05)',        // 5%
    inputBorder: 'rgba(255,255,255,0.10)',        // 10%
    inputColor:  '#f1f5f9',
    headerBg:    'rgba(11,17,32,0.85)',           // blur dark header
    headerBorder:'rgba(255,255,255,0.06)',
    btnBg:       'rgba(255,255,255,0.06)',
    btnBorder:   'rgba(255,255,255,0.09)',
    rowBorder:   'rgba(255,255,255,0.05)',
    scrollbar:   '#334155',
  },
  // Light: nền xám nhạt, card trắng tinh, border xám đủ thấy
  light: {
    bg:          '#f1f5f9',                      // Slate-100
    text:        '#0f172a',                      // Slate-900
    muted:       '#64748b',                      // Slate-500
    card:        '#ffffff',                      // trắng tinh
    cardBorder:  'rgba(15,23,42,0.13)',          // đen 13% — đủ thấy trên nền trắng/xám
    inputBg:     '#f8fafc',
    inputBorder: 'rgba(15,23,42,0.15)',
    inputColor:  '#0f172a',
    headerBg:    'rgba(241,245,249,0.92)',
    headerBorder:'rgba(15,23,42,0.08)',
    btnBg:       'rgba(15,23,42,0.06)',
    btnBorder:   'rgba(15,23,42,0.14)',
    rowBorder:   'rgba(15,23,42,0.07)',
    scrollbar:   '#cbd5e1',
  },
};

const api = {
  get:  (path) => fetch(`${BASE_URL}${path}`, { credentials: 'include' }).then(r => r.json()),
  post: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  del:  (path) => fetch(`${BASE_URL}${path}`, { method: 'DELETE', credentials: 'include' }).then(r => r.json()),
};

const formatDate = (ds) => {
  if (!ds) return '';
  const d = new Date(ds);
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
};

const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD') // Tách dấu ra khỏi chữ cái
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Xử lý riêng chữ đ/Đ
    .toLowerCase(); // Chuyển hết về chữ thường
};

// 🗺️ ẢNH ĐẠI DIỆN TỈNH THÀNH — dùng ảnh local từ /images_provinces/
// Map tên tỉnh (viết thường) → slug file JPG
const PROVINCE_SLUG = {
  'hà nội':               'ha-noi',
  'hà giang':             'ha-giang',
  'cao bằng':             'cao-bang',
  'bắc kạn':              'bac-kan',
  'tuyên quang':          'tuyen-quang',
  'lào cai':              'lao-cai',
  'sapa':                 'lao-cai',
  'điện biên':            'dien-bien',
  'lai châu':             'lai-chau',
  'sơn la':               'son-la',
  'yên bái':              'yen-bai',
  'hòa bình':             'hoa-binh',
  'thái nguyên':          'thai-nguyen',
  'lạng sơn':             'lang-son',
  'quảng ninh':           'quang-ninh',
  'hạ long':              'quang-ninh',
  'bắc giang':            'bac-giang',
  'phú thọ':              'phu-tho',
  'vĩnh phúc':            'vinh-phuc',
  'bắc ninh':             'bac-ninh',
  'hải dương':            'hai-duong',
  'hải phòng':            'hai-phong',
  'hưng yên':             'hung-yen',
  'thái bình':            'thai-binh',
  'hà nam':               'ha-nam',
  'nam định':             'nam-dinh',
  'ninh bình':            'ninh-binh',
  'thanh hóa':            'thanh-hoa',
  'nghệ an':              'nghe-an',
  'hà tĩnh':              'ha-tinh',
  'quảng bình':           'quang-binh',
  'quảng trị':            'quang-tri',
  'thừa thiên huế':       'thua-thien-hue',
  'huế':                  'thua-thien-hue',
  'đà nẵng':              'da-nang',
  'quảng nam':            'quang-nam',
  'hội an':               'quang-nam',
  'quảng ngãi':           'quang-ngai',
  'bình định':            'binh-dinh',
  'quy nhơn':             'binh-dinh',
  'phú yên':              'phu-yen',
  'khánh hòa':            'khanh-hoa',
  'nha trang':            'khanh-hoa',
  'ninh thuận':           'ninh-thuan',
  'bình thuận':           'binh-thuan',
  'phan thiết':           'binh-thuan',
  'kon tum':              'kon-tum',
  'gia lai':              'gia-lai',
  'pleiku':               'gia-lai',
  'đắk lắk':              'dak-lak',
  'buôn ma thuột':        'dak-lak',
  'đắk nông':             'dak-nong',
  'lâm đồng':             'lam-dong',
  'đà lạt':               'lam-dong',
  'bình phước':           'binh-phuoc',
  'tây ninh':             'tay-ninh',
  'bình dương':           'binh-duong',
  'đồng nai':             'dong-nai',
  'bà rịa - vũng tàu':   'ba-ria-vung-tau',
  'vũng tàu':             'ba-ria-vung-tau',
  'tp. hồ chí minh':      'tp-ho-chi-minh',
  'hồ chí minh':          'tp-ho-chi-minh',
  'sài gòn':              'tp-ho-chi-minh',
  'long an':              'long-an',
  'tiền giang':           'tien-giang',
  'bến tre':              'ben-tre',
  'trà vinh':             'tra-vinh',
  'vĩnh long':            'vinh-long',
  'đồng tháp':            'dong-thap',
  'an giang':             'an-giang',
  'kiên giang':           'kien-giang',
  'phú quốc':             'kien-giang',
  'cần thơ':              'can-tho',
  'hậu giang':            'hau-giang',
  'sóc trăng':            'soc-trang',
  'bạc liêu':             'bac-lieu',
  'cà mau':               'ca-mau',
};

const getProvinceAvatar = (location) => {
  if (!location) return null;
  const slug = PROVINCE_SLUG[location.toLowerCase().trim()];
  if (!slug) return null;
  return `/images_provinces/${slug}.jpg`;
};

const standardizeLocation = (locName) => {
  if (!locName) return 'Không xác định';
  const name = locName.trim();
  const lowerName = name.toLowerCase();
  
  // Gộp Huế và Thừa Thiên Huế
  if (lowerName === 'huế' || lowerName === 'thừa thiên huế' || lowerName === 'thừa thiên - huế') {
    return 'Thừa Thiên Huế';
  }
  // Gộp Sài Gòn và Hồ Chí Minh (phòng hờ)
  if (lowerName === 'sài gòn' || lowerName === 'hồ chí minh' || lowerName === 'tp. hồ chí minh') {
    return 'TP. Hồ Chí Minh';
  }
  // Gộp Đà Lạt và Lâm Đồng (phòng hờ)
  if (lowerName === 'đà lạt' || lowerName === 'lâm đồng') {
    return 'Lâm Đồng (Đà Lạt)';
  }
  
  // Trả về tên gốc nếu không thuộc các trường hợp trên
  return name;
};

export default function ProfilePage({ onBack, isDark = true, user: userProp = null, onUserChange, onLoadSchedule, onSearch }) {
  // Dùng user từ App.js nếu có, fallback tự fetch nếu dùng standalone
  const [user,       setUser]       = useState(userProp);
  const [tab,        setTab]        = useState('saved');
  const [loading,    setLoading]    = useState(!userProp);
  // Mỗi lần click tab đang active → tăng signal để child reset filter
  const [resetSignal, setResetSignal] = useState({ savedplaces: 0, favorites: 0 });
  // Stats dùng chung — StatsBar fetch ban đầu, các tab báo lên khi thay đổi
  const [stats, setStats] = useState({ schedules: 0, savedPlaces: 0, favorites: 0, searches: 0 });

  const handleStatsChange = (key, delta) => {
    setStats(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  };

  const handleTabClick = (id) => {
    if (id === tab) {
      // Click lần 2 → reset filter của tab đó
      setResetSignal(prev => ({ ...prev, [id]: prev[id] + 1 }));
    } else {
      setTab(id);
    }
  };

  useEffect(() => {
    if (userProp) { setUser(userProp); setLoading(false); return; }
    api.get('/api/auth/me').then(d => {
      if (d.success) setUser(d.user);
      setLoading(false);
    });
  }, [userProp]);

  // Cập nhật cả local state lẫn App.js
  const handleUserUpdate = (updated) => {
    setUser(updated);
    onUserChange?.(updated);
  };

  if (loading) return <LoadingScreen />;
  if (!user)   return <NotLoggedIn onBack={onBack} />;

  const tabs = [
    { id: 'saved',       label: 'Lịch trình đã lưu',  icon: Icon.calendar  },
    { id: 'savedplaces', label: 'Lưu trữ',             icon: Icon.bookmark  },
    { id: 'favorites',   label: 'Yêu thích',           icon: Icon.heart     },
    { id: 'history',     label: 'Lịch sử tìm kiếm',   icon: Icon.search    },
    { id: 'settings',    label: 'Cài đặt',             icon: Icon.settings  },
  ];

  const T = isDark ? THEME.dark : THEME.light;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Segoe UI', sans-serif", color: T.text, transition: 'background 0.3s ease, color 0.3s ease' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .sp-tab:hover  { background: rgba(16,185,129,0.10) !important; color: #10b981 !important; }
        .sp-tab-active { background: rgba(16,185,129,0.15) !important; color: #10b981 !important; box-shadow: 0 4px 16px rgba(16,185,129,0.12); }
        .sp-tab-active .sp-tab-icon { transform: scale(1.1); }
        .sp-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.2) !important; }
        .sp-card       { transition: all 0.25s ease; }
        .sp-btn:hover  { opacity: 0.85; transform: translateY(-1px); }
        .sp-btn        { transition: all 0.2s ease; }
        .sp-del:hover  { background: rgba(248,113,113,0.12) !important; color: #f87171 !important; }
        .sp-input:focus{ outline:none; border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.scrollbar}; border-radius: 10px; }
        /* ═══════════════════════════════════════
           🖥️ Desktop layout — sidebar 2 cột
        ═══════════════════════════════════════ */
        .sp-desktop { display: block; }
        .sp-mobile  { display: none; }
        .sp-main-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 40px;
          max-width: 1300px;
          margin: 0 auto;
          padding: 32px 24px;
          align-items: start;
        }
        .sp-sidebar {
          position: sticky;
          top: 92px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        /* ═══════════════════════════════════════
           📱 Mobile — Banner + Tabs ngang
        ═══════════════════════════════════════ */
        @media (max-width: 900px) {
          .sp-desktop { display: none !important; }
          .sp-mobile  { display: block !important; }
        }
        /* Mobile banner layout */
        .sp-mobile-container {
          max-width: 100%;
          padding-bottom: 60px;
        }
        .sp-banner {
          height: 200px;
          border-radius: 0 0 24px 24px;
        }
        .sp-mob-header-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 20px;
          margin-top: 32px;
          position: relative;
          z-index: 10;
        }
        .sp-horizontal-tabs {
          display: flex;
          gap: 10px;
          padding: 0 16px;
          margin-bottom: 24px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .sp-horizontal-tabs::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.headerBorder}`, backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 68, gap: 16 }}>
          <button onClick={onBack} className="sp-btn" style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid ${T.btnBorder}`, background: T.btnBg, color: T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.back}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: T.text }}>Tài khoản</span>
            <span style={{ fontSize: 13, color: C.primary, fontWeight: 700, background: 'rgba(16,185,129,0.15)', padding: '3px 10px', borderRadius: 20 }}>✈️ S-Trip</span>
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP: Sidebar layout ═══ */}
      <div className="sp-desktop">
        <div className="sp-main-grid">
          {/* Sidebar */}
          <div className="sp-sidebar">
            <AvatarCardDesktop user={user} onUpdate={handleUserUpdate} isDark={isDark} T={T} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`sp-tab ${tab === t.id ? 'sp-tab-active' : ''}`}
                  onClick={() => handleTabClick(t.id)}
                  style={{
                    width: '100%', padding: '13px 18px',
                    border: `1px solid ${tab === t.id ? 'rgba(16,185,129,0.25)' : T.cardBorder}`,
                    borderRadius: 14,
                    background: tab === t.id ? 'rgba(16,185,129,0.15)' : T.btnBg,
                    color: tab === t.id ? C.primary : T.muted,
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer',
                    fontWeight: tab === t.id ? 800 : 600,
                    fontSize: 14, textAlign: 'left',
                    transition: 'all 0.22s ease',
                  }}
                >
                  <span className="sp-tab-icon" style={{ transition: 'transform 0.22s ease', opacity: tab === t.id ? 1 : 0.55, display: 'flex' }}>{t.icon}</span>
                  <span>{t.label}</span>
                  {tab === t.id && <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: C.primary, boxShadow: '0 0 6px rgba(16,185,129,0.35)' }} />}
                </button>
              ))}
            </div>
            <StatsBarDesktop stats={stats} setStats={setStats} T={T} />
          </div>
          {/* Content */}
          <div style={{ minWidth: 0 }}>
            {tab === 'saved'       && <SavedSchedules T={T} onLoadSchedule={onLoadSchedule} />}
            {tab === 'savedplaces' && <SavedPlaces T={T} resetSignal={resetSignal.savedplaces} onCountChange={(delta) => handleStatsChange('savedPlaces', delta)} />}
            {tab === 'favorites'   && <Favorites T={T} resetSignal={resetSignal.favorites} onCountChange={(delta) => handleStatsChange('favorites', delta)} />}
            {tab === 'history'     && <SearchHistory T={T} onSearch={onSearch} onBack={onBack} />}
            {tab === 'settings'    && <Settings user={user} onUpdate={handleUserUpdate} T={T} onLogout={onBack} />}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE: Banner + Tabs ngang ═══ */}
      <div className="sp-mobile">
        <div className="sp-mobile-container">
          {/* Avatar + Info nổi lên */}
          <div className="sp-mob-header-info">
            <AvatarCard user={user} onUpdate={handleUserUpdate} isDark={isDark} T={T} />
            <div style={{ marginTop: 20, width: '100%' }}>
              <StatsBar stats={stats} setStats={setStats} T={T} />
            </div>
          </div>

          {/* Horizontal Tabs */}
          <div className="sp-horizontal-tabs" style={{ marginTop: 24 }}>
            {tabs.map((t) => (
              <button key={t.id} className="sp-btn" onClick={() => handleTabClick(t.id)} style={{ flexShrink: 0, padding: '12px 20px', borderRadius: 99, border: tab === t.id ? `1px solid ${C.primary}` : `1px solid ${T.btnBorder}`, background: tab === t.id ? 'rgba(16,185,129,0.15)' : T.card, color: tab === t.id ? C.primary : T.muted, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: tab === t.id ? 800 : 700, fontSize: 14, transition: 'all 0.25s', boxShadow: tab === t.id ? '0 6px 18px rgba(16,185,129,0.15)' : 'none' }}>
                <span style={{ opacity: tab === t.id ? 1 : 0.7 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '0 16px' }}>
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              {tab === 'saved'       && <SavedSchedules T={T} onLoadSchedule={onLoadSchedule} />}
              {tab === 'savedplaces' && <SavedPlaces T={T} resetSignal={resetSignal.savedplaces} onCountChange={(delta) => handleStatsChange('savedPlaces', delta)} />}
              {tab === 'favorites'   && <Favorites T={T} resetSignal={resetSignal.favorites} onCountChange={(delta) => handleStatsChange('favorites', delta)} />}
              {tab === 'history'     && <SearchHistory T={T} onSearch={onSearch} onBack={onBack} />}
              {tab === 'settings'    && <Settings user={user} onUpdate={handleUserUpdate} T={T} onLogout={onBack} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, count, filteredCount, filterLabel, action, children }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.10))', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>{title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              {count !== undefined && (
                <div style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>
                  {filteredCount !== undefined ? `${filteredCount} / ${count} mục` : `${count} mục`}
                </div>
              )}
              {filterLabel && (
                <div style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.20)', color: C.primary, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {filterLabel.emoji} {filterLabel.label}
                </div>
              )}
            </div>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Empty({ icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{text}</div>
      <div style={{ fontSize: 13, color: '#94a3b8' }}>{sub}</div>
    </div>
  );
}


// 🗑️ CONFIRM MODAL — thay thế window.confirm
function ConfirmModal({ open, title, message, icon = '🗑️', confirmLabel = 'Xoá', confirmColor = '#f87171', onConfirm, onCancel, T }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;
  return createPortal(
    <>
      <style>{`
        @keyframes confirmIn { from{opacity:0;transform:scale(0.88) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes confirmBg { from{opacity:0} to{opacity:1} }
      `}</style>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: T?.bg ? (T?.bg === '#f1f5f9' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)') : 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'confirmBg 0.18s ease' }}>
        <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: T?.card || 'linear-gradient(145deg, #0f1e35, #0d1a2e)', border: `1px solid ${T?.cardBorder || 'rgba(255,255,255,0.1)'}`, borderRadius: 24, padding: '32px 28px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'confirmIn 0.22s cubic-bezier(0.34,1.4,0.64,1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>{icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T?.text || '#f1f5f9', marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 14, color: T?.muted || '#94a3b8', lineHeight: 1.5 }}>{message}</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: 14, border: `1px solid ${T?.btnBorder || 'rgba(255,255,255,0.1)'}`, background: T?.btnBg || 'rgba(255,255,255,0.06)', color: T?.muted || '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background=T?.cardBorder || 'rgba(255,255,255,0.1)'; e.currentTarget.style.color=T?.text || '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background=T?.btnBg || 'rgba(255,255,255,0.06)'; e.currentTarget.style.color=T?.muted || '#94a3b8'; }}>
              Huỷ
            </button>
            <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${confirmColor}, ${confirmColor}cc)`, color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 16px ${confirmColor}44` }}
              onMouseEnter={e => { e.currentTarget.style.opacity='0.85'; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>, document.body
  );
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 80, borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
      ))}
    </div>
  );
}

function LoadingScreen() {
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: '#10b981', fontSize: 18, fontWeight: 700 }}>⏳ Đang tải...</div>;
}

function NotLoggedIn({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: 'white', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>Bạn chưa đăng nhập</div>
      <button onClick={onBack} style={{ padding: '10px 24px', borderRadius: 99, border: 'none', background: C.primary, color: 'white', fontWeight: 800, cursor: 'pointer' }}>Quay lại Trang chủ</button>
    </div>
  );
}

// 🖼️ AVATAR CARD
function AvatarCard({ user, onUpdate, isDark, T }) {
  const fileRef  = useRef();
  const [uploading,    setUploading]    = useState(false);
  const [preview,      setPreview]      = useState(user.avatar || '');
  const [uploadMsg,    setUploadMsg]    = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => { if (user.avatar) setPreview(user.avatar); }, [user.avatar]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setUploadMsg('err:Ảnh tối đa 10MB'); return; }
    if (!file.type.startsWith('image/')) { setUploadMsg('err:Chỉ chấp nhận file ảnh'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';

    setUploading(true); setUploadMsg('');
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/update-avatar`, { method: 'POST', credentials: 'include', body: form });
      const data = await res.json();
      if (data.success) {
        onUpdate(data.user);
        if (data.user?.avatar) setPreview(data.user.avatar);
        setUploadMsg('ok'); setTimeout(() => setUploadMsg(''), 3000);
      } else {
        setUploadMsg('err:' + (data.error || 'Upload thất bại'));
        setPreview(user.avatar || '');
      }
    } catch (err) {
      setUploadMsg('err:Lỗi kết nối server');
      setPreview(user.avatar || '');
    } finally { setUploading(false); }
  };

  const initials = (user.name || user.email || '?')[0].toUpperCase();

  // Mobile avatar: hiển thị trong banner layout
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {/* Lightbox */}
      {lightboxOpen && preview && createPortal(
        <>
          <style>{`@keyframes lb-in { from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)} } @keyframes lb-bg { from{opacity:0} to{opacity:1} } .lb-close:hover { background:rgba(255,255,255,0.25) !important; transform:scale(1.1); }`}</style>
          <div onClick={() => setLightboxOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, animation: 'lb-bg 0.2s ease', cursor: 'zoom-out' }}>
            <img src={preview} alt={user.name} onClick={e => e.stopPropagation()} style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 20, objectFit: 'contain', boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 2px rgba(16,185,129,0.25)', animation: 'lb-in 0.28s cubic-bezier(0.34,1.4,0.64,1)', cursor: 'default', userSelect: 'none' }} />
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{user.name}</div>
            <button className="lb-close" onClick={() => setLightboxOpen(false)} style={{ position: 'fixed', top: 24, right: 28, width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}>✕</button>
          </div>
        </>, document.body
      )}

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div onClick={() => preview && setLightboxOpen(true)} style={{ width: 110, height: 110, borderRadius: '50%', border: `5px solid ${isDark ? '#0b1120' : '#f1f5f9'}`, overflow: 'hidden', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', cursor: preview ? 'zoom-in' : 'default', transition: 'box-shadow 0.2s, transform 0.2s' }}
          onMouseEnter={e => { if (preview) { e.currentTarget.style.boxShadow='0 8px 30px rgba(16,185,129,0.40)'; e.currentTarget.style.transform='scale(1.04)'; }}}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.35)'; e.currentTarget.style.transform='scale(1)'; }}
        >
          {preview ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="sp-btn" style={{ position: 'absolute', bottom: 4, right: 4, width: 26, height: 26, borderRadius: '50%', border: `2px solid ${isDark ? '#0b1120' : '#f1f5f9'}`, background: C.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>
          {uploading ? '⏳' : Icon.camera}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, color: T.text }}>{user.name}</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>{user.email}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: 'linear-gradient(135deg, #10b981, #059669)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 800, color: 'white', boxShadow: '0 3px 10px rgba(16,185,129,0.20)' }}>✈️ Traveler</div>
        {uploadMsg && <div style={{ marginTop: 10, padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: uploadMsg === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.10)', border: `1px solid ${uploadMsg === 'ok' ? 'rgba(16,185,129,0.20)' : 'rgba(248,113,113,0.20)'}`, color: uploadMsg === 'ok' ? C.primary : C.danger }}>{uploadMsg === 'ok' ? '✅ Cập nhật ảnh thành công!' : uploadMsg.replace(/^err:/, '❌ ')}</div>}
      </div>
    </div>
  );
}

// AvatarCard cho Desktop (layout cũ — card căn giữa)
function AvatarCardDesktop({ user, onUpdate, isDark, T }) {
  const fileRef  = useRef();
  const [uploading,    setUploading]    = useState(false);
  const [preview,      setPreview]      = useState(user.avatar || '');
  const [uploadMsg,    setUploadMsg]    = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => { if (user.avatar) setPreview(user.avatar); }, [user.avatar]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setUploadMsg('err:Ảnh tối đa 10MB'); return; }
    if (!file.type.startsWith('image/')) { setUploadMsg('err:Chỉ chấp nhận file ảnh'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
    setUploading(true); setUploadMsg('');
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/update-avatar`, { method: 'POST', credentials: 'include', body: form });
      const data = await res.json();
      if (data.success) {
        onUpdate(data.user);
        if (data.user?.avatar) setPreview(data.user.avatar);
        setUploadMsg('ok'); setTimeout(() => setUploadMsg(''), 3000);
      } else {
        setUploadMsg('err:' + (data.error || 'Upload thất bại'));
        setPreview(user.avatar || '');
      }
    } catch (err) {
      setUploadMsg('err:Lỗi kết nối server');
      setPreview(user.avatar || '');
    } finally { setUploading(false); }
  };

  const initials = (user.name || user.email || '?')[0].toUpperCase();

  return (
    <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 24, overflow: 'hidden', textAlign: 'center' }}>
      {lightboxOpen && preview && createPortal(
        <>
          <style>{`@keyframes lb-in { from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)} } @keyframes lb-bg { from{opacity:0} to{opacity:1} } .lb-close:hover { background:rgba(255,255,255,0.25) !important; transform:scale(1.1); }`}</style>
          <div onClick={() => setLightboxOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, animation: 'lb-bg 0.2s ease', cursor: 'zoom-out' }}>
            <img src={preview} alt={user.name} onClick={e => e.stopPropagation()} style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 20, objectFit: 'contain', boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 2px rgba(16,185,129,0.25)', animation: 'lb-in 0.28s cubic-bezier(0.34,1.4,0.64,1)', cursor: 'default', userSelect: 'none' }} />
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{user.name}</div>
            <button className="lb-close" onClick={() => setLightboxOpen(false)} style={{ position: 'fixed', top: 24, right: 28, width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}>✕</button>
          </div>
        </>, document.body
      )}

      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 24px' }}>
        <div style={{ position: 'relative', marginBottom: 4 }}>
          <div
            onClick={() => preview && setLightboxOpen(true)}
            style={{ width: 90, height: 90, borderRadius: '50%', border: `4px solid ${isDark ? '#1e293b' : '#ffffff'}`, overflow: 'hidden', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: 'white', boxShadow: `0 6px 24px rgba(0,0,0,0.35), 0 0 0 3px ${isDark ? '#1e293b' : '#ffffff'}`, cursor: preview ? 'zoom-in' : 'default', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={e => { if (preview) { e.currentTarget.style.boxShadow=`0 8px 30px rgba(16,185,129,0.40), 0 0 0 3px ${isDark ? '#1e293b' : '#ffffff'}`; e.currentTarget.style.transform='scale(1.05)'; }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow=`0 6px 24px rgba(0,0,0,0.35), 0 0 0 3px ${isDark ? '#1e293b' : '#ffffff'}`; e.currentTarget.style.transform='scale(1)'; }}
          >
            {preview ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="sp-btn" style={{ position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: '50%', border: `2px solid ${isDark ? '#1e293b' : '#ffffff'}`, background: C.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>
            {uploading ? '⏳' : Icon.camera}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ fontSize: 18, fontWeight: 900, marginTop: 14, marginBottom: 4, color: T.text, textAlign: 'center' }}>{user.name}</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 14, textAlign: 'center' }}>{user.email}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 16px', borderRadius: 99, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.12))', border: '1px solid rgba(16,185,129,0.25)', fontSize: 12, fontWeight: 800, color: C.primary, textAlign: 'center' }}>✈️ Thành viên</div>
        {uploadMsg && <div style={{ marginTop: 10, padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: uploadMsg === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.10)', border: `1px solid ${uploadMsg === 'ok' ? 'rgba(16,185,129,0.20)' : 'rgba(248,113,113,0.20)'}`, color: uploadMsg === 'ok' ? C.primary : C.danger, textAlign: 'center' }}>{uploadMsg === 'ok' ? '✅ Cập nhật ảnh thành công!' : uploadMsg.replace(/^err:/, '❌ ')}</div>}
      </div>
    </div>
  );
}

function StatsBar({ stats, setStats, T }) {
  useEffect(() => {
    Promise.all([ api.get('/api/schedules'), api.get('/api/favorites'), api.get('/api/saved-places'), api.get('/api/search-history') ])
      .then(([s, f, sp, h]) => setStats({ schedules: Array.isArray(s.schedules) ? s.schedules.length : 0, favorites: f.favorites?.length || 0, savedPlaces: sp.savedPlaces?.length || 0, searches: h.history?.length || 0 }))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const items = [ { label: 'Lịch trình', value: stats.schedules }, { label: 'Đã lưu', value: stats.savedPlaces }, { label: 'Yêu thích', value: stats.favorites }, { label: 'Tìm kiếm', value: stats.searches } ];
  // Mobile stats — hiển thị dạng flex
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
      {items.map(item => (
        <div key={item.label} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: '14px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.primary }}>{item.value}</div>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// StatsBar cho Desktop (layout sidebar cũ)
function StatsBarDesktop({ stats, setStats, T }) {
  useEffect(() => {
    Promise.all([ api.get('/api/schedules'), api.get('/api/favorites'), api.get('/api/saved-places'), api.get('/api/search-history') ])
      .then(([s, f, sp, h]) => setStats({ schedules: Array.isArray(s.schedules) ? s.schedules.length : 0, favorites: f.favorites?.length || 0, savedPlaces: sp.savedPlaces?.length || 0, searches: h.history?.length || 0 }))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const items = [
    { label: 'Lịch trình', value: stats.schedules,  icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Đã lưu',     value: stats.savedPlaces, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>,                  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Yêu thích',  value: stats.favorites,   icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>, color: '#f87171', bg: 'rgba(248,113,113,0.10)'  },
    { label: 'Tìm kiếm',   value: stats.searches,    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>, color: '#fbbf24', bg: 'rgba(251,191,36,0.10)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {items.map(item => (
        <div key={item.label} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 20, padding: '16px 14px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.14)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'; }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 12, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: `1px solid ${item.color}26` }}>
            {item.icon}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.value}</div>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── MOCK DATA (xóa khi dùng API thật) ──────────────────────
// eslint-disable-next-line no-unused-vars
const MOCK_SCHEDULES = [
  {
    id: 1, title: 'Khám phá Huế', location: 'Huế', days: 2,
    updated_at: '2026-05-18T11:36:00Z',
    schedule: {
      summary: 'Hành trình 2 ngày khám phá kinh thành Huế, di sản văn hóa thế giới với những cung điện cổ kính, ẩm thực đặc sắc và sông Hương thơ mộng.',
      days: [
        {
          day: 1, title: 'Kinh thành & Lăng tẩm',
          activities: [
            { time: '07:30', type: 'food',    name: 'Bún bò Huế Mụ Rớt',           note: 'Quán nổi tiếng nhất Huế, ăn sáng đặc trưng' },
            { time: '09:00', type: 'explore', name: 'Đại Nội - Hoàng Thành Huế',    note: 'Kinh thành triều Nguyễn, di sản UNESCO' },
            { time: '12:00', type: 'food',    name: 'Cơm Hến bờ sông',              note: 'Đặc sản Huế, ăn trưa nhẹ' },
            { time: '14:00', type: 'explore', name: 'Lăng Khải Định',               note: 'Kiến trúc kết hợp Á - Âu độc đáo' },
            { time: '16:30', type: 'explore', name: 'Lăng Tự Đức',                  note: 'Lăng mộ đẹp nhất triều Nguyễn' },
            { time: '19:00', type: 'food',    name: 'Phố đi bộ Nguyễn Đình Chiểu', note: 'Ẩm thực đường phố buổi tối' },
          ]
        },
        {
          day: 2, title: 'Sông Hương & Chùa chiền',
          activities: [
            { time: '06:30', type: 'explore', name: 'Chùa Thiên Mụ',             note: 'Ngắm bình minh, biểu tượng của Huế' },
            { time: '09:00', type: 'explore', name: 'Làng hương Thủy Xuân',      note: 'Làm hương truyền thống, check-in đẹp' },
            { time: '11:30', type: 'food',    name: 'Bánh mì Phượng Huế',        note: 'Bánh mì đặc trưng miền Trung' },
            { time: '13:30', type: 'hotel',   name: 'Khách sạn Silk Path Grand', note: 'Nghỉ ngơi, tắm hồ bơi, thư giãn' },
            { time: '16:00', type: 'explore', name: 'Thuyền rồng sông Hương',    note: 'Nghe nhã nhạc Cung Đình trên thuyền' },
            { time: '19:30', type: 'food',    name: 'Nhà hàng Lạc Thành',        note: 'Tiệc tất niên hành trình' },
          ]
        }
      ],
      budget: '3200000', passengers: 2,
      tags: ['di sản', 'văn hóa', 'ẩm thực', 'lịch sử']
    }
  },
  {
    id: 2, title: 'Đà Nẵng - Hội An 3N2Đ', location: 'Đà Nẵng', days: 3,
    updated_at: '2026-05-10T08:45:00Z',
    schedule: {
      summary: '3 ngày 2 đêm khám phá thành phố biển Đà Nẵng và phố cổ Hội An — nơi giao thoa văn hóa độc đáo nhất miền Trung.',
      days: [
        {
          day: 1, title: 'Ngày biển & Bà Nà',
          activities: [
            { time: '08:00', type: 'explore', name: 'Cầu Vàng - Bà Nà Hills', note: 'Cáp treo lên núi, Cầu Vàng check-in' },
            { time: '13:00', type: 'food',    name: 'Bữa trưa Bà Nà Hills',   note: 'Buffet hải sản, view núi' },
            { time: '16:00', type: 'explore', name: 'Bãi biển Mỹ Khê',        note: 'Tắm biển buổi chiều mát' },
            { time: '19:00', type: 'food',    name: 'Mỳ Quảng Bà Vị',        note: 'Đặc sản nổi tiếng Đà Nẵng' },
          ]
        },
        {
          day: 2, title: 'Hội An phố cổ',
          activities: [
            { time: '09:00', type: 'explore', name: 'Phố cổ Hội An',              note: 'Đi bộ, chụp ảnh, mua sắm' },
            { time: '12:00', type: 'food',    name: 'Cao lầu Hội An Bà Bé',      note: 'Món ngon đặc trưng nhất Hội An' },
            { time: '19:30', type: 'explore', name: 'Thả đèn hoa đăng sông Hoài', note: 'Trải nghiệm văn hóa tâm linh' },
          ]
        },
        {
          day: 3, title: 'Ngũ Hành Sơn & Về nhà',
          activities: [
            { time: '08:00', type: 'explore', name: 'Ngũ Hành Sơn',           note: '5 ngọn núi đá vôi huyền bí' },
            { time: '11:00', type: 'explore', name: 'Làng nghề đá Non Nước',  note: 'Mua quà lưu niệm' },
            { time: '13:00', type: 'food',    name: 'Bánh xèo Đà Nẵng',      note: 'Bữa trưa trước khi về' },
          ]
        }
      ],
      budget: '5800000', passengers: 2,
      tags: ['biển', 'phố cổ', 'cầu vàng', 'văn hóa']
    }
  }
];

const TYPE_ICON = {
  food:    { emoji: '🍜', color: '#fbbf24', bg: 'rgba(251,191,36,0.10)' },
  hotel:   { emoji: '🏨', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  explore: { emoji: '🗺️', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  camera:  { emoji: '📸', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  default: { emoji: '📍', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)'  },
};

// ════════════════════════════════════════════════════════════
// 🗓️ MODAL XEM CHI TIẾT LỊCH TRÌNH
// ════════════════════════════════════════════════════════════
function ScheduleModal({ schedule, onClose, onLoadToMain, T }) {
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!schedule) return null;

  // Parse editedPlans từ data_json (cấu trúc thật từ DB)
  const dataJson = schedule.data_json || {};
  const editedPlans = dataJson.editedPlans || [];
  const searchData = dataJson.searchData || {};

  // Chuyển editedPlans[{ day, morning, afternoon, evening }]
  // thành days[{ day, activities[] }] để modal hiển thị
  // eslint-disable-next-line no-unused-vars
  const SLOT_TIME = { morning: '🌅 Sáng', afternoon: '☀️ Chiều', evening: '🌙 Tối' };
  const days = editedPlans.map((plan) => {
    const activities = [];
    // Hỗ trợ cả key tiếng Anh (morning) lẫn tiếng Việt (sáng)
    const slots = [
      { key: 'morning', alt: 'sáng' },
      { key: 'afternoon', alt: 'chiều' },
      { key: 'evening', alt: 'tối' }
    ];
    slots.forEach(slotInfo => {
      const slotData = plan[slotInfo.key] || plan[slotInfo.alt] || {};
      if (slotData.tour) activities.push({
        slot: slotInfo.key,
        type: 'explore',
        name: slotData.tour.name,
        note: slotData.tour.desc?.replace(/^"|"$/g, '') || '',
        thumbnail: slotData.tour.thumbnail,
        rating: slotData.tour.rating,
      });
      if (slotData.food) activities.push({
        slot: slotInfo.key,
        type: 'food',
        name: slotData.food.name,
        note: slotData.food.desc?.replace(/^"|"$/g, '') || '',
        thumbnail: slotData.food.thumbnail,
        rating: slotData.food.rating,
      });
    });
    return { day: plan.day, title: `Ngày ${plan.day}`, activities };
  });

  const currentDay = days[activeDay] || {};
  const activities = currentDay.activities || [];

  return (
    <>
      <style>{`
        @keyframes modalIn    { from{opacity:0;transform:scale(0.95) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes overlayIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        .day-tab:hover { background: rgba(16,185,129,0.10) !important; color: #10b981 !important; }
        .act-row:hover { background: ${T?.rowBorder || 'rgba(255,255,255,0.05)'} !important; }
        .sm-btn:hover  { opacity: 0.8; transform: translateY(-1px); }
        .sm-btn        { transition: all 0.2s; }
      `}</style>

      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: T?.bg === '#f1f5f9' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, animation: 'overlayIn 0.2s ease' }} />

      {/* Modal container */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', pointerEvents: 'none' }}>
        <div onClick={e => e.stopPropagation()} style={{ pointerEvents: 'auto', width: '100%', maxWidth: 760, maxHeight: '90vh', background: T?.card || 'linear-gradient(145deg, #0f1e35 0%, #0d1a2e 100%)', border: `1px solid ${T?.cardBorder || 'rgba(16,185,129,0.15)'}`, borderRadius: 28, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

          {/* Header */}
          <div style={{ background: T?.headerBg || 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)', borderBottom: `1px solid ${T?.cardBorder || 'rgba(16,185,129,0.15)'}`, padding: '24px 28px 20px', position: 'relative', flexShrink: 0 }}>
            <button onClick={onClose} className="sm-btn" style={{ position: 'absolute', top: 20, right: 20, width: 38, height: 38, borderRadius: 12, border: `1px solid ${T?.btnBorder || 'rgba(255,255,255,0.1)'}`, background: T?.btnBg || 'rgba(255,255,255,0.06)', color: T?.muted || '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(16,185,129,0.25)', background: 'linear-gradient(135deg, rgba(16,185,129,0.20), rgba(5,150,105,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                {getProvinceAvatar(schedule.location)
                  ? <img src={getProvinceAvatar(schedule.location)} alt={schedule.location} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML = '🗺️'; }} />
                  : '🗺️'
                }
              </div>
              <div style={{ flex: 1, paddingRight: 40 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: T?.text || '#f1f5f9', marginBottom: 6, lineHeight: 1.2 }}>{schedule.title}</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: C.primary, display: 'flex', alignItems: 'center', gap: 5 }}>{Icon.map} {schedule.location}</span>
                  <span style={{ fontSize: 13, color: T?.muted || '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>{Icon.plane} {schedule.days} ngày</span>
                  <span style={{ fontSize: 13, color: T?.muted || '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>{Icon.clock} {formatDate(schedule.updated_at)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {searchData.budget && <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.15)', fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>💰 ~{Number(String(searchData.budget).replace(/\D/g,'')).toLocaleString('vi-VN')}đ</div>}
              {searchData.passengers && <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 12, fontWeight: 700, color: '#a5b4fc' }}>👥 {searchData.passengers} người</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.15)', fontSize: 12, fontWeight: 700, color: C.primary }}>📅 {schedule.days} ngày · {days.reduce((acc, d) => acc + (d.activities?.length || 0), 0)} hoạt động</div>
            </div>
          </div>

          {/* Day Tabs */}
          {days.length > 1 && (
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto', flexShrink: 0, borderBottom: `1px solid ${T?.rowBorder || 'rgba(255,255,255,0.06)'}`, background: T?.inputBg || 'rgba(0,0,0,0.2)' }}>
              {days.map((d, i) => (
                <button key={i} className="day-tab" onClick={() => setActiveDay(i)} style={{ flexShrink: 0, padding: '14px 20px', border: 'none', borderBottom: `3px solid ${i === activeDay ? C.primary : 'transparent'}`, background: i === activeDay ? 'rgba(16,185,129,0.08)' : 'transparent', color: i === activeDay ? C.primary : (T?.muted || '#94a3b8'), cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  ☀️&nbsp;&nbsp;Ngày {d.day}{d.title ? ` — ${d.title}` : ''}
                </button>
              ))}
            </div>
          )}

          {/* Activities */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {days.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: T?.muted || '#94a3b8' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Lịch trình chưa có chi tiết</div>
              </div>
            )}
            {days.length > 0 && (
              <div key={activeDay} style={{ animation: 'slideRight 0.25s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: C.primary, fontSize: 14 }}>{currentDay.day}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: T?.text || '#f1f5f9' }}>{currentDay.title || `Ngày ${currentDay.day}`}</div>
                    <div style={{ fontSize: 12, color: T?.muted || '#94a3b8' }}>{activities.length} hoạt động</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { slot: 'morning',   label: '🌅 Buổi sáng',  color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.15)'  },
                    { slot: 'afternoon', label: '☀️ Buổi chiều', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
                    { slot: 'evening',   label: '🌙 Buổi tối',   color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)' },
                  ].map(({ slot, label, color, bg, border }) => {
                    const slotActs = activities.filter(a => a.slot === slot);
                    if (!slotActs.length) return null;
                    return (
                      <div key={slot}>
                        {/* Buổi header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <div style={{ height: 1, width: 16, background: color, opacity: 0.4 }} />
                          <span style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</span>
                          <div style={{ flex: 1, height: 1, background: color, opacity: 0.15 }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {slotActs.map((act, ai) => {
                            const cfg = TYPE_ICON[act.type] || TYPE_ICON.default;
                            return (
                              <div key={ai} className="act-row" style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 14, transition: '0.2s', border: `1px solid ${border}`, background: bg, alignItems: 'center' }}>
                                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 10, overflow: 'hidden', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {act.thumbnail
                                    ? <img src={proxyImage(act.thumbnail)} alt={act.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML = `<span style='font-size:22px'>${cfg.emoji}</span>`; }} />
                                    : <span style={{ fontSize: 22 }}>{cfg.emoji}</span>
                                  }
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 5, background: T?.btnBg || 'rgba(255,255,255,0.06)', color: T?.muted || '#94a3b8', flexShrink: 0 }}>{cfg.emoji} {act.type === 'food' ? 'Ăn uống' : 'Tham quan'}</span>
                                    {act.rating && <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, flexShrink: 0 }}>⭐ {act.rating}</span>}
                                  </div>
                                  <div style={{ fontSize: 14, fontWeight: 800, color: T?.text || '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{act.name}</div>
                                  {act.note && <div style={{ fontSize: 12, color: T?.muted || '#94a3b8', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{act.note}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${T?.rowBorder || 'rgba(255,255,255,0.07)'}`, padding: '14px 24px', background: T?.inputBg || 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            <button className="sm-btn" onClick={(e) => onLoadToMain(schedule, e)} style={{ padding: '12px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(16,185,129,0.20)' }}>
              Xem lịch trình đầy đủ {Icon.arrow}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// 📅 SAVED SCHEDULES
function SavedSchedules({ T, onLoadSchedule }) {
  const [schedules,        setSchedules]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    api.get('/api/schedules')
      .then(d => setSchedules(Array.isArray(d.schedules) ? d.schedules : []))
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, []);

  const [confirmDel, setConfirmDel] = useState(null); // { id, e }

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setConfirmDel({ id });
  };
  const doDelete = async () => {
    const { id } = confirmDel;
    setConfirmDel(null);
    const res = await api.del(`/api/schedules/${id}`);
    if (res.success) setSchedules(s => s.filter(x => x.id !== id));
  };

  const handleOpen  = useCallback((s) => { setSelectedSchedule(s); }, []);
  const handleClose = useCallback(() => { setSelectedSchedule(null); }, []);

  const handleLoadToMainDashboard = useCallback((scheduleItem, e) => {
    e.stopPropagation();
    if (scheduleItem.data_json && onLoadSchedule) {
      onLoadSchedule(scheduleItem.data_json);
    } else if (onLoadSchedule) {
      onLoadSchedule(null);
    } else {
      alert('Lịch trình chưa có data_json để tái hiện trên trang chủ!');
    }
  }, [onLoadSchedule]);

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>{Icon.calendar}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: (T||{}).text || '#f1f5f9' }}>Lịch trình đã lưu</div>
            {schedules.length > 0 && <div style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>{schedules.length} mục</div>}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && [1, 2].map(i => (
        <div key={i} style={{ height: 100, borderRadius: 24, marginBottom: 16, background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      ))}

      {/* Empty state */}
      {!loading && schedules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🗓️</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: (T||{}).text || '#f1f5f9' }}>Chưa có lịch trình nào được lưu</div>
          <div style={{ fontSize: 13 }}>Tạo lịch trình và bấm "Lưu lịch trình" để thấy ở đây</div>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {schedules.map((s, i) => (
          <div key={s.id} className="sp-card" onClick={() => handleOpen(s)} style={{ background: (T||{}).card || 'rgba(255,255,255,0.04)', border: `1px solid ${(T||{}).cardBorder || 'rgba(255,255,255,0.08)'}`, borderRadius: 24, padding: '22px 28px', display: 'flex', gap: 20, alignItems: 'center', cursor: 'pointer', animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
            <div style={{ width: 80, height: 80, borderRadius: 18, flexShrink: 0, overflow: 'hidden', border: `2px solid ${T?.primary || '#10b981'}`, background: T?.inputBg || 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              {getProvinceAvatar(s.location)
                ? <img src={getProvinceAvatar(s.location)} alt={s.location} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML = '🗺️'; }} />
                : '🗺️'
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: (T||{}).text || '#f1f5f9' }}>{s.title}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: C.primary, display: 'flex', alignItems: 'center', gap: 5 }}>{Icon.map} {s.location}</span>
                <span style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>{Icon.plane} {s.days} ngày</span>
                <span style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>{Icon.clock} {formatDate(s.updated_at)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <button className="sp-del" onClick={(e) => handleDelete(s.id, e)} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'rgba(248,113,113,0.08)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {Icon.trash}
              </button>
              <div style={{ color: C.primary }}>{Icon.arrow}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal xem chi tiết */}
      {selectedSchedule && (
        <ScheduleModal schedule={selectedSchedule} onClose={handleClose} onLoadToMain={handleLoadToMainDashboard} T={T} />
      )}

      {/* Modal xác nhận xoá */}
      <ConfirmModal
        open={!!confirmDel}
        icon="🗑️"
        title="Xoá lịch trình?"
        message="Hành động này không thể hoàn tác. Lịch trình sẽ bị xoá vĩnh viễn."
        confirmLabel="Xoá lịch trình"
        onConfirm={doDelete}
        onCancel={() => setConfirmDel(null)}
        T={T}
      />
    </>
  );
}

// 🗂️ Lọc & Nhóm địa điểm
const TYPE_CONFIG = {
  hotel:     { label: 'Khách sạn',     emoji: '🏨' },
  tour:      { label: 'Tham quan',     emoji: '🗺️' },
  food:      { label: 'Ăn uống',       emoji: '🍜' },
  drink:     { label: 'Đồ uống',       emoji: '🧋' },
  specialty: { label: 'Đặc sản',       emoji: '🛍️' },
  default:   { label: 'Địa điểm khác', emoji: '📍' }
};

const FILTER_TABS = [
  { id: 'all',   label: 'Tất cả' },
  { id: 'hotel', label: 'Khách sạn', emoji: '🏨' },
  { id: 'tour',  label: 'Tham quan', emoji: '🗺️' },
  { id: 'food',  label: 'Ăn uống',   emoji: '🍜' },
  { id: 'drink', label: 'Đồ uống',   emoji: '🧋' },
  { id: 'specialty', label: 'Đặc sản',   emoji: '🛍️' },
];

// Thứ tự hiển thị địa điểm khớp với FILTER_TABS (bỏ 'all')
const TYPE_ORDER = ['hotel', 'tour', 'food', 'drink', 'specialty', 'default'];
const sortByTypeOrder = (arr) =>
  [...arr].sort((a, b) => {
    const ia = TYPE_ORDER.indexOf(normalizeType(a.type) || 'default');
    const ib = TYPE_ORDER.indexOf(normalizeType(b.type) || 'default');
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

function LocationGroup({ locationName, items, T, accentColor, children }) {
  const [open, setOpen] = useState(true);
  if (items.length === 0) return null;
  
  return (
    <div style={{ 
      marginBottom: 32, 
      border: `1px solid ${T.cardBorder}`, 
      borderRadius: 24, 
      background: T.card, 
      overflow: 'hidden' 
    }}>
      {/* Header nút bấm */}
      <button 
        onClick={() => setOpen(!open)} 
        style={{ 
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '16px 24px', 
          border: 'none', 
          borderBottom: open ? `1px solid ${T.cardBorder}` : 'none',
          background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`, 
          color: T.text, 
          cursor: 'pointer', transition: 'all 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>📍</span>
          <span style={{ fontWeight: 900, fontSize: 18 }}>{locationName}</span>
          <span style={{ background: accentColor, color: accentColor === C.warn ? '#451a03' : '#ffffff', padding: '3px 14px', borderRadius: 12, fontSize: 14, fontWeight: 800 }}>
            {items.length}
          </span>
        </div>
        <span style={{ fontSize: 14, color: T.muted }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Danh sách địa điểm */}
      {open && (
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '16px' 
          }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceItemCard({ item, tabType, onRemove, T, removeColor, i }) {
  const normalizedType = normalizeType(item.type);
  const config = TYPE_CONFIG[normalizedType] || TYPE_CONFIG.default;
  const crispImg = useCrispImageProfile(item, tabType, T);

  return (
    <div className="sp-card" style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <div className="sp-place-img" style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
        {crispImg ? (
          <img src={proxyImage(crispImg)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => { e.target.style.display = 'none'; }} />
        ) : config.emoji}
        
        <div style={{ position: 'absolute', top: 8, left: 8, padding: '4px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', fontSize: 11, fontWeight: 800, color: 'white' }}>
          {config.emoji} {config.label}
        </div>
        <button onClick={() => onRemove(item.id)} style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 8, border: 'none', background: 'rgba(0,0,0,0.6)', color: removeColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>✕</button>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        {item.rating && <span style={{ fontSize: 13, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>{Icon.star} {item.rating}</span>}
      </div>
    </div>
  );
}

// 🔍 THANH TÌM KIẾM
function SearchBar({ value, onChange, T }) {
  return (
    <div style={{ position: 'relative', width: '300px' }}>
      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: T.muted }}>
        🔍
      </span>
      <input
        type="text"
        placeholder="Tìm kiếm tỉnh thành..." // 🟢 Đã đổi text ở đây
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', height: '42px', padding: '0 36px 0 44px',
          borderRadius: 20, border: `1.5px solid ${T.cardBorder}`,
          background: T.inputBg, color: T.text, fontSize: 14, fontWeight: 600,
          outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
        }}
        onFocus={e => {
          e.target.style.borderColor = C.primary;
          e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)';
        }}
        onBlur={e => {
          e.target.style.borderColor = T.cardBorder;
          e.target.style.boxShadow = 'none';
        }}
      />
      {value && (
        <button 
          onClick={() => onChange('')} 
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 16 }}
        >✕</button>
      )}
    </div>
  );
}

// Normalize type dùng chung cho FilterBar và filteredItems
const TYPE_ALIAS_GLOBAL = {
  'khach-san': 'hotel', 'khachsan': 'hotel', 'accommodation': 'hotel', 'lodging': 'hotel',
  'dac-san': 'specialty', 'dacsan': 'specialty', 'local-specialty': 'specialty',
  'an-uong': 'food', 'anuong': 'food',
  'cafe': 'drink', 'coffee': 'drink', 'do-uong': 'drink', 'douong': 'drink',
  'tham-quan': 'tour', 'thamquan': 'tour', 'attraction': 'tour', 'explore': 'tour',
};
const normalizeType = (t) => TYPE_ALIAS_GLOBAL[t?.toLowerCase()] || t;

// 🗂️ THANH LỌC
function FilterBar({ current, onChange, items = [], T }) {
  const getCount = (type) => {
    if (!items) return 0;
    if (type === 'all') return items.length;
    return items.filter(i => normalizeType(i.type) === type).length;
  };

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
        Lọc theo loại
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(f => {
          const count = getCount(f.id);
          if (count === 0 && f.id !== 'all') return null;

          return (
            <button
              key={f.id}
              onClick={() => onChange(current === f.id && f.id !== 'all' ? 'all' : f.id)}
              style={{
                height: '42px',
                padding: '0 16px', borderRadius: 24,
                border: `1.5px solid ${current === f.id ? C.primary : T.cardBorder}`,
                background: current === f.id ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: current === f.id ? C.primary : T.muted,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              {f.emoji && <span style={{ fontSize: 16 }}>{f.emoji}</span>}
              {f.label}
              <span style={{
                background: current === f.id ? C.primary : T.cardBorder,
                color: current === f.id ? 'white' : T.text,
                padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 800,
                marginLeft: 4
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 🔖 TAB: LƯU TRỮ
function SavedPlaces({ T, onResetFilter, resetSignal, onCountChange }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reset filter khi tab được click lần 2
  useEffect(() => {
    if (resetSignal > 0) {
      setFilter('all');
      setSearchQuery('');
    }
  }, [resetSignal]);

  useEffect(() => {
    api.get('/api/saved-places').then(d => setItems(d.savedPlaces || [])).finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    await api.del(`/api/saved-places/${id}`);
    setItems(f => f.filter(x => x.id !== id));
    onCountChange?.(-1);
  };

  const searchedItems = items.filter(item => {
    if (!searchQuery) return true;
    const q = removeAccents(searchQuery);
    const loc = removeAccents(item.location || '');
    return loc.includes(q); 
  });

  const filteredItems = searchedItems.filter(item => filter === 'all' || normalizeType(item.type) === filter);

  const grouped = filteredItems.reduce((acc, item) => {
    const loc = standardizeLocation(item.location);
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(item);
    return acc;
  }, {});
  const locations = Object.keys(grouped).sort();

  return (
    <Section 
      title="Lưu trữ" 
      icon={Icon.bookmark} 
      count={items.length}
      // 🟢 ĐƯA THANH TÌM KIẾM LÊN NGANG HÀNG TIÊU ĐỀ
      action={!loading && items.length > 0 && <SearchBar value={searchQuery} onChange={setSearchQuery} T={T} />}
    >
      {loading && <Skeleton />}
      
      {/* 🟢 BỘ LỌC NẰM ĐỘC LẬP MỘT DÒNG */}
      {!loading && items.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <FilterBar current={filter} onChange={setFilter} items={searchedItems} T={T} />
        </div>
      )}

      {!loading && items.length === 0 && <Empty icon="🔖" text="Chưa có địa điểm nào được lưu" sub="Bấm 🔖 trên bất kỳ địa điểm nào để lưu vào đây" />}
      {!loading && items.length > 0 && filteredItems.length === 0 && <Empty icon="🔍" text="Không tìm thấy kết quả" sub="Vui lòng thử từ khóa hoặc bộ lọc khác" />}
      
      {!loading && locations.map(loc => (
        <LocationGroup key={loc} locationName={loc} items={grouped[loc]} T={T} accentColor={C.warn}>
          {sortByTypeOrder(grouped[loc]).map((item, i) => (
            <PlaceItemCard key={item.id} item={item} tabType="saved" onRemove={handleRemove} T={T} removeColor="#fbbf24" i={i} />
            ))}
        </LocationGroup>
      ))}
    </Section>
  );
}

// ❤️ TAB: YÊU THÍCH
function Favorites({ T, resetSignal, onCountChange }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reset filter khi tab được click lần 2
  useEffect(() => {
    if (resetSignal > 0) {
      setFilter('all');
      setSearchQuery('');
    }
  }, [resetSignal]);

  useEffect(() => {
    api.get('/api/favorites').then(d => setItems(d.favorites || [])).finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    await api.del(`/api/favorites/${id}`);
    setItems(f => f.filter(x => x.id !== id));
    onCountChange?.(-1);
  };

  const searchedItems = items.filter(item => {
    if (!searchQuery) return true;
    const q = removeAccents(searchQuery);
    const loc = removeAccents(item.location || '');
    return loc.includes(q); 
  });

  const filteredItems = searchedItems.filter(item => filter === 'all' || normalizeType(item.type) === filter);

  const grouped = filteredItems.reduce((acc, item) => {
    const loc = standardizeLocation(item.location);
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(item);
    return acc;
  }, {});
  const locations = Object.keys(grouped).sort();

  return (
    <Section 
      title="Địa điểm yêu thích" 
      icon={Icon.heart} 
      count={items.length}
      // 🟢 ĐƯA THANH TÌM KIẾM LÊN NGANG HÀNG TIÊU ĐỀ
      action={!loading && items.length > 0 && <SearchBar value={searchQuery} onChange={setSearchQuery} T={T} />}
    >
      {loading && <Skeleton />}
      
      {/* 🟢 BỘ LỌC NẰM ĐỘC LẬP MỘT DÒNG */}
      {!loading && items.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <FilterBar current={filter} onChange={setFilter} items={searchedItems} T={T} />
        </div>
      )}

      {!loading && items.length === 0 && <Empty icon="❤️" text="Chưa có địa điểm yêu thích" sub="Bấm ❤️ trên bất kỳ địa điểm nào để lưu vào đây" />}
      {!loading && items.length > 0 && filteredItems.length === 0 && <Empty icon="🔍" text="Không tìm thấy kết quả" sub="Vui lòng thử từ khóa hoặc bộ lọc khác" />}
      
      {!loading && locations.map(loc => (
        <LocationGroup key={loc} locationName={loc} items={grouped[loc]} T={T} accentColor={C.danger}>
          {sortByTypeOrder(grouped[loc]).map((item, i) => (
            <PlaceItemCard key={item.id} item={item} tabType="favorite" onRemove={handleRemove} T={T} removeColor="#f87171" i={i} />
            ))}
        </LocationGroup>
      ))}
    </Section>
  );
}

// 🔍 SEARCH HISTORY
function SearchHistory({ T, onSearch, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/search-history').then(d => setHistory(d.history || [])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await api.del(`/api/search-history/${id}`);
    setHistory(h => h.filter(x => x.id !== id));
  };
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearAll = () => setConfirmClear(true);
  const doClearAll = async () => {
    setConfirmClear(false);
    await api.del('/api/search-history/all');
    setHistory([]);
  };

  const handleReSearch = (h) => {
    if (!onSearch) return;
    onSearch({
      location:      h.location      || h.destination || '',
      origin:        h.origin        || '',
      budget:        h.budget        || '',
      days:          h.days          ? `${h.days} ngày` : '3 ngày',
      passengers:    h.passengers    || 1,
      departureDate: h.departure_date || '',
    });
    if (onBack) onBack();
  };

  return (
    <Section title="Lịch sử tìm kiếm" icon={Icon.search} count={history.length} action={history.length > 0 && ( <button onClick={handleClearAll} className="sp-btn" style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.20)', background: 'rgba(248,113,113,0.10)', color: C.danger, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}> Xoá tất cả </button> )}>
      {loading && <Skeleton />}
      {!loading && history.length === 0 && <Empty icon="🔍" text="Chưa có lịch sử tìm kiếm" sub="Các chuyến đi bạn đã tìm kiếm sẽ hiện ở đây" />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {history.map((h, i) => (
          <div key={h.id} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: 'rgba(16,185,129,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔍</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{h.origin} → <span style={{ color: C.primary }}>{h.location || h.destination}</span></div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 3, display: 'flex', gap: 12 }}>
                <span>{h.days} ngày · {h.passengers} người</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{Icon.clock} {formatDate(h.searched_at)}</span>
              </div>
            </div>
            <button className="sp-btn" onClick={() => handleReSearch(h)} style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: 'rgba(16,185,129,0.15)', color: C.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Tìm lại</button>
            <button className="sp-del" onClick={() => handleDelete(h.id)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>{Icon.trash}</button>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={confirmClear}
        icon="🗑️"
        title="Xoá toàn bộ lịch sử?"
        message="Tất cả lịch sử tìm kiếm sẽ bị xoá vĩnh viễn và không thể khôi phục."
        confirmLabel="Xoá tất cả"
        onConfirm={doClearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </Section>
  );
}

function StatusMsg({ status, okText }) {
  const isErr = status.startsWith('err:');
  return (
    <div style={{ marginTop: 10, padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: isErr ? 'rgba(248,113,113,0.10)' : 'rgba(16,185,129,0.15)', border: `1px solid ${isErr ? 'rgba(248,113,113,0.20)' : 'rgba(16,185,129,0.20)'}`, color: isErr ? C.danger : C.primary }}>
      {isErr ? `❌ ${status.slice(4)}` : okText}
    </div>
  );
}

// ⚙️ SETTINGS
function Settings({ user, onUpdate, T, onLogout }) {
  const [name,        setName]        = useState(user.name || '');
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [nameStatus,  setNameStatus]  = useState('');
  const [pwStatus,    setPwStatus]    = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [pwLoading,   setPwLoading]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    setNameLoading(true); setNameStatus('');
    const res = await api.post('/api/auth/update-profile', { name: name.trim() });
    if (res.success) { onUpdate(res.user); setNameStatus('ok'); }
    else setNameStatus('err:' + (res.error || 'Lỗi'));
    setNameLoading(false); setTimeout(() => setNameStatus(''), 3000);
  };

  const handleUpdatePassword = async () => {
    if (newPw !== confirmPw) { setPwStatus('err:Mật khẩu xác nhận không khớp'); return; }
    if (newPw.length < 6)    { setPwStatus('err:Mật khẩu mới phải ít nhất 6 ký tự'); return; }
    setPwLoading(true); setPwStatus('');
    const res = await api.post('/api/auth/change-password', { current_password: currentPw, new_password: newPw });
    if (res.success) { setPwStatus('ok'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
    else setPwStatus('err:' + (res.error || 'Lỗi'));
    setPwLoading(false); setTimeout(() => setPwStatus(''), 4000);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await api.del('/api/auth/delete-account');
      if (res.success) {
        // Gọi thêm logout để chắc chắn clear session cookie
        await api.post('/api/auth/logout', {});
        setConfirmDelete(false);
        // Clear user state ở App.js → UI tự về trạng thái chưa đăng nhập
        onUpdate(null);
        if (onLogout) onLogout();
      } else {
        alert('Lỗi: ' + (res.error || 'Không thể xóa tài khoản'));
      }
    } catch (e) {
      alert('Lỗi kết nối, vui lòng thử lại.');
    }
    setDeleteLoading(false);
  };

  const inputStyle = { width: '100%', padding: '13px 16px', border: `1.5px solid ${T.inputBorder}`, borderRadius: 12, background: T.inputBg, color: T.text, fontSize: 14, boxSizing: 'border-box', transition: '0.2s' };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 8 };

  return (
    <Section title="Cài đặt tài khoản" icon={Icon.settings}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Đổi tên */}
        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, color: T.text }}>{Icon.edit} Đổi tên hiển thị</div>
          <label style={labelStyle}>Tên mới</label>
          <input className="sp-input" value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Nhập tên mới..." />
          {nameStatus && <StatusMsg status={nameStatus} okText="✅ Đã cập nhật tên thành công!" />}
          <button className="sp-btn" onClick={handleUpdateName} disabled={nameLoading || !name.trim()} style={{ marginTop: 14, padding: '11px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 800, fontSize: 14, cursor: nameLoading ? 'not-allowed' : 'pointer', opacity: nameLoading ? 0.7 : 1 }}>
            {nameLoading ? '⏳ Đang lưu...' : 'Lưu tên mới'}
          </button>
        </div>

        {/* Đổi mật khẩu */}
        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 18, padding: '22px 24px', opacity: user.google_id ? 0.45 : 1, pointerEvents: user.google_id ? 'none' : 'auto', position: 'relative' }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, color: T.text }}>🔒 Đổi mật khẩu</div>
          {user.google_id && (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.12))', border: '1.5px solid rgba(16,185,129,0.30)', borderRadius: 12, padding: '13px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 8px rgba(16,185,129,0.12)' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🔗</span>
              <span style={{ lineHeight: 1.5 }}>Tài khoản đăng nhập qua Google — đổi mật khẩu tại{' '}
                <a href="https://myaccount.google.com" target="_blank" rel="noreferrer"
                  style={{ color: '#059669', fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  myaccount.google.com
                </a>
              </span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={labelStyle}>Mật khẩu hiện tại</label><input className="sp-input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={inputStyle} placeholder="••••••••" /></div>
            <div><label style={labelStyle}>Mật khẩu mới</label><input className="sp-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} placeholder="••••••••" /></div>
            <div><label style={labelStyle}>Xác nhận mật khẩu mới</label><input className="sp-input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inputStyle} placeholder="••••••••" /></div>
          </div>
          {pwStatus && <StatusMsg status={pwStatus} okText="✅ Đổi mật khẩu thành công!" />}
          <button className="sp-btn" onClick={handleUpdatePassword} disabled={pwLoading || !currentPw || !newPw || !confirmPw} style={{ marginTop: 14, padding: '11px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 800, fontSize: 14, cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: (pwLoading || !currentPw || !newPw || !confirmPw) ? 0.5 : 1 }}>
            {pwLoading ? '⏳ Đang lưu...' : 'Cập nhật mật khẩu'}
          </button>
        </div>

        {/* Xóa tài khoản */}
        <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: C.danger }}>
            ⚠️ Vùng nguy hiểm
          </div>
          <div style={{ fontSize: 14, color: T.muted, marginBottom: 16, lineHeight: 1.6 }}>
            Xóa tài khoản sẽ xóa vĩnh viễn toàn bộ dữ liệu của bạn bao gồm lịch trình, địa điểm đã lưu, yêu thích và lịch sử tìm kiếm. Hành động này <strong style={{ color: C.danger }}>không thể hoàn tác</strong>.
          </div>
          <button
            className="sp-btn"
            onClick={() => { setConfirmDelete(true); }}
            style={{ padding: '11px 24px', borderRadius: 12, border: `1.5px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.10)', color: C.danger, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            🗑️ Xóa tài khoản
          </button>
        </div>
      </div>

      {/* Modal xác nhận xóa tài khoản */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(false)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: 'linear-gradient(145deg, #0f1825, #0f1825)', border: '1px solid rgba(248,113,113,0.20)', borderRadius: 24, padding: '32px 28px', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px' }}>💀</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', marginBottom: 10 }}>Xóa tài khoản vĩnh viễn?</div>
              <div style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7 }}>
                Toàn bộ dữ liệu của bạn — lịch trình, địa điểm đã lưu, yêu thích và lịch sử tìm kiếm — sẽ bị xóa ngay lập tức và <strong style={{ color: C.danger }}>không thể khôi phục</strong>.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f87171, #ef4444)', color: 'white', fontWeight: 800, fontSize: 15, cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1, transition: '0.2s' }}
              >
                {deleteLoading ? '⏳ Đang xóa...' : '🗑️ Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}