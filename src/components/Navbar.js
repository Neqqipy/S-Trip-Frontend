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
  faBars,
} from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { BASE_URL } from '../config';

const Navbar = ({ activeSection, onNavigate, onRefresh, hasItinerary, isDark, onToggleTheme, user, onUserChange }) => {
  const [showAuth,   setShowAuth]   = useState(false);
  const [isLogin,    setIsLogin]    = useState(true);
  const [showLockTip,setShowLockTip]= useState(false);

  const [username,    setUsername]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [name,        setName]        = useState('');
  const [authError,   setAuthError]   = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showForgot,     setShowForgot]     = useState(false);
  const [forgotEmail,    setForgotEmail]    = useState('');
  const [forgotLoading,  setForgotLoading]  = useState(false);
  const [forgotError,    setForgotError]    = useState('');
  const [forgotSuccess,  setForgotSuccess]  = useState(false);

  const [showVerify,    setShowVerify]    = useState(false);
  const [verifyEmail,   setVerifyEmail]   = useState('');
  const [emailSent,     setEmailSent]     = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError,   setResendError]   = useState('');

  const openModal = (loginMode = true) => {
    setIsLogin(loginMode);
    setAuthError('');
    setUsername(''); setEmail(''); setPassword(''); setConfirmPw(''); setName('');
    setShowVerify(false);
    setResendSuccess(false);
    setResendError('');
    setIsMobileMenuOpen(false);
    setShowAuth(true);
  };

  useEffect(() => {
    const handleOpenAuth = () => openModal(true);
    window.addEventListener('openAuthModal', handleOpenAuth);
    return () => window.removeEventListener('openAuthModal', handleOpenAuth);
  }, []);

  const handleSubmit = async () => {
    setAuthError('');
    if (isLogin) {
      if (!username || !password) return setAuthError('Vui lòng nhập tên đăng nhập và mật khẩu');
    } else {
      if (!name || !username || !email || !password || !confirmPw) return setAuthError('Vui lòng điền đầy đủ thông tin');
      if (password !== confirmPw) return setAuthError('Mật khẩu nhập lại không khớp');
      if (password.length < 6) return setAuthError('Mật khẩu phải ít nhất 6 ký tự');
      if (!email.includes('@')) return setAuthError('Email không hợp lệ');
    }
    setAuthLoading(true);
    const endpoint = isLogin ? `${BASE_URL}/api/auth/login` : `${BASE_URL}/api/auth/register`;
    const body = isLogin ? { username, password } : { username, email, password, name };
    try {
      const res  = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        if (data.pending_verification) {
          setShowAuth(false);
          setVerifyEmail(data.email || email);
          setEmailSent(data.email_sent !== false);
          setResendSuccess(false); setResendError('');
          setShowVerify(true);
        } else {
          onUserChange(data.user);
          setShowAuth(false);
        }
      } else {
        if (data.pending_verification) {
          setShowAuth(false);
          setVerifyEmail(data.email || '');
          setEmailSent(true); setResendSuccess(false); setResendError('');
          setShowVerify(true);
        } else {
          setAuthError(data.error || 'Có lỗi xảy ra');
        }
      }
    } catch { setAuthError('Không thể kết nối server'); }
    finally { setAuthLoading(false); }
  };

  const handleGoogle = () => { window.location.href = `${BASE_URL}/api/auth/google`; };

  const handleForgotPassword = async () => {
    setForgotError('');
    if (!forgotEmail || !forgotEmail.includes('@')) { setForgotError('Email không hợp lệ'); return; }
    setForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail }) });
      const data = await res.json();
      if (data.success) setForgotSuccess(true);
      else setForgotError(data.error || 'Có lỗi xảy ra');
    } catch { setForgotError('Không thể kết nối server'); }
    finally { setForgotLoading(false); }
  };

  const handleResendVerification = async () => {
    setResendError(''); setResendSuccess(false); setResendLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/resend-verification`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: verifyEmail }) });
      const data = await res.json();
      if (data.success) setResendSuccess(true);
      else setResendError(data.error || 'Có lỗi xảy ra');
    } catch { setResendError('Không thể kết nối server'); }
    finally { setResendLoading(false); }
  };

  const handleLogout = async () => {
    await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    localStorage.clear();
    onUserChange(null);
    setMenuOpen(false);
    window.location.href = '/';
  };

  const handleHomeClick = () => { if (onNavigate) onNavigate('hero-section'); };

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
    logoContainer: { display: 'flex', alignItems: 'center', gap: '18px', textDecoration: 'none', cursor: 'pointer' },
    logoImage: { height: '88px', width: '88px', borderRadius: '50%', objectFit: 'cover', filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.9)) brightness(1.15)' },
    brandTextContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    brandTitle: { fontSize: '38px', fontWeight: '900', color: 'white', textShadow: '0 0 4px rgba(255,255,255,0.6), 0 0 8px rgba(255,255,255,0.25)', lineHeight: '1.1' },
    brandSubtitle: { fontSize: '15px', fontWeight: '700', color: '#34d399', letterSpacing: '3px', marginTop: '10px', textShadow: '0 0 6px rgba(16, 185, 129, 0.5)' },
    brandLine: { height: '1px', width: '100%', backgroundColor: 'rgba(16, 185, 129, 0.4)', marginTop: '5px' },
    nav: { display: 'flex', gap: '45px', alignItems: 'center' },
    link: (isActive, locked) => ({
      color: locked ? 'rgba(255,255,255,0.35)' : (isActive ? '#10b981' : 'white'),
      textDecoration: 'none', fontWeight: '700', fontSize: '22px',
      cursor: locked ? 'not-allowed' : 'pointer',
      position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s',
    }),
    underline: { position: 'absolute', bottom: '-8px', left: '0', width: '100%', height: '4px', backgroundColor: '#10b981', borderRadius: '2px' },
    lockTooltip: { position: 'absolute', top: '140%', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1f2937', color: 'white', padding: '10px 20px', borderRadius: '12px', fontSize: '16px', whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', zIndex: 9999, animation: 'fadeInDown 0.2s ease', pointerEvents: 'none' },
    tooltipArrow: { position: 'absolute', top: '-7px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #1f2937' },
    loginBtn: { backgroundColor: '#10b981', color: 'white', padding: '16px 40px', borderRadius: '9999px', fontWeight: '800', fontSize: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(15px)' },
    modal: { backgroundColor: isDark ? '#0f172a' : 'white', width: '560px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '32px', padding: '44px 52px', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' },
    closeBtn: { position: 'absolute', top: '18px', right: '20px', background: 'none', border: 'none', fontSize: '32px', color: isDark ? '#64748b' : '#9ca3af', cursor: 'pointer' },
    title: { fontSize: '34px', fontWeight: '900', color: isDark ? '#ffffff' : '#111827', marginBottom: '8px', textAlign: 'center' },
    subtitle: { color: isDark ? '#94a3b8' : '#6b7280', fontSize: '16px', textAlign: 'center', marginBottom: '24px' },
    inputGroup: { marginBottom: '16px', position: 'relative' },
    inputIcon: { position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#9ca3af', fontSize: '18px' },
    input: { width: '100%', padding: '15px 18px 15px 50px', borderRadius: '16px', border: isDark ? '2px solid #1e293b' : '2px solid #f1f5f9', fontSize: '16px', outline: 'none', boxSizing: 'border-box', backgroundColor: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#ffffff' : '#111827' },
    submitBtn: { width: '100%', backgroundColor: isDark ? '#10b981' : '#111827', color: 'white', padding: '16px', borderRadius: '16px', fontSize: '17px', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '8px' },
    switchText: { textAlign: 'center', marginTop: '20px', fontSize: '15px', color: isDark ? '#94a3b8' : '#4b5563' },
    switchLink: { color: '#10b981', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline', marginLeft: '8px' },

    // 📱 HAMBURGER — hidden by default (desktop), shown via CSS on mobile
    hamburger: {
      display: 'none',                        // ✅ ẨN trên desktop
      background: 'none', border: 'none',
      color: 'white', fontSize: '28px',
      cursor: 'pointer', zIndex: 1001,
      padding: '10px', lineHeight: 1,
      minWidth: '48px', minHeight: '48px',    // touch target
      alignItems: 'center', justifyContent: 'center',
    },
    mobileMenu: {
      position: 'fixed', top: '80px', left: 0, right: 0, bottom: 'auto',
      height: 'fit-content',
      background: isDark ? '#0f172a' : 'white',
      zIndex: 999,
      maxHeight: 'calc(100vh - 80px)',
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      paddingTop: '8px', paddingBottom: '0px',
    },
    mobileMenuItem: {
      padding: '18px 24px', fontSize: '18px', fontWeight: '700',
      color: isDark ? '#e8e8e8' : '#111827', cursor: 'pointer',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
      display: 'flex', alignItems: 'center', gap: '14px',
      minHeight: '56px', transition: 'background 0.15s',
    },
    mobileMenuItemActive: { backgroundColor: isDark ? '#0f172a' : '#f0fdf4', color: '#10b981' },
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
        @keyframes mobileSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Theme Toggle ── */
        .theme-toggle-track {
          width: 68px; height: 36px;
          background-color: rgba(255,255,255,0.25);
          border-radius: 999px; cursor: pointer;
          position: relative; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.35);
          transition: background-color 0.45s ease, box-shadow 0.45s ease;
          box-shadow: inset 0 1px 4px rgba(0,0,0,0.15);
        }
        .theme-toggle-track.is-dark {
          background-color: #10b981;
          box-shadow: inset 0 1px 4px rgba(0,0,0,0.2), 0 0 12px rgba(16,185,129,0.4);
        }
        .theme-toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 26px; height: 26px;
          background-color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: left 0.45s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.3s ease;
          will-change: left;
        }
        .theme-toggle-track.is-dark .theme-toggle-thumb {
          left: 33px; box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        }
        .theme-toggle-icon {
          font-size: 16px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.2s ease;
          user-select: none;
        }
        .theme-toggle-track:active .theme-toggle-thumb { width: 30px; }
        .theme-toggle-track.is-dark:active .theme-toggle-thumb { left: 29px; }

        /* ── Dropdown user menu ── */
        .user-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          background: ${isDark ? '#1e293b' : 'white'};
          border: ${isDark ? '1px solid #334155' : '1px solid #f1f5f9'};
          border-radius: 20px; min-width: 220px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          overflow: hidden; z-index: 5000;
          animation: fadeInDown 0.18s ease;
        }

        /* ══════════════════════════════════════
           📱 MOBILE — breakpoint 768px
        ══════════════════════════════════════ */
        @media (max-width: 768px) {
          /* Header height → 72px */
          .s-navbar-header { height: 72px !important; }

          /* Container padding → 16px */
          .s-navbar-container { padding: 0 16px !important; }

          /* Logo image → 52px */
          .s-navbar-logo-img { width: 52px !important; height: 52px !important; }

          /* Brand title → 22px */
          .s-navbar-brand-title { font-size: 22px !important; }

          /* Brand subtitle & line → hide */
          .s-navbar-brand-subtitle,
          .s-navbar-brand-line { display: none !important; }

          /* Desktop nav → hide */
          .navbar-desktop { display: none !important; }

          /* Hamburger → show as flex */
          .navbar-hamburger { display: flex !important; }

          /* Mobile auth (avatar/login) → show as flex, at far right */
          .navbar-mobile-auth { display: flex !important; order: 2; margin-left: 10px; }
          .navbar-mobile-toggle { display: flex !important; order: 1; margin-left: auto; }
          .navbar-mobile-toggle .theme-toggle-track { width: 48px !important; height: 28px !important; }
          .navbar-mobile-toggle .theme-toggle-thumb { width: 20px !important; height: 20px !important; top: 2px !important; left: 2px !important; }
          .navbar-mobile-toggle .theme-toggle-track.is-dark .theme-toggle-thumb { left: 24px !important; }
          .navbar-mobile-toggle .theme-toggle-icon { font-size: 12px !important; }
          .s-navbar-logo { order: 0; }
          .navbar-hamburger { order: 3; margin-left: 10px; }

          /* Mobile menu slide animation */
          .s-mobile-menu { animation: mobileSlideDown 0.22s ease; top: 72px !important; max-height: calc(100vh - 72px) !important; }

          /* Modal → nearly full-width */
          .s-auth-modal {
            width: calc(100vw - 32px) !important;
            max-width: 100% !important;
            padding: 28px 20px !important;
            border-radius: 24px !important;
          }

          /* Modal title */
          .s-auth-modal h2 { font-size: 24px !important; }

          /* Inputs */
          .s-auth-modal input { font-size: 16px !important; }
        }

        @media (max-width: 480px) {
          .s-navbar-header { height: 64px !important; }
          .s-navbar-logo-img { width: 44px !important; height: 44px !important; }
          .s-navbar-brand-title { font-size: 18px !important; }
          .s-mobile-menu { top: 64px !important; max-height: calc(100vh - 64px) !important; }
          .s-auth-modal {
            width: calc(100vw - 16px) !important;
            padding: 20px 14px !important;
          }
        }
      `}</style>

      <header style={styles.header} className="s-navbar-header">
        <div style={styles.container} className="s-navbar-container">

          {/* LOGO */}
          <div style={styles.logoContainer} className="s-navbar-logo" onClick={onRefresh}>
            <img src='/S.jpg' alt="S-Trip Logo" style={styles.logoImage} className="s-navbar-logo-img" />
            <div style={styles.brandTextContainer}>
              <span style={styles.brandTitle} className="s-navbar-brand-title">S-Trip</span>
              <span style={styles.brandSubtitle} className="s-navbar-brand-subtitle">KHÁM PHÁ VIỆT NAM</span>
              <div style={styles.brandLine} className="s-navbar-brand-line" />
            </div>
          </div>

          {/* 📱 MOBILE TOGGLE — shown only on mobile, order 1 */}
          <div className="navbar-mobile-toggle" style={{ display: 'none', alignItems: 'center' }}
            onClick={onToggleTheme}>
            <div className={`theme-toggle-track ${isDark ? 'is-dark' : ''}`}>
              <div className="theme-toggle-thumb">
                <span className="theme-toggle-icon">{isDark ? '🌙' : '☀️'}</span>
              </div>
            </div>
          </div>

          {/* 📱 MOBILE AUTH — avatar or login button, order 2 */}
          <div className="navbar-mobile-auth" style={{ display: 'none', alignItems: 'center' }}>
            {user ? (
              <div
                onClick={() => { setMenuOpen(!menuOpen); setIsMobileMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
              >
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 2px rgba(16,185,129,0.7)' }} />
                  : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'white' }}>
                      {(user.name || user.email || '?')[0].toUpperCase()}
                    </div>
                }
                {menuOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 4999 }} onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
                    <div className="user-dropdown" style={{ top: 'calc(100% + 8px)', right: 0, position: 'absolute' }}>
                      <div style={{ padding: '16px 20px', borderBottom: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: isDark ? '#f8fafc' : '#111827' }}>{user.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{user.email}</div>
                      </div>
                      <button onClick={() => { if (onNavigate) onNavigate('dashboard'); setMenuOpen(false); }}
                        style={{ width: '100%', padding: '14px 20px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: isDark ? '#f8fafc' : '#111827', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <FontAwesomeIcon icon={faUser} /> Hồ sơ cá nhân
                      </button>
                      <button onClick={handleLogout}
                        style={{ width: '100%', padding: '14px 20px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#ef4444', textAlign: 'left' }}
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
              <button
                style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', borderRadius: 9999, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => openModal(true)}
              >
                Đăng nhập <FontAwesomeIcon icon={faArrowRightToBracket} />
              </button>
            )}
          </div>

          {/* 🍔 HAMBURGER — always in DOM, shown only on mobile via CSS */}
          <button
            style={styles.hamburger}
            onClick={() => { setIsMobileMenuOpen(v => !v); setMenuOpen(false); }}
            className="navbar-hamburger"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen
              ? <FontAwesomeIcon icon={faXmark} />
              : <FontAwesomeIcon icon={faBars} />
            }
          </button>

          {/* DESKTOP NAV */}
          <nav style={styles.nav} className="navbar-desktop">
            <div style={styles.link(activeSection === 'home', false)} onClick={handleHomeClick}>
              <FontAwesomeIcon icon={faHouse} style={{ fontSize: '18px', marginRight: '8px' }} />
              Trang chủ
              {activeSection === 'home' && <div style={styles.underline} />}
            </div>

            <div style={{ position: 'relative' }}>
              <div style={styles.link(isScheduleActive, isItineraryLocked)} onClick={handleItineraryClick}>
                {isItineraryLocked && <FontAwesomeIcon icon={faLock} style={{ fontSize: '18px' }} />}
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

            <div style={styles.link(activeSection === 'featured', false)} onClick={() => onNavigate('featured-section')}>
              <FontAwesomeIcon icon={faCompass} style={{ fontSize: '18px', marginRight: '4px' }} />
              Khám phá
              {activeSection === 'featured' && <div style={styles.underline} />}
            </div>

            <div onClick={onToggleTheme} className={`theme-toggle-track ${isDark ? 'is-dark' : ''}`} title={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}>
              <div className="theme-toggle-thumb">
                <span className="theme-toggle-icon">{isDark ? '🌙' : '☀️'}</span>
              </div>
            </div>

            {user ? (
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => { setMenuOpen(!menuOpen); setIsMobileMenuOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px 10px 10px', borderRadius: 9999, cursor: 'pointer', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)', transition: '0.2s' }}
                >
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 2px rgba(16,185,129,0.6)' }} />
                    : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: 'white' }}>
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </div>
                  }
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 18, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name || user.email}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>▼</span>
                </div>

                {menuOpen && (
                  <>
                    {/* Overlay to close dropdown */}
                    <div style={{ position: 'fixed', inset: 0, zIndex: 4999 }} onClick={() => setMenuOpen(false)} />
                    <div className="user-dropdown">
                      <div style={{ padding: '16px 20px', borderBottom: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: isDark ? '#f8fafc' : '#111827' }}>{user.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{user.email}</div>
                      </div>
                      <button onClick={() => { if (onNavigate) onNavigate('dashboard'); setMenuOpen(false); }}
                        style={{ width: '100%', padding: '14px 20px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: isDark ? '#f8fafc' : '#111827', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <FontAwesomeIcon icon={faUser} /> Hồ sơ cá nhân
                      </button>
                      <button onClick={handleLogout}
                        style={{ width: '100%', padding: '14px 20px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#ef4444', textAlign: 'left' }}
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
      </header>

      {/* 📱 MOBILE MENU — full-height slide-down panel */}
        {isMobileMenuOpen && (
          <div style={styles.mobileMenu} className="s-mobile-menu">

            {/* Trang chủ */}
            <div style={{ ...styles.mobileMenuItem, ...(activeSection === 'home' ? styles.mobileMenuItemActive : {}) }}
              onClick={() => { handleHomeClick(); setIsMobileMenuOpen(false); }}>
              <FontAwesomeIcon icon={faHouse} /> Trang chủ
            </div>

            {/* Lịch trình */}
            <div style={{ ...styles.mobileMenuItem, ...(isScheduleActive ? styles.mobileMenuItemActive : {}), ...(isItineraryLocked ? { color: 'rgba(128,128,128,0.6)' } : {}) }}
              onClick={() => { handleItineraryClick(); if (!isItineraryLocked) setIsMobileMenuOpen(false); }}>
              <FontAwesomeIcon icon={isItineraryLocked ? faLock : faCalendarDays} />
              Lịch trình {isItineraryLocked && <span style={{ fontSize: '13px', fontWeight: '600' }}>(Tìm kiếm trước)</span>}
            </div>

            {/* Khám phá */}
            <div style={{ ...styles.mobileMenuItem, ...(activeSection === 'featured' ? styles.mobileMenuItemActive : {}) }}
              onClick={() => { onNavigate('featured-section'); setIsMobileMenuOpen(false); }}>
              <FontAwesomeIcon icon={faCompass} /> Khám phá
            </div>

            {/* User section */}
            {user ? (
              <>
                <div style={{ ...styles.mobileMenuItem, borderBottom: 'none' }} onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                  <FontAwesomeIcon icon={faSignOutAlt} style={{ color: '#ef4444' }} />
                  <span style={{ color: '#ef4444' }}>Đăng xuất</span>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* MODAL ĐĂNG NHẬP / ĐĂNG KÝ */}
        {showAuth && (
          <div style={styles.overlay} onClick={() => setShowAuth(false)}>
            <div style={styles.modal} className="s-auth-modal" onClick={(e) => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setShowAuth(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <h2 style={styles.title}>{isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h2>
              <p style={styles.subtitle}>{isLogin ? 'Đăng nhập để khám phá lịch trình' : 'Tham gia cộng đồng S-Trip'}</p>

              {!isLogin && (
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
                  <input type="text" placeholder="Tên hiển thị" style={styles.input} autoComplete="name" value={name} onChange={e => setName(e.target.value)} />
                </div>
              )}

              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
                <input type="text" placeholder="Tên đăng nhập" style={styles.input} autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} />
              </div>

              {!isLogin && (
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
                  <input type="email" placeholder="Email" style={styles.input} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              )}

              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}><FontAwesomeIcon icon={faLock} /></div>
                <input type="password" placeholder="Mật khẩu" style={styles.input} autoComplete={isLogin ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && !confirmPw && handleSubmit()} />
              </div>

              {!isLogin && (
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}><FontAwesomeIcon icon={faLock} /></div>
                  <input type="password" placeholder="Nhập lại mật khẩu" style={styles.input} autoComplete="new-password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                </div>
              )}

              {authError && (
                <div style={{ padding: '14px 20px', borderRadius: 16, marginBottom: 16, background: '#fef2f2', border: '2px solid #fecaca', color: '#dc2626', fontSize: 15, fontWeight: 600 }}>
                  ⚠️ {authError}
                </div>
              )}

              <button style={{ ...styles.submitBtn, opacity: authLoading ? 0.7 : 1 }} onClick={handleSubmit} disabled={authLoading}>
                {authLoading ? '⏳ Đang xử lý...' : (isLogin ? 'Đăng nhập ngay' : 'Đăng ký tài khoản')}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: isDark ? '#334155' : '#e5e7eb' }} />
                <span style={{ color: isDark ? '#64748b' : '#9ca3af', fontSize: 13, fontWeight: 600 }}>hoặc</span>
                <div style={{ flex: 1, height: 1, background: isDark ? '#334155' : '#e5e7eb' }} />
              </div>

              <button onClick={handleGoogle}
                style={{ width: '100%', padding: '14px', borderRadius: 16, border: isDark ? '2px solid #334155' : '2px solid #e5e7eb', background: isDark ? '#1e293b' : 'white', color: isDark ? '#f8fafc' : '#111827', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = isDark ? '#1e293b' : 'white'}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 22, height: 22 }} />
                Tiếp tục với Google
              </button>

              <div style={styles.switchText}>
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <span style={styles.switchLink} onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}>{isLogin ? 'Đăng ký' : 'Đăng nhập'}</span>
                {isLogin && (
                  <span style={{ ...styles.switchLink, marginLeft: 16 }}
                    onClick={() => { setShowAuth(false); setShowForgot(true); setForgotEmail(email); setForgotError(''); setForgotSuccess(false); }}>
                    Quên mật khẩu?
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

      {/* MODAL QUÊN MẬT KHẨU */}
      {showForgot && (
        <div style={styles.overlay} onClick={() => setShowForgot(false)}>
          <div style={styles.modal} className="s-auth-modal" onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowForgot(false)}>✕</button>
            {forgotSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 60, marginBottom: 20 }}>📧</div>
                <h2 style={{ ...styles.title, fontSize: 28 }}>Kiểm tra email!</h2>
                <p style={{ ...styles.subtitle, fontSize: 15 }}>
                  Chúng tôi đã gửi link đặt lại mật khẩu đến<br/>
                  <strong style={{ color: '#10b981' }}>{forgotEmail}</strong><br/>
                  Link có hiệu lực trong <strong>15 phút</strong>.
                </p>
                <button style={{ ...styles.submitBtn, marginTop: 24 }} onClick={() => { setShowForgot(false); setShowAuth(true); setIsLogin(true); }}>
                  Quay lại đăng nhập
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ ...styles.title, fontSize: 22 }}>Đặt lại mật khẩu</h2>
                <p style={{ ...styles.subtitle, fontSize: 13 }}>Nhập email đăng ký, chúng tôi sẽ gửi link đặt lại</p>
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}>✉️</div>
                  <input type="email" placeholder="Email đăng ký" style={styles.input} value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} />
                </div>
                {forgotError && <div style={{ padding: '10px 14px', borderRadius: 12, marginBottom: 12, background: '#fef2f2', border: '2px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>⚠️ {forgotError}</div>}
                <button style={{ ...styles.submitBtn, opacity: forgotLoading ? 0.7 : 1 }} onClick={handleForgotPassword} disabled={forgotLoading}>
                  {forgotLoading ? '⏳ Đang gửi...' : 'Gửi link đặt lại'}
                </button>
                <div style={styles.switchText}>
                  Nhớ mật khẩu rồi?
                  <span style={styles.switchLink} onClick={() => { setShowForgot(false); setShowAuth(true); setIsLogin(true); }}>Đăng nhập</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN EMAIL */}
      {showVerify && (
        <div style={styles.overlay} onClick={() => setShowVerify(false)}>
          <div style={styles.modal} className="s-auth-modal" onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowVerify(false)}>✕</button>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
              <h2 style={{ ...styles.title, fontSize: 24 }}>Xác nhận email</h2>
              <p style={{ ...styles.subtitle, fontSize: 14, lineHeight: 1.6 }}>
                Chúng tôi đã gửi link xác nhận đến<br/>
                <strong style={{ color: '#10b981' }}>{verifyEmail}</strong><br/>
                Kiểm tra hộp thư (kể cả <strong>Spam</strong>), bấm link để kích hoạt —
                bạn sẽ được <strong>đăng nhập tự động</strong>.
              </p>
              {!emailSent && <div style={{ padding: '12px 16px', borderRadius: 14, marginBottom: 16, background: '#fffbeb', border: '2px solid #fcd34d', color: '#92400e', fontSize: 13, fontWeight: 600, textAlign: 'left' }}>⚠️ Có lỗi khi gửi email. Hãy dùng nút bên dưới để gửi lại.</div>}
              {resendSuccess && <div style={{ padding: '12px 16px', borderRadius: 14, marginBottom: 16, background: '#f0fdf4', border: '2px solid #86efac', color: '#15803d', fontSize: 13, fontWeight: 600 }}>✅ Đã gửi lại email xác nhận!</div>}
              {resendError && <div style={{ padding: '12px 16px', borderRadius: 14, marginBottom: 16, background: '#fef2f2', border: '2px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>⚠️ {resendError}</div>}
              <button style={{ ...styles.submitBtn, opacity: resendLoading ? 0.7 : 1, marginBottom: 12 }} onClick={handleResendVerification} disabled={resendLoading}>
                {resendLoading ? '⏳ Đang gửi...' : '🔄 Gửi lại email xác nhận'}
              </button>
              <div style={styles.switchText}>
                Đã xác nhận?{' '}
                <span style={styles.switchLink} onClick={() => { setShowVerify(false); openModal(true); }}>Đăng nhập ngay</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;