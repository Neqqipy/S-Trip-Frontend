import React from 'react';

// isDark: truyền từ component cha (true = dark mode, false = light mode)
const SkeletonLoader = ({ isDark = false }) => {
  const keyframes = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .4; }
    }

    @keyframes shimmer-light {
      0% { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }

    @keyframes shimmer-dark {
      0% { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }

    /* Từng chấm xuất hiện lần lượt */
    @keyframes dot1 {
      0%, 20%        { opacity: 0; transform: scale(0.6); }
      40%, 100%      { opacity: 1; transform: scale(1); }
    }
    @keyframes dot2 {
      0%, 40%        { opacity: 0; transform: scale(0.6); }
      60%, 100%      { opacity: 1; transform: scale(1); }
    }
    @keyframes dot3 {
      0%, 60%        { opacity: 0; transform: scale(0.6); }
      80%, 100%      { opacity: 1; transform: scale(1); }
    }
    /* Reset toàn bộ về 0 giữa chu kỳ */
    @keyframes dotsReset {
      0%, 5%         { opacity: 0; transform: scale(0.6); }
      20%, 80%       { opacity: 1; transform: scale(1); }
      95%, 100%      { opacity: 0; transform: scale(0.6); }
    }

    /* Vòng tròn xoay */
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Các chấm trên vòng tròn nhấp nháy lệch pha */
    @keyframes orbitPulse0 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.2;transform:scale(.5)} }
    @keyframes orbitPulse1 { 0%,100%{opacity:.2;transform:scale(.5)} 16%{opacity:1;transform:scale(1)} 66%,100%{opacity:.2;transform:scale(.5)} }
    @keyframes orbitPulse2 { 0%,33%{opacity:.2;transform:scale(.5)} 50%{opacity:1;transform:scale(1)} 100%{opacity:.2;transform:scale(.5)} }
    @keyframes orbitPulse3 { 0%,50%{opacity:.2;transform:scale(.5)} 66%{opacity:1;transform:scale(1)} 100%{opacity:.2;transform:scale(.5)} }
    @keyframes orbitPulse4 { 0%,66%{opacity:.2;transform:scale(.5)} 83%{opacity:1;transform:scale(1)} 100%{opacity:.2;transform:scale(.5)} }
    @keyframes orbitPulse5 { 0%,83%{opacity:.2;transform:scale(.5)} 100%{opacity:1;transform:scale(1)} }
  `;

  // ── Shimmer màu theo mode ──────────────────────────────────────────────────
  // Light: xám nhạt  (#e2e8f0 → #f1f5f9)  — tối hơn nền trắng
  // Dark : xám đậm   (#1e293b → #334155)  — sáng hơn nền #0f172a, không bị lóa
  const shimmer = isDark
    ? {
        background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
        backgroundSize: '600px 100%',
        animation: 'shimmer-dark 1.6s ease-in-out infinite',
      }
    : {
        background: 'linear-gradient(90deg, #cbd5e1 25%, #e2e8f0 50%, #cbd5e1 75%)',
        backgroundSize: '600px 100%',
        animation: 'shimmer-light 1.6s ease-in-out infinite',
      };

  // ── Màu nền theo Slate palette ─────────────────────────────────────────────
  // Slate 900 (#0f172a) → nền trang
  // Slate 800 (#1e293b) → nền card / khối
  // Slate 700 (#334155) → border / shimmer highlight
  // Slate 400 (#94a3b8) → chữ phụ
  const colors = {
    pageBg:    isDark ? '#0f172a' : 'transparent',
    areaBg:    isDark ? '#0f172a' : '#e2e8f0',
    cardBg:    isDark ? '#1e293b' : '#f8fafc',
    labelColor: isDark ? '#475569' : '#94a3b8',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px', background: colors.pageBg, transition: 'background 0.3s' }}>
      <style>{keyframes}</style>

      {/* Header skeleton */}
      <div style={{
        height: '60px', borderRadius: '15px', width: '60%',
        margin: '0 auto 50px', ...shimmer,
      }} />

      {/* ── LOADING LABEL với chấm lần lượt + vòng xoay ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '18px',
        marginBottom: '25px',
      }}>

        {/* Vòng tròn xoay với 6 chấm orbit */}
        <div style={{
          width: '48px', height: '48px',
          position: 'relative',
          animation: 'spin 1.8s linear infinite',
        }}>
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * 360;
            const rad = (angle * Math.PI) / 180;
            const r = 18;
            const x = 24 + r * Math.sin(rad);
            const y = 24 - r * Math.cos(rad);
            return (
              <div key={i} style={{
                position: 'absolute',
                width: '8px', height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                top: `${y - 4}px`,
                left: `${x - 4}px`,
                animation: `orbitPulse${i} 1.8s ease-in-out infinite`,
              }} />
            );
          })}
        </div>

        {/* Chữ Loading + 3 chấm lần lượt */}
        <div style={{
          fontSize: '32px', fontWeight: '900', color: colors.labelColor,
          display: 'flex', alignItems: 'baseline', gap: '2px',
          transition: 'color 0.3s',
        }}>
          <span>Đang tải</span>
          {[
            { anim: 'dotsReset 1.6s ease-in-out infinite 0s' },
            { anim: 'dotsReset 1.6s ease-in-out infinite 0.2s' },
            { anim: 'dotsReset 1.6s ease-in-out infinite 0.4s' },
          ].map((d, i) => (
            <span key={i} style={{
              display: 'inline-block',
              animation: d.anim,
              opacity: 0,
              fontSize: '36px',
              lineHeight: 1,
              color: '#10b981',
            }}>.</span>
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div style={{ backgroundColor: colors.areaBg, padding: '25px', borderRadius: '40px', transition: 'background 0.3s' }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            backgroundColor: colors.cardBg, borderRadius: '28px', padding: '30px',
            display: 'flex', gap: '25px', marginBottom: '20px', transition: 'background 0.3s',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '15px', flexShrink: 0, ...shimmer,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '20px', borderRadius: '10px', width: '80%', marginBottom: '12px', ...shimmer }} />
              <div style={{ height: '20px', borderRadius: '10px', width: `${45 - i * 10}%`, ...shimmer }} />
            </div>
          </div>
        ))}

        {/* Map placeholder */}
        <div style={{
          height: '400px', borderRadius: '40px', marginTop: '10px', ...shimmer,
        }} />
      </div>
    </div>
  );
};

export default SkeletonLoader;