import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEarthAmericas,
  faArrowRightToBracket,
  faXmark,
  faLock,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';

// ✅ Props mới: hasItinerary — khoá nút "Lịch trình" khi chưa tìm kiếm
const Navbar = ({ activeSection, onNavigate, onRefresh, hasItinerary }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showLockTip, setShowLockTip] = useState(false); // tooltip khi click lúc bị khoá

  const handleItineraryClick = () => {
    if (!hasItinerary) {
      // Hiện tooltip ngắn rồi tự tắt
      setShowLockTip(true);
      setTimeout(() => setShowLockTip(false), 2200);
      return;
    }
    onNavigate('itinerary-section');
  };

  const styles = {
    header: {
      height: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center',
      position: 'fixed', top: 0, width: '100%', zIndex: 1000,
      background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)',
    },
    container: {
      width: '98%', maxWidth: '1600px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center', padding: '0 40px',
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
      backgroundColor: 'white', width: '750px', maxWidth: '90%', maxHeight: '85vh',
      overflowY: 'auto', borderRadius: '50px', padding: '60px 70px',
      position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
    },
    closeBtn: {
      position: 'absolute', top: '35px', right: '40px',
      background: 'none', border: 'none', fontSize: '45px', color: '#9ca3af', cursor: 'pointer',
    },
    title: { fontSize: '50px', fontWeight: '900', color: '#111827', marginBottom: '10px', textAlign: 'center' },
    subtitle: { color: '#6b7280', fontSize: '22px', textAlign: 'center', marginBottom: '40px' },
    inputGroup: { marginBottom: '25px', position: 'relative' },
    inputIcon: { position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '26px' },
    input: { width: '100%', padding: '22px 30px 22px 80px', borderRadius: '25px', border: '3px solid #f1f5f9', fontSize: '22px', outline: 'none', boxSizing: 'border-box' },
    submitBtn: { width: '100%', backgroundColor: '#111827', color: 'white', padding: '22px', borderRadius: '25px', fontSize: '24px', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '10px' },
    switchText: { textAlign: 'center', marginTop: '30px', fontSize: '20px', color: '#4b5563' },
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
      `}</style>

      <header style={styles.header}>
        <div style={styles.container}>
          {/* LOGO */}
          <div style={styles.logo} onClick={onRefresh}>
            <div style={styles.logoIcon}><FontAwesomeIcon icon={faEarthAmericas} /></div>
            S-Trip
          </div>

          <nav style={styles.nav}>
            {/* TRANG CHỦ */}
            <div
              style={styles.link(activeSection === 'home', false)}
              onClick={() => onNavigate('hero-section')}
            >
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

            {/* ĐĂNG NHẬP */}
            <button style={styles.loginBtn} onClick={() => setShowAuth(true)}>
              Đăng nhập
              <FontAwesomeIcon icon={faArrowRightToBracket} />
            </button>
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
              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
                <input type="text" placeholder="Tên tài khoản hoặc Email" style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}><FontAwesomeIcon icon={faLock} /></div>
                <input type="password" placeholder="Mật khẩu" style={styles.input} />
              </div>
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}><FontAwesomeIcon icon={faLock} /></div>
                  <input type="password" placeholder="Xác nhận mật khẩu" style={styles.input} />
                </div>
              )}
              <button style={styles.submitBtn}>{isLogin ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}</button>
              <div style={styles.switchText}>
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <span style={styles.switchLink} onClick={() => setIsLogin(!isLogin)}>
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