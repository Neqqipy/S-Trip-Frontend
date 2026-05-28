import React, { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────
// 🚀 SPLASH SCREEN — Màn hình chào mừng khi truy cập S-Trip
// Lấy cảm hứng từ Vietnam Airlines
// - Chỉ hiện 1 lần mỗi phiên (SessionStorage)
// - Tự biến mất sau ~3 giây hoặc bấm "Bỏ qua"
// - Hiệu ứng mượt mà: fade-in logo, slide-up slogan, progress bar
// ─────────────────────────────────────────────────────────────────

const SplashScreen = ({ onFinish }) => {
  // ── STATE ──
  const [visible, setVisible] = useState(true);   // Splash đang hiển thị
  const [fadeOut, setFadeOut] = useState(false);   // Đang trong animation biến mất
  const [progress, setProgress] = useState(0);     // Thanh progress bar (0–100)

  // ── HÀM ĐÓNG SPLASH ──
  // Khi gọi: chạy hiệu ứng fade-out 0.6s, rồi unmount hoàn toàn
  const closeSplash = useCallback(() => {
    if (fadeOut) return; // Tránh gọi nhiều lần
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 600); // Khớp với thời gian animation fade-out
  }, [fadeOut, onFinish]);

  // ── AUTO DISMISS sau 3 giây ──
  useEffect(() => {
    const timer = setTimeout(() => closeSplash(), 3000);
    return () => clearTimeout(timer);
  }, [closeSplash]);

  // ── PROGRESS BAR chạy mượt từ 0 → 100 trong 2.8 giây ──
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 1.2; // ~83 bước × 34ms ≈ 2.8s
      });
    }, 34);
    return () => clearInterval(interval);
  }, []);

  // Nếu đã đóng xong → không render gì
  if (!visible) return null;

  return (
    <div style={{
      ...styles.overlay,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>

      {/* ── INLINE CSS ANIMATIONS ── */}
      <style>{`
        /* Logo xuất hiện: zoom-in + fade-in */
        @keyframes splashLogoIn {
          0%   { opacity: 0; transform: scale(0.6) translateY(30px); }
          60%  { opacity: 1; transform: scale(1.05) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Tên thương hiệu xuất hiện: fade-in từ dưới lên */
        @keyframes splashBrandIn {
          0%   { opacity: 0; transform: translateY(20px); letter-spacing: 12px; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 6px; }
        }

        /* Slogan xuất hiện: fade-in trễ 0.5s */
        @keyframes splashSloganIn {
          0%   { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Nút Skip: fade-in nhẹ */
        @keyframes splashSkipIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }

        /* Particle bay nhẹ */
        @keyframes splashParticle {
          0%   { opacity: 0; transform: translateY(0) scale(0); }
          30%  { opacity: 0.7; transform: translateY(-30px) scale(1); }
          100% { opacity: 0; transform: translateY(-120px) scale(0.3); }
        }

        /* Vòng sáng nhẹ xung quanh logo */
        @keyframes splashGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(16,185,129,0.15), 0 0 80px rgba(16,185,129,0.05); }
          50%      { box-shadow: 0 0 60px rgba(16,185,129,0.3), 0 0 120px rgba(16,185,129,0.1); }
        }

        /* Shimmer trên progress bar */
        @keyframes splashShimmer {
          0%   { left: -40%; }
          100% { left: 140%; }
        }

        .splash-skip-btn:hover {
          background: rgba(255,255,255,0.2) !important;
          transform: scale(1.05);
        }
      `}</style>

      {/* ── NÚT BỎ QUA — góc trên phải ── */}
      <button
        className="splash-skip-btn"
        onClick={closeSplash}
        style={styles.skipBtn}
        aria-label="Bỏ qua"
      >
        Bỏ qua ›
      </button>

      {/* ── NỘI DUNG CHÍNH ── */}
      <div style={styles.content}>

        {/* Particles trang trí */}
        <div style={styles.particlesContainer}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              ...styles.particle,
              left: `${15 + i * 14}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2.5 + i * 0.3}s`,
              width: `${4 + (i % 3) * 3}px`,
              height: `${4 + (i % 3) * 3}px`,
            }} />
          ))}
        </div>

        {/* Logo */}
        <div style={styles.logoWrapper}>
          <div style={styles.logoGlow} />
          <img
            src="/S.jpg"
            alt="S-Trip Logo"
            style={styles.logo}
          />
        </div>

        {/* Tên thương hiệu */}
        <div style={styles.brandName}>
          <span style={styles.brandS}>S</span>
          <span style={styles.brandDash}>-</span>
          <span style={styles.brandTrip}>Trip</span>
        </div>

        {/* Thanh Progress Bar */}
        <div style={styles.progressContainer}>
          <div style={{
            ...styles.progressBar,
            width: `${Math.min(progress, 100)}%`,
          }}>
            {/* Shimmer effect */}
            <div style={styles.progressShimmer} />
          </div>
        </div>

        {/* Slogan */}
        <p style={styles.slogan}>
          ✈️ Trải nghiệm Việt Nam
        </p>
      </div>

      {/* Dòng copyright nhỏ ở dưới cùng */}
      <div style={styles.copyright}>
        © 2025 S-Trip · Powered by AI
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────────────────────────────
const styles = {
  // Lớp phủ toàn màn hình
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // Gradient xanh navy đậm sang trọng
    background: 'linear-gradient(160deg, #0a1628 0%, #0f2027 25%, #0b1a2e 50%, #122a3a 75%, #0a1628 100%)',
    overflow: 'hidden',
  },

  // Nút "Bỏ qua" ở góc phải trên
  skipBtn: {
    position: 'absolute',
    top: '24px',
    right: '28px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.7)',
    padding: '8px 20px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    animation: 'splashSkipIn 0.8s ease 0.5s both',
    zIndex: 10,
    letterSpacing: '0.5px',
  },

  // Khối nội dung trung tâm
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Container particles
  particlesContainer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },

  // Từng particle
  particle: {
    position: 'absolute',
    bottom: '20%',
    borderRadius: '50%',
    background: 'rgba(16,185,129,0.5)',
    animation: 'splashParticle 3s ease-in-out infinite',
  },

  // Vòng glow quanh logo
  logoWrapper: {
    position: 'relative',
    marginBottom: '28px',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    overflow: 'hidden',
  },

  logoGlow: {
    position: 'absolute',
    inset: '-20px',
    borderRadius: '50%',
    animation: 'splashGlow 2s ease-in-out infinite',
    pointerEvents: 'none',
  },

  // Logo chính
  logo: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    objectFit: 'cover',
    transform: 'scale(1.22)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.15)',
    animation: 'splashLogoIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) both',
    border: 'none',
    imageRendering: 'auto',
  },

  // Tên thương hiệu "S-Trip"
  brandName: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0',
    marginBottom: '32px',
    animation: 'splashBrandIn 0.8s ease 0.3s both',
  },

  brandS: {
    fontSize: '52px',
    fontWeight: '900',
    color: '#10b981',
    textShadow: '0 0 40px rgba(16,185,129,0.4)',
    fontFamily: "'Poppins', 'Inter', sans-serif",
  },

  brandDash: {
    fontSize: '52px',
    fontWeight: '300',
    color: 'rgba(255,255,255,0.4)',
    margin: '0 2px',
    fontFamily: "'Poppins', 'Inter', sans-serif",
  },

  brandTrip: {
    fontSize: '52px',
    fontWeight: '900',
    color: '#ffffff',
    textShadow: '0 2px 20px rgba(255,255,255,0.1)',
    fontFamily: "'Poppins', 'Inter', sans-serif",
  },

  // Thanh progress
  progressContainer: {
    width: '220px',
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '28px',
    backdropFilter: 'blur(4px)',
  },

  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
    borderRadius: '999px',
    transition: 'width 0.1s linear',
    position: 'relative',
    overflow: 'hidden',
  },

  progressShimmer: {
    position: 'absolute',
    top: 0,
    left: '-40%',
    width: '40%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    animation: 'splashShimmer 1.5s ease-in-out infinite',
  },

  // Slogan
  slogan: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    margin: 0,
    letterSpacing: '0.5px',
    animation: 'splashSloganIn 0.7s ease 0.8s both',
    textAlign: 'center',
    padding: '0 24px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  // Copyright dưới cùng
  copyright: {
    position: 'absolute',
    bottom: '28px',
    color: 'rgba(255,255,255,0.2)',
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '1px',
    animation: 'splashSloganIn 0.7s ease 1.2s both',
  },
};

export default SplashScreen;
