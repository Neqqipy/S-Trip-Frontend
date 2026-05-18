import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightToBracket,
  faXmark,
  faLock,
  faCalendarDays,
  faCompass,
  faHouse,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';

const BASE_URL = 'http://localhost:5000';

// ✅ Props mới: hasItinerary — khoá nút "Lịch trình" khi chưa tìm kiếm
const Navbar = ({ activeSection, onNavigate, onRefresh, hasItinerary, isDark, onToggleTheme }) => {
  const [showAuth,   setShowAuth]   = useState(false);
  const [isLogin,    setIsLogin]    = useState(true);
  const [showLockTip,setShowLockTip]= useState(false);

  // ── Auth state ──
  const [user,       setUser]       = useState(null);   // null = chưa đăng nhập
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [name,       setName]       = useState('');
  const [authError,  setAuthError]  = useState('');
  const [authLoading,setAuthLoading]= useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);  // dropdown avatar

  // Kiểm tra session khi load trang
  useEffect(() => {
    fetch(`${BASE_URL}/api/auth/me`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.user); })
      .catch(() => {});

    // Xử lý Google OAuth redirect ?auth_success=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success')) {
      fetch(`${BASE_URL}/api/auth/me`, { credentials: 'include' })
        .then(r => r.json())
        .then(d => { if (d.success) setUser(d.user); });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const openModal = (loginMode = true) => {
    setIsLogin(loginMode);
    setAuthError('');
    setEmail(''); setPassword(''); setName('');
    setShowAuth(true);
  };

  const handleSubmit = async () => {
    setAuthError(''); setAuthLoading(true);
    const endpoint = isLogin
      ? `${BASE_URL}/api/auth/login`
      : `${BASE_URL}/api/auth/register`;
    const body = isLogin
      ? { email, password }
      : { email, password, name };
    try {
      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setShowAuth(false);
      } else {
        setAuthError(data.error || 'Có lỗi xảy ra');
      }
    } catch {
      setAuthError('Không thể kết nối server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${BASE_URL}/api/auth/google?next=${encodeURIComponent(window.location.href)}`;
  };

  const handleLogout = async () => {
    await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    setMenuOpen(false);
  };

  // Tất cả scroll đều uỷ quyền cho App.js (onNavigate) để isScrollingRef hoạt động đúng
  const handleHomeClick = () => {
    if (onNavigate) onNavigate('hero-section');
  };

  const handleItineraryClick = () => {
    if (!hasItinerary) {
      setShowLockTip(true);
      setTimeout(() => setShowLockTip(false), 2200);
      return;
    }
    if (onNavigate) onNavigate('itinerary-section');
  };

  const styles = {
    header: {
      height: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center',
      position: 'fixed', top: 0, width: '100%', zIndex: 1000,
      background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', boxSizing: 'border-box',
    },
    container: {
      width: '100%', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center', padding: '0 50px',
    },
    logo: {
      fontSize: '48px', fontWeight: '900', color: 'white',
      display: 'flex', alignItems: 'center', gap: '15px',
      textDecoration: 'none', cursor: 'pointer',
    },
    logoIcon: {
      backgroundColor: '#10b981', width: '65px', height: '65px', borderRadius: '50%',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontSize: '35px', color: 'white',
    },
    logoContainer: {
      display: 'flex', 
      alignItems: 'center', 
      gap: '18px', // Khoảng cách giữa ảnh và chữ
      textDecoration: 'none', 
      cursor: 'pointer',
    },
    logoImage: {
      height: '88px', 
      width: '88px',
      borderRadius: '50%',
      objectFit: 'cover',
      // Tăng độ sáng (brightness) và tạo hiệu ứng tỏa hào quang (drop-shadow) màu xanh ngọc
      filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.9)) brightness(1.15)', 
    },
    brandTextContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    brandTitle: {
      fontSize: '38px', 
      fontWeight: '900', 
      color: 'white',
      // Hiệu ứng chữ phát sáng màu trắng giống trong ảnh mẫu
      textShadow: '0 0 4px rgba(255,255,255,0.6), 0 0 8px rgba(255,255,255,0.25)',
      lineHeight: '1.1',
    },
    brandSubtitle: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#34d399', // Màu xanh ngọc
      letterSpacing: '3px', // Giãn cách chữ rộng ra
      marginTop: '10px',
      textShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
    },
    brandLine: {
      height: '1px',
      width: '100%', // Kẻ dài bằng chữ
      backgroundColor: 'rgba(16, 185, 129, 0.4)', // Đường kẻ mờ
      marginTop: '5px',
    },
    nav: { display: 'flex', gap: '45px', alignItems: 'center' },

    // ── Link style — active / normal / locked
    link: (isActive, locked) => ({
      color: locked ? 'rgba(255,255,255,0.35)' : (isActive ? '#10b981' : 'white'),
      textDecoration: 'none', fontWeight: '700', fontSize: '22px',
      cursor: locked ? 'not-allowed' : 'pointer',
      position: 'relative', display: 'flex', alignItems: 'center', gap: '8px',
      transition: 'color 0.2s',
    }),
    underline: {
      position: 'absolute', bottom: '-8px', left: '0', width: '100%',
      height: '4px', backgroundColor: '#10b981', borderRadius: '2px',
    },

    // ── Tooltip khoá
    lockTooltip: {
      position: 'absolute', top: '140%', left: '50%', transform: 'translateX(-50%)',
      backgroundColor: '#1f2937', color: 'white', padding: '10px 20px',
      borderRadius: '12px', fontSize: '16px', whiteSpace: 'nowrap',
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)', zIndex: 9999,
      animation: 'fadeInDown 0.2s ease',
      pointerEvents: 'none',
    },
    tooltipArrow: {
      position: 'absolute', top: '-7px', left: '50%', transform: 'translateX(-50%)',
      width: 0, height: 0,
      borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
      borderBottom: '8px solid #1f2937',
    },

    loginBtn: {
      backgroundColor: '#10b981', color: 'white', padding: '16px 40px',
      borderRadius: '9999px', fontWeight: '800', fontSize: '20px',
      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
    },
    overlay: {
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(15px)',
    },
    modal: {
      backgroundColor: isDark ? '#0f172a' : 'white', width: '750px', maxWidth: '90%', maxHeight: '85vh',
      overflowY: 'auto', borderRadius: '50px', padding: '60px 70px',
      position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
    },
    closeBtn: {
      position: 'absolute', top: '35px', right: '40px',
      background: 'none', border: 'none', fontSize: '45px', color: isDark ? '#64748b' : '#9ca3af', cursor: 'pointer',
    },
    title: { fontSize: '50px', fontWeight: '900', color: isDark ? '#ffffff' : '#111827', marginBottom: '10px', textAlign: 'center' },
    subtitle: { color: isDark ? '#94a3b8' : '#6b7280', fontSize: '22px', textAlign: 'center', marginBottom: '40px' },
    inputGroup: { marginBottom: '25px', position: 'relative' },
    inputIcon: { position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#9ca3af', fontSize: '26px' },
    input: { width: '100%', padding: '22px 30px 22px 80px', borderRadius: '25px', border: isDark ? '3px solid #1e293b' : '3px solid #f1f5f9', fontSize: '22px', outline: 'none', boxSizing: 'border-box', backgroundColor: isDark ? '#1e293b' : 'white', color: isDark ? '#ffffff' : '#111827' },
    submitBtn: { width: '100%', backgroundColor: isDark ? '#10b981' : '#111827', color: 'white', padding: '22px', borderRadius: '25px', fontSize: '24px', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '10px' },
    switchText: { textAlign: 'center', marginTop: '30px', fontSize: '20px', color: isDark ? '#94a3b8' : '#4b5563' },
    switchLink: { color: '#10b981', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline', marginLeft: '10px' },
  };

  const isScheduleActive = activeSection === 'schedule';
  const isItineraryLocked = !hasItinerary;

  return (
    <>
      {/* CSS animation cho tooltip */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -6px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

        /* ── DARK MODE TOGGLE ── */
        .theme-toggle-track {
          width: 68px;
          height: 36px;
          background-color: rgba(255,255,255,0.25);
          border-radius: 999px;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.35);
          transition: background-color 0.45s ease, box-shadow 0.45s ease;
          box-shadow: inset 0 1px 4px rgba(0,0,0,0.15);
        }
        .theme-toggle-track.is-dark {
          background-color: #10b981;
          box-shadow: inset 0 1px 4px rgba(0,0,0,0.2), 0 0 12px rgba(16,185,129,0.4);
        }

        .theme-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 26px;
          height: 26px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: left 0.45s cubic-bezier(0.34, 1.4, 0.64, 1),
                      box-shadow 0.3s ease;
          will-change: left;
        }
        .theme-toggle-track.is-dark .theme-toggle-thumb {
          left: 33px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        }

        .theme-toggle-icon {
          font-size: 16px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.2s ease;
          user-select: none;
        }
        .theme-toggle-track:active .theme-toggle-thumb {
          width: 30px;
        }
        .theme-toggle-track.is-dark:active .theme-toggle-thumb {
          left: 29px;
        }
      `}</style>

      <header style={styles.header}>
        <div style={styles.container}>
          {/* LOGO */}
          <div style={styles.logoContainer} onClick={onRefresh}>
            <img 
              src="/S.jpg" // Đảm bảo tên file ảnh của bạn khớp nhé
              alt="S-Trip Logo" 
              style={styles.logoImage} 
            />
            
            {/* Vùng chứa chữ S-Trip và Khám Phá Việt Nam */}
            <div style={styles.brandTextContainer}>
              <span style={styles.brandTitle}>S-Trip</span>
              <span style={styles.brandSubtitle}>KHÁM PHÁ VIỆT NAM</span>
              <div style={styles.brandLine}></div>
            </div>
          </div>

          <nav style={styles.nav}>
            {/* TRANG CHỦ */}
            <div
              style={styles.link(activeSection === 'home', false)}
              onClick={handleHomeClick}
            >
              <FontAwesomeIcon icon={faHouse} style={{ fontSize: '18px', marginRight: '8px' }} />
              Trang chủ
              {activeSection === 'home' && <div style={styles.underline} />}
            </div>

            {/* LỊCH TRÌNH — có thể bị khoá */}
            <div style={{ position: 'relative' }}>
              <div
                style={styles.link(isScheduleActive, isItineraryLocked)}
                onClick={handleItineraryClick}
              >
                {isItineraryLocked && (
                  <FontAwesomeIcon icon={faLock} style={{ fontSize: '18px' }} />
                )}
                Lịch trình
                {isScheduleActive && !isItineraryLocked && <div style={styles.underline} />}
              </div>

              {/* Tooltip hiện khi click lúc bị khoá */}
              {showLockTip && (
                <div style={styles.lockTooltip}>
                  <div style={styles.tooltipArrow} />
                  <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: '8px', color: '#10b981' }} />
                  Hãy tìm kiếm chuyến đi trước nhé!
                </div>
              )}
            </div>
            
            {/* KHÁM PHÁ */}
            <div
              style={styles.link(activeSection === 'featured', false)}
              onClick={() => onNavigate('featured-section')}
            >
              <FontAwesomeIcon icon={faCompass} style={{ fontSize: '18px', marginRight: '4px' }} />
              Khám phá
              {activeSection === 'featured' && <div style={styles.underline} />}
            </div>

            {/* DARK MODE TOGGLE */}
            <div
              onClick={onToggleTheme}
              className={`theme-toggle-track ${isDark ? 'is-dark' : ''}`}
              title={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
            >
              <div className="theme-toggle-thumb">
                <span className="theme-toggle-icon">{isDark ? '🌙' : '☀️'}</span>
              </div>
            </div>

            {/* ĐĂNG NHẬP / AVATAR */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 18px 10px 10px',
                    borderRadius: 9999, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.25)',
                    transition: '0.2s',
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#10b981,#059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 900, color: 'white',
                    }}>
                      {(user.name || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 18, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name || user.email}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>▼</span>
                </div>

                {/* Dropdown */}
                {menuOpen && (
                  <>
                    <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      minWidth: 220,
                      background: isDark ? '#1e293b' : 'white',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: 20, overflow: 'hidden',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                      zIndex: 9999,
                    }}>
                      <div style={{ padding: '16px 20px', borderBottom: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: isDark ? '#f8fafc' : '#111827' }}>{user.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{user.email}</div>
                      </div>

                      <button
                        onClick={() => {
                          if (onNavigate) onNavigate('dashboard'); // Chuyển sang trang Profile
                          setMenuOpen(false); // Đóng menu
                        }}
                        style={{
                          width: '100%', padding: '14px 20px', border: 'none',
                          background: 'none', display: 'flex', alignItems: 'center', gap: 10,
                          cursor: 'pointer', fontSize: 15, fontWeight: 700, 
                          color: isDark ? '#f8fafc' : '#111827',
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <FontAwesomeIcon icon={faUser} /> Hồ sơ cá nhân
                      </button>

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%', padding: '14px 20px', border: 'none',
                          background: 'none', display: 'flex', alignItems: 'center', gap: 10,
                          cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#ef4444',
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button style={styles.loginBtn} onClick={() => openModal(true)}>
                Đăng nhập
                <FontAwesomeIcon icon={faArrowRightToBracket} />
              </button>
            )}
          </nav>
        </div>

        {/* MODAL ĐĂNG NHẬP / ĐĂNG KÝ */}
        {showAuth && (
          <div style={styles.overlay} onClick={() => setShowAuth(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setShowAuth(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>

              <h2 style={styles.title}>{isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h2>
              <p style={styles.subtitle}>{isLogin ? 'Đăng nhập để khám phá lịch trình' : 'Tham gia cộng đồng S-Trip'}</p>

              {/* Nút Google */}
              <button
                onClick={handleGoogle}
                style={{
                  width: '100%', padding: '20px', borderRadius: 25, marginBottom: 24,
                  border: isDark ? '3px solid #334155' : '3px solid #e2e8f0',
                  background: isDark ? '#1e293b' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
                  cursor: 'pointer', fontWeight: 800, fontSize: 20,
                  color: isDark ? '#f8fafc' : '#374151',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Tiếp tục với Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 2, background: isDark ? '#1e293b' : '#f1f5f9' }} />
                <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: 16 }}>hoặc</span>
                <div style={{ flex: 1, height: 2, background: isDark ? '#1e293b' : '#f1f5f9' }} />
              </div>

              {/* Tên — chỉ khi đăng ký */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
                  <input
                    type="text" placeholder="Họ và tên" style={styles.input}
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
              )}

              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
                <input
                  type="email" placeholder="Email" style={styles.input}
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}><FontAwesomeIcon icon={faLock} /></div>
                <input
                  type="password" placeholder="Mật khẩu" style={styles.input}
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {/* Error */}
              {authError && (
                <div style={{
                  padding: '14px 20px', borderRadius: 16, marginBottom: 16,
                  background: '#fef2f2', border: '2px solid #fecaca',
                  color: '#dc2626', fontSize: 18, fontWeight: 600,
                }}>
                  ⚠️ {authError}
                </div>
              )}

              <button
                style={{ ...styles.submitBtn, opacity: authLoading ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={authLoading}
              >
                {authLoading ? '⏳ Đang xử lý...' : (isLogin ? 'Đăng nhập ngay' : 'Đăng ký tài khoản')}
              </button>

              <div style={styles.switchText}>
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <span style={styles.switchLink} onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}>
                  {isLogin ? 'Đăng ký' : 'Đăng nhập'}
                </span>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;