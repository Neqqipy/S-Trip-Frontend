// ProfilePage.jsx
// ================================================================
// 👤 TRANG HỒ SƠ CÁ NHÂN — S-Trip
// Gồm: Yêu thích, Lịch trình đã lưu, Lịch sử tìm kiếm, Cài đặt tài khoản
// ================================================================
// Cách dùng trong App.js (nếu dùng React Router):
//
//   import { BrowserRouter, Routes, Route } from 'react-router-dom';
//   import ProfilePage from './components/ProfilePage';
//
//   <Routes>
//     <Route path="/"        element={<Home />} />
//     <Route path="/profile" element={<ProfilePage />} />
//   </Routes>
//
// Nếu KHÔNG dùng React Router, xem phần cuối file để dùng state-based routing.
// ================================================================

import React, { useState, useEffect, useRef } from 'react';

const BASE_URL = 'http://localhost:5000';

// ── Icons SVG inline (không cần thêm thư viện) ──────────────────
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

// ── Color palette (khớp với S-Trip xanh ngọc) ───────────────────
const C = {
  primary:   '#10b981',
  primary2:  '#059669',
  dark:      '#0f172a',
  card:      '#1e293b',
  border:    '#334155',
  text:      '#f8fafc',
  muted:     '#94a3b8',
  danger:    '#ef4444',
  warn:      '#f59e0b',
};

// ================================================================
// 🗄️ API HELPERS
// ================================================================
const api = {
  get:  (path) => fetch(`${BASE_URL}${path}`, { credentials: 'include' }).then(r => r.json()),
  post: (path, body) => fetch(`${BASE_URL}${path}`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json()),
  del:  (path) => fetch(`${BASE_URL}${path}`, { method: 'DELETE', credentials: 'include' }).then(r => r.json()),
};

// ================================================================
// 🎨 MAIN PROFILE PAGE
// ================================================================
export default function ProfilePage({ onBack, isDark = true }) {
  const [user,       setUser]       = useState(null);
  const [tab,        setTab]        = useState('saved');   // saved | favorites | history | settings
  const [loading,    setLoading]    = useState(true);

  // Fetch user info
  useEffect(() => {
    api.get('/api/auth/me').then(d => {
      if (d.success) setUser(d.user);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingScreen />;
  if (!user)   return <NotLoggedIn onBack={onBack} />;

  const tabs = [
    { id: 'saved',     label: 'Lịch trình đã lưu', icon: Icon.calendar },
    { id: 'favorites', label: 'Yêu thích',          icon: Icon.heart    },
    { id: 'history',   label: 'Lịch sử tìm kiếm',  icon: Icon.search   },
    { id: 'settings',  label: 'Cài đặt',            icon: Icon.settings },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #0f2040 40%, #0a1628 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      color: C.text,
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .sp-tab:hover  { background: rgba(16,185,129,0.12) !important; color: #10b981 !important; }
        .sp-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.4) !important; }
        .sp-card       { transition: all 0.25s ease; }
        .sp-btn:hover  { opacity: 0.85; transform: translateY(-1px); }
        .sp-btn        { transition: all 0.2s ease; }
        .sp-del:hover  { background: rgba(239,68,68,0.15) !important; color: #ef4444 !important; }
        .sp-input:focus{ outline:none; border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: 'rgba(16,185,129,0.08)',
        borderBottom: '1px solid rgba(16,185,129,0.15)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 68, gap: 16 }}>
          <button
            onClick={onBack}
            className="sp-btn"
            style={{
              width: 42, height: 42, borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)',
              color: C.text, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {Icon.back}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px' }}>Tài khoản</span>
            <span style={{ fontSize: 13, color: C.primary, fontWeight: 700, background: 'rgba(16,185,129,0.15)', padding: '3px 10px', borderRadius: 20 }}>
              ✈️ S-Trip
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 28 }}>

        {/* ── SIDEBAR ── */}
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          {/* Avatar card */}
          <AvatarCard user={user} onUpdate={setUser} />

          {/* Nav tabs */}
          <div style={{
            marginTop: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            {tabs.map((t, i) => (
              <button
                key={t.id}
                className="sp-tab"
                onClick={() => setTab(t.id)}
                style={{
                  width: '100%', padding: '14px 20px',
                  border: 'none', borderBottom: i < tabs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: tab === t.id ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: tab === t.id ? C.primary : C.muted,
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', fontWeight: tab === t.id ? 800 : 600,
                  fontSize: 14, textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                <span style={{ opacity: tab === t.id ? 1 : 0.6 }}>{t.icon}</span>
                {t.label}
                {tab === t.id && (
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: C.primary }} />
                )}
              </button>
            ))}
          </div>

          {/* Stats */}
          <StatsBar user={user} />
        </div>

        {/* ── CONTENT ── */}
        <div style={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
          {tab === 'saved'     && <SavedSchedules />}
          {tab === 'favorites' && <Favorites />}
          {tab === 'history'   && <SearchHistory />}
          {tab === 'settings'  && <Settings user={user} onUpdate={setUser} />}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 🖼️ AVATAR CARD
// ================================================================
function AvatarCard({ user, onUpdate }) {
  const fileRef  = useRef();
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(user.avatar || '');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Ảnh tối đa 10MB'); return; }

    // Preview ngay lập tức
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload lên server
    setUploading(true);
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/update-avatar`, {
        method: 'POST', credentials: 'include', body: form,
      });
      const data = await res.json();
      if (data.success) onUpdate(data.user);
    } catch { alert('Upload thất bại'); }
    finally { setUploading(false); }
  };

  const initials = (user.name || user.email || '?')[0].toUpperCase();

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)',
      border: '1px solid rgba(16,185,129,0.2)',
      borderRadius: 24, padding: '28px 20px',
      textAlign: 'center',
    }}>
      {/* Avatar */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          border: '3px solid rgba(16,185,129,0.5)',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, fontWeight: 900, color: 'white',
          boxShadow: '0 0 30px rgba(16,185,129,0.3)',
        }}>
          {preview
            ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>

        {/* Camera button */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="sp-btn"
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 32, height: 32, borderRadius: '50%',
            border: '2px solid #0f172a',
            background: C.primary, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14,
          }}
        >
          {uploading ? '⏳' : Icon.camera}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{user.name}</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>{user.email}</div>

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 14px', borderRadius: 20,
        background: 'rgba(16,185,129,0.15)',
        border: '1px solid rgba(16,185,129,0.3)',
        fontSize: 12, fontWeight: 700, color: C.primary,
      }}>
        ✈️ Traveler
      </div>
    </div>
  );
}

// ================================================================
// 📊 STATS BAR
// ================================================================
function StatsBar({ user }) {
  const [stats, setStats] = useState({ schedules: 0, favorites: 0, searches: 0 });

  useEffect(() => {
    // Lấy count từ API
    Promise.all([
      api.get('/api/schedules'),
      api.get('/api/favorites'),
      api.get('/api/search-history'),
    ]).then(([s, f, h]) => {
      setStats({
        schedules: s.schedules?.length || 0,
        favorites: f.favorites?.length || 0,
        searches:  h.history?.length   || 0,
      });
    }).catch(() => {});
  }, []);

  const items = [
    { label: 'Lịch trình', value: stats.schedules },
    { label: 'Yêu thích',  value: stats.favorites  },
    { label: 'Tìm kiếm',   value: stats.searches   },
  ];

  return (
    <div style={{
      marginTop: 14,
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
    }}>
      {items.map(item => (
        <div key={item.label} style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '12px 8px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.primary }}>{item.value}</div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// 📅 SAVED SCHEDULES
// ================================================================
function SavedSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.get('/api/schedules')
      .then(d => { setSchedules(d.schedules || []); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá lịch trình này?')) return;
    const res = await api.del(`/api/schedules/${id}`);
    if (res.success) setSchedules(s => s.filter(x => x.id !== id));
  };

  return (
    <Section title="Lịch trình đã lưu" icon={Icon.calendar} count={schedules.length}>
      {loading && <Skeleton />}
      {!loading && schedules.length === 0 && (
        <Empty icon="🗓️" text="Chưa có lịch trình nào được lưu" sub="Tạo lịch trình và bấm 'Lưu lịch trình' để thấy ở đây" />
      )}
      <div style={{ display: 'grid', gap: 14 }}>
        {schedules.map((s, i) => (
          <div
            key={s.id}
            className="sp-card"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18, padding: '18px 20px',
              display: 'flex', gap: 16, alignItems: 'center',
              animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
            }}
          >
            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))',
              border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>
              🗺️
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.title}
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: C.primary, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {Icon.map} {s.location}
                </span>
                <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {Icon.plane} {s.days} ngày
                </span>
                <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {Icon.clock} {formatDate(s.updated_at)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                className="sp-btn"
                style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none',
                  background: 'rgba(16,185,129,0.15)', color: C.primary,
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                Xem
              </button>
              <button
                className="sp-del"
                onClick={() => handleDelete(s.id)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent', color: C.muted,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: '0.2s',
                }}
              >
                {Icon.trash}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ================================================================
// ❤️ FAVORITES
// ================================================================
function Favorites() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/favorites')
      .then(d => setItems(d.favorites || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    await api.del(`/api/favorites/${id}`);
    setItems(f => f.filter(x => x.id !== id));
  };

  const typeEmoji = { hotel: '🏨', tour: '🗺️', food: '🍜', drink: '🧋', default: '📍' };

  return (
    <Section title="Địa điểm yêu thích" icon={Icon.heart} count={items.length}>
      {loading && <Skeleton />}
      {!loading && items.length === 0 && (
        <Empty icon="❤️" text="Chưa có địa điểm yêu thích" sub="Bấm ❤️ trên bất kỳ địa điểm nào để lưu vào đây" />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            className="sp-card"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18, overflow: 'hidden',
              animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
            }}
          >
            {/* Ảnh */}
            <div style={{
              height: 130, background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40,
            }}>
              {item.thumbnail
                ? <img src={item.thumbnail} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                : typeEmoji[item.type] || typeEmoji.default
              }
              {/* Remove btn */}
              <button
                onClick={() => handleRemove(item.id)}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 30, height: 30, borderRadius: 8,
                  border: 'none', background: 'rgba(0,0,0,0.5)',
                  color: '#f87171', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: C.primary }}>{item.location}</span>
                {item.rating && (
                  <span style={{ fontSize: 12, color: C.warn, display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
                    {Icon.star} {item.rating}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ================================================================
// 🔍 SEARCH HISTORY
// ================================================================
function SearchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/search-history')
      .then(d => setHistory(d.history || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await api.del(`/api/search-history/${id}`);
    setHistory(h => h.filter(x => x.id !== id));
  };

  const handleClearAll = async () => {
    if (!window.confirm('Xoá toàn bộ lịch sử?')) return;
    await api.del('/api/search-history/all');
    setHistory([]);
  };

  return (
    <Section
      title="Lịch sử tìm kiếm"
      icon={Icon.search}
      count={history.length}
      action={history.length > 0 && (
        <button
          onClick={handleClearAll}
          className="sp-btn"
          style={{
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.1)', color: C.danger,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Xoá tất cả
        </button>
      )}
    >
      {loading && <Skeleton />}
      {!loading && history.length === 0 && (
        <Empty icon="🔍" text="Chưa có lịch sử tìm kiếm" sub="Các chuyến đi bạn đã tìm kiếm sẽ hiện ở đây" />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {history.map((h, i) => (
          <div
            key={h.id}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              🔍
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {h.origin} → <span style={{ color: C.primary }}>{h.destination}</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3, display: 'flex', gap: 12 }}>
                <span>{h.days} ngày · {h.passengers} người</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Icon.clock} {formatDate(h.searched_at)}
                </span>
              </div>
            </div>

            {/* Re-search button */}
            <button
              className="sp-btn"
              style={{
                padding: '7px 14px', borderRadius: 9,
                border: 'none', background: 'rgba(16,185,129,0.15)',
                color: C.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}
            >
              Tìm lại
            </button>

            <button
              className="sp-del"
              onClick={() => handleDelete(h.id)}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: 'none', background: 'transparent',
                color: C.muted, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: '0.2s',
              }}
            >
              {Icon.trash}
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ================================================================
// ⚙️ SETTINGS
// ================================================================
function Settings({ user, onUpdate }) {
  const [name,        setName]        = useState(user.name || '');
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [nameStatus,  setNameStatus]  = useState('');  // '' | 'ok' | 'err'
  const [pwStatus,    setPwStatus]    = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [pwLoading,   setPwLoading]   = useState(false);

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    setNameLoading(true); setNameStatus('');
    const res = await api.post('/api/auth/update-profile', { name: name.trim() });
    if (res.success) { onUpdate(res.user); setNameStatus('ok'); }
    else setNameStatus('err:' + (res.error || 'Lỗi'));
    setNameLoading(false);
    setTimeout(() => setNameStatus(''), 3000);
  };

  const handleUpdatePassword = async () => {
    if (newPw !== confirmPw) { setPwStatus('err:Mật khẩu xác nhận không khớp'); return; }
    if (newPw.length < 6)    { setPwStatus('err:Mật khẩu mới phải ít nhất 6 ký tự'); return; }
    setPwLoading(true); setPwStatus('');
    const res = await api.post('/api/auth/change-password', { current_password: currentPw, new_password: newPw });
    if (res.success) { setPwStatus('ok'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
    else setPwStatus('err:' + (res.error || 'Lỗi'));
    setPwLoading(false);
    setTimeout(() => setPwStatus(''), 4000);
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 12, background: 'rgba(255,255,255,0.05)',
    color: C.text, fontSize: 14, boxSizing: 'border-box',
    transition: '0.2s',
  };

  const labelStyle = { fontSize: 13, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 8 };

  return (
    <Section title="Cài đặt tài khoản" icon={Icon.settings}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Đổi tên ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, padding: '22px 24px',
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icon.edit} Đổi tên hiển thị
          </div>
          <label style={labelStyle}>Tên mới</label>
          <input
            className="sp-input"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            placeholder="Nhập tên mới..."
          />
          {nameStatus && (
            <StatusMsg status={nameStatus} okText="✅ Đã cập nhật tên thành công!" />
          )}
          <button
            className="sp-btn"
            onClick={handleUpdateName}
            disabled={nameLoading || !name.trim()}
            style={{
              marginTop: 14, padding: '11px 24px',
              borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', fontWeight: 800, fontSize: 14,
              cursor: nameLoading ? 'not-allowed' : 'pointer',
              opacity: nameLoading ? 0.7 : 1,
            }}
          >
            {nameLoading ? '⏳ Đang lưu...' : 'Lưu tên mới'}
          </button>
        </div>

        {/* ── Đổi mật khẩu ── */}
        {!user.google_id && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 18, padding: '22px 24px',
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔒 Đổi mật khẩu
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Mật khẩu hiện tại</label>
                <input className="sp-input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
              <div>
                <label style={labelStyle}>Mật khẩu mới</label>
                <input className="sp-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
              <div>
                <label style={labelStyle}>Xác nhận mật khẩu mới</label>
                <input className="sp-input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
            </div>
            {pwStatus && <StatusMsg status={pwStatus} okText="✅ Đổi mật khẩu thành công!" />}
            <button
              className="sp-btn"
              onClick={handleUpdatePassword}
              disabled={pwLoading || !currentPw || !newPw || !confirmPw}
              style={{
                marginTop: 14, padding: '11px 24px',
                borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', fontWeight: 800, fontSize: 14,
                cursor: pwLoading ? 'not-allowed' : 'pointer',
                opacity: pwLoading ? 0.7 : 1,
              }}
            >
              {pwLoading ? '⏳ Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </div>
        )}

        {/* ── Thông tin tài khoản ── */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18, padding: '18px 24px',
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>ℹ️ Thông tin tài khoản</div>
          {[
            { label: 'Email',         value: user.email },
            { label: 'Ngày tạo',      value: formatDate(user.created_at) },
            { label: 'Đăng nhập qua', value: user.google_id ? '🌐 Google' : '📧 Email' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: 13, color: C.muted }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ================================================================
// 🧩 SHARED COMPONENTS
// ================================================================
function Section({ title, icon, count, action, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: C.primary }}>{icon}</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{title}</h2>
          {count !== undefined && count > 0 && (
            <span style={{
              background: 'rgba(16,185,129,0.15)', color: C.primary,
              fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
            }}>{count}</span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusMsg({ status, okText }) {
  const isOk  = status === 'ok';
  const msg   = isOk ? okText : status.replace(/^err:/, '');
  return (
    <div style={{
      marginTop: 12, padding: '10px 14px', borderRadius: 10,
      background: isOk ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${isOk ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
      color: isOk ? C.primary : C.danger,
      fontSize: 13, fontWeight: 600,
    }}>
      {msg}
    </div>
  );
}

function Empty({ icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{text}</div>
      <div style={{ fontSize: 13 }}>{sub}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{
          height: 80, borderRadius: 16,
          background: 'rgba(255,255,255,0.04)',
          animation: 'pulse 1.5s ease infinite',
        }} />
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1628', color: '#10b981', fontSize: 18, fontWeight: 700 }}>
      ⏳ Đang tải...
    </div>
  );
}

function NotLoggedIn({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a1628', color: 'white', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>Bạn chưa đăng nhập</div>
      <button onClick={onBack} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: '#10b981', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}>
        Quay lại trang chủ
      </button>
    </div>
  );
}

function formatDate(str) {
  if (!str) return '';
  try {
    return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return str; }
}