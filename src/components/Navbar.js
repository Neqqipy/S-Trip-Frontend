import React, { useState } from 'react';
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

const BASE_URL = ''; // proxy qua React dev server

// ✅ Nhận thêm props: user, onUserChange (quản lý user ở App.js, không tự quản lý nữa)
const Navbar = ({ activeSection, onNavigate, onRefresh, hasItinerary, isDark, onToggleTheme, user, onUserChange }) => {
  const [showAuth,   setShowAuth]   = useState(false);
  const [isLogin,    setIsLogin]    = useState(true);
  const [showLockTip,setShowLockTip]= useState(false);

  // ── Auth state ──
  const [username,    setUsername]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [name,        setName]        = useState('');
  const [authError,   setAuthError]   = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

  // ── Forgot password state ──
  const [showForgot,     setShowForgot]     = useState(false);
  const [forgotEmail,    setForgotEmail]    = useState('');
  const [forgotLoading,  setForgotLoading]  = useState(false);
  const [forgotError,    setForgotError]    = useState('');
  const [forgotSuccess,  setForgotSuccess]  = useState(false);

  // ── Verify email state ──
  const [showVerify,        setShowVerify]        = useState(false);
  const [verifyEmail,       setVerifyEmail]       = useState('');
  const [emailSent,         setEmailSent]         = useState(true);  // false = backend báo gửi mail lỗi
  const [resendLoading,     setResendLoading]     = useState(false);
  const [resendSuccess,     setResendSuccess]     = useState(false);
  const [resendError,       setResendError]       = useState('');

  // ✅ Bỏ useEffect fetch /api/auth/me — đã chuyển lên App.js
  // ✅ Bỏ xử lý Google OAuth redirect — đã chuyển lên App.js

  const openModal = (loginMode = true) => {
    setIsLogin(loginMode);
    setAuthError('');
    setUsername(''); setEmail(''); setPassword(''); setConfirmPw(''); setName('');
    // Reset verify state phòng trường hợp user đóng modal verify rồi mở lại auth
    setShowVerify(false);
    setResendSuccess(false);
    setResendError('');
    setShowAuth(true);
  };

  const handleSubmit = async () => {
    setAuthError(''); 

    // Validate phía client
    if (isLogin) {
      if (!username || !password)
        return setAuthError('Vui lòng nhập tên đăng nhập và mật khẩu');
    } else {
      if (!name || !username || !email || !password || !confirmPw)
        return setAuthError('Vui lòng điền đầy đủ thông tin');
      if (password !== confirmPw)
        return setAuthError('Mật khẩu nhập lại không khớp');
      if (password.length < 6)
        return setAuthError('Mật khẩu phải ít nhất 6 ký tự');
      if (!email.includes('@'))
        return setAuthError('Email không hợp lệ');
    }

    setAuthLoading(true);
    const endpoint = isLogin ? `${BASE_URL}/api/auth/login` : `${BASE_URL}/api/auth/register`;
    const body = isLogin
      ? { username, password }
      : { username, email, password, name };
    try {
      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        if (data.pending_verification) {
          // Đăng ký thành công — yêu cầu xác nhận email
          setShowAuth(false);
          setVerifyEmail(data.email || email);
          setEmailSent(data.email_sent !== false); // false chỉ khi backend báo rõ lỗi gửi mail
          setResendSuccess(false);
          setResendError('');
          setShowVerify(true);
        } else {
          onUserChange(data.user);
          setShowAuth(false);
        }
      } else {
        if (data.pending_verification) {
          // Login bị chặn vì chưa xác nhận email
          setShowAuth(false);
          setVerifyEmail(data.email || '');
          setEmailSent(true);
          setResendSuccess(false);
          setResendError('');
          setShowVerify(true);
        } else {
          setAuthError(data.error || 'Có lỗi xảy ra');
        }
      }
    } catch {
      setAuthError('Không thể kết nối server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogle = () => {
    // PHẢI redirect thẳng tới Flask backend (không qua proxy)
    // vì Google sẽ callback về Flask set cookie ở domain/port của Flask
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleForgotPassword = async () => {
    setForgotError('');
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Email không hợp lệ');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotSuccess(true);
      } else {
        setForgotError(data.error || 'Có lỗi xảy ra');
      }
    } catch {
      setForgotError('Không thể kết nối server');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendError('');
    setResendSuccess(false);
    setResendLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setResendSuccess(true);
      } else {
        setResendError(data.error || 'Có lỗi xảy ra');
      }
    } catch {
      setResendError('Không thể kết nối server');
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = async () => {
  // 1. Gọi API đăng xuất như cũ
  await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });

  // 2. 🔥 DỌN SẠCH TOÀN BỘ LOCAL STORAGE thay vì nhặt từng món
  localStorage.clear(); 

  // 3. Reset state của User và Menu
  onUserChange(null); 
  setMenuOpen(false);

  // 4. 🔥 CHỐT HẠ: Đá người dùng về trang chủ (hoặc trang /login)
  // Lệnh này sẽ ép trình duyệt tải lại toàn bộ trang web, quét sạch mọi dữ liệu thừa đang kẹt trong React!
  window.location.href = '/'; 
};

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
      gap: '18px',
      textDecoration: 'none', 
      cursor: 'pointer',
    },
    logoImage: {
      height: '88px', 
      width: '88px',
      borderRadius: '50%',
      objectFit: 'cover',
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
      textShadow: '0 0 4px rgba(255,255,255,0.6), 0 0 8px rgba(255,255,255,0.25)',
      lineHeight: '1.1',
    },
    brandSubtitle: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#34d399',
      letterSpacing: '3px',
      marginTop: '10px',
      textShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
    },
    brandLine: {
      height: '1px',
      width: '100%',
      backgroundColor: 'rgba(16, 185, 129, 0.4)',
      marginTop: '5px',
    },
    nav: { display: 'flex', gap: '45px', alignItems: 'center' },

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
      backgroundColor: isDark ? '#0f172a' : 'white', width: '560px', maxWidth: '92%',
      maxHeight: '90vh', overflowY: 'auto',
      borderRadius: '32px', padding: '44px 52px',
      position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
    },
    closeBtn: {
      position: 'absolute', top: '18px', right: '20px',
      background: 'none', border: 'none', fontSize: '32px', color: isDark ? '#64748b' : '#9ca3af', cursor: 'pointer',
    },
    title: { fontSize: '34px', fontWeight: '900', color: isDark ? '#ffffff' : '#111827', marginBottom: '8px', textAlign: 'center' },
    subtitle: { color: isDark ? '#94a3b8' : '#6b7280', fontSize: '16px', textAlign: 'center', marginBottom: '24px' },
    inputGroup: { marginBottom: '16px', position: 'relative' },
    inputIcon: { position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#9ca3af', fontSize: '18px' },
    input: { width: '100%', padding: '15px 18px 15px 50px', borderRadius: '16px', border: isDark ? '2px solid #1e293b' : '2px solid #f1f5f9', fontSize: '16px', outline: 'none', boxSizing: 'border-box', backgroundColor: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#ffffff' : '#111827' },
    submitBtn: { width: '100%', backgroundColor: isDark ? '#10b981' : '#111827', color: 'white', padding: '16px', borderRadius: '16px', fontSize: '17px', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '8px' },
    switchText: { textAlign: 'center', marginTop: '20px', fontSize: '15px', color: isDark ? '#94a3b8' : '#4b5563' },
    switchLink: { color: '#10b981', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline', marginLeft: '8px' },
  };

  const isScheduleActive = activeSection === 'schedule';
  const isItineraryLocked = !hasItinerary;

  return (
    <>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -6px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

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
              src='/S.jpg'
              alt="S-Trip Logo" 
              style={styles.logoImage} 
            />
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

            {/* LỊCH TRÌNH */}
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
                  {/* ✅ Avatar tự cập nhật khi user state thay đổi từ ProfilePage */}
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
                        imageRendering: 'high-quality',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                        boxShadow: '0 0 0 2px rgba(16,185,129,0.6)',
                      }} />
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
                          if (onNavigate) onNavigate('dashboard');
                          setMenuOpen(false);
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

              {/* Tên hiển thị — chỉ khi đăng ký */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
                  <input
                    type="text" placeholder="Tên hiển thị" style={styles.input}
                    autoComplete="name"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
              )}

              {/* Tên đăng nhập */}
              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
                <input
                  type="text" placeholder="Tên đăng nhập" style={styles.input}
                  autoComplete="username"
                  value={username} onChange={e => setUsername(e.target.value)}
                />
              </div>

              {/* Email — chỉ khi đăng ký */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
                  <input
                    type="email" placeholder="Email" style={styles.input}
                    autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
              )}

              {/* Mật khẩu */}
              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}><FontAwesomeIcon icon={faLock} /></div>
                <input
                  type="password" placeholder="Mật khẩu" style={styles.input}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !confirmPw && handleSubmit()}
                />
              </div>

              {/* Nhập lại mật khẩu — chỉ khi đăng ký */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}><FontAwesomeIcon icon={faLock} /></div>
                  <input
                    type="password" placeholder="Nhập lại mật khẩu" style={styles.input}
                    autoComplete="new-password"
                    value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
              )}

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

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: isDark ? '#334155' : '#e5e7eb' }} />
                <span style={{ color: isDark ? '#64748b' : '#9ca3af', fontSize: 13, fontWeight: 600 }}>hoặc</span>
                <div style={{ flex: 1, height: 1, background: isDark ? '#334155' : '#e5e7eb' }} />
              </div>

              {/* Nút Google */}
              <button
                onClick={handleGoogle}
                style={{
                  width: '100%', padding: '14px', borderRadius: 16,
                  border: isDark ? '2px solid #334155' : '2px solid #e5e7eb',
                  background: isDark ? '#1e293b' : 'white',
                  color: isDark ? '#f8fafc' : '#111827',
                  fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  marginBottom: 8, transition: '0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = isDark ? '#1e293b' : 'white'}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google" style={{ width: 22, height: 22 }}
                />
                Tiếp tục với Google
              </button>

              <div style={styles.switchText}>
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <span style={styles.switchLink} onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}>
                  {isLogin ? 'Đăng ký' : 'Đăng nhập'}
                </span>
                {isLogin && (
                  <span
                    style={{ ...styles.switchLink, marginLeft: 16 }}
                    onClick={() => { setShowAuth(false); setShowForgot(true); setForgotEmail(email); setForgotError(''); setForgotSuccess(false); }}
                  >
                    Quên mật khẩu?
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

        {/* MODAL QUÊN MẬT KHẨU */}
        {showForgot && (
          <div style={styles.overlay} onClick={() => setShowForgot(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setShowForgot(false)}>✕</button>

              {forgotSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 60, marginBottom: 20 }}>📧</div>
                  <h2 style={{ ...styles.title, fontSize: 36 }}>Kiểm tra email!</h2>
                  <p style={{ ...styles.subtitle, fontSize: 18 }}>
                    Chúng tôi đã gửi link đặt lại mật khẩu đến<br/>
                    <strong style={{ color: '#10b981' }}>{forgotEmail}</strong><br/>
                    Link có hiệu lực trong <strong>15 phút</strong>.
                  </p>
                  <button
                    style={{ ...styles.submitBtn, marginTop: 30 }}
                    onClick={() => { setShowForgot(false); setShowAuth(true); setIsLogin(true); }}
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ ...styles.title, fontSize: 22 }}>Đặt lại mật khẩu</h2>
                  <p style={{ ...styles.subtitle, fontSize: 13 }}>Nhập email đăng ký, chúng tôi sẽ gửi link đặt lại</p>

                  <div style={styles.inputGroup}>
                    <div style={styles.inputIcon}>✉️</div>
                    <input
                      type="email" placeholder="Email đăng ký" style={styles.input}
                      value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                    />
                  </div>

                  {forgotError && (
                    <div style={{ padding: '10px 14px', borderRadius: 12, marginBottom: 12, background: '#fef2f2', border: '2px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
                      ⚠️ {forgotError}
                    </div>
                  )}

                  <button
                    style={{ ...styles.submitBtn, opacity: forgotLoading ? 0.7 : 1 }}
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? '⏳ Đang gửi...' : 'Gửi link đặt lại'}
                  </button>

                  <div style={styles.switchText}>
                    Nhớ mật khẩu rồi?
                    <span style={styles.switchLink} onClick={() => { setShowForgot(false); setShowAuth(true); setIsLogin(true); }}>
                      Đăng nhập
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN EMAIL */}
        {showVerify && (
          <div style={styles.overlay} onClick={() => setShowVerify(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setShowVerify(false)}>✕</button>

              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📬</div>
                <h2 style={{ ...styles.title, fontSize: 28 }}>Xác nhận email</h2>
                <p style={{ ...styles.subtitle, fontSize: 15, lineHeight: 1.6 }}>
                  Chúng tôi đã gửi link xác nhận đến<br/>
                  <strong style={{ color: '#10b981' }}>{verifyEmail}</strong><br/>
                  Kiểm tra hộp thư (kể cả thư mục <strong>Spam</strong>), bấm link trong email để kích hoạt —
                  bạn sẽ được <strong>đăng nhập tự động</strong>, không cần nhập lại mật khẩu.
                </p>

                {!emailSent && (
                  <div style={{ padding: '12px 16px', borderRadius: 14, marginBottom: 16, background: '#fffbeb', border: '2px solid #fcd34d', color: '#92400e', fontSize: 14, fontWeight: 600, textAlign: 'left' }}>
                    ⚠️ Có lỗi khi gửi email xác nhận. Hãy dùng nút bên dưới để gửi lại.
                  </div>
                )}

                {resendSuccess && (
                  <div style={{ padding: '12px 16px', borderRadius: 14, marginBottom: 16, background: '#f0fdf4', border: '2px solid #86efac', color: '#15803d', fontSize: 14, fontWeight: 600 }}>
                    ✅ Đã gửi lại email xác nhận!
                  </div>
                )}
                {resendError && (
                  <div style={{ padding: '12px 16px', borderRadius: 14, marginBottom: 16, background: '#fef2f2', border: '2px solid #fecaca', color: '#dc2626', fontSize: 14, fontWeight: 600 }}>
                    ⚠️ {resendError}
                  </div>
                )}

                <button
                  style={{ ...styles.submitBtn, opacity: resendLoading ? 0.7 : 1, marginBottom: 12 }}
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                >
                  {resendLoading ? '⏳ Đang gửi...' : '🔄 Gửi lại email xác nhận'}
                </button>

                <div style={styles.switchText}>
                  Đã xác nhận?{' '}
                  <span style={styles.switchLink} onClick={() => { setShowVerify(false); openModal(true); }}>
                    Đăng nhập ngay
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default Navbar;