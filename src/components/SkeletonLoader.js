import React from 'react';

const SkeletonLoader = () => {
  const keyframes = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .4; }
    }

    @keyframes shimmer {
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

    .skeleton-shimmer {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 600px 100%;
      animation: shimmer 1.6s ease-in-out infinite;
    }
  `;

  const shimmer = {
    background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '600px 100%',
    animation: 'shimmer 1.6s ease-in-out infinite',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
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
            const r = 18; // bán kính orbit
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
          fontSize: '32px', fontWeight: '900', color: '#94a3b8',
          display: 'flex', alignItems: 'baseline', gap: '2px',
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
      <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '40px' }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            backgroundColor: 'white', borderRadius: '28px', padding: '30px',
            display: 'flex', gap: '25px', marginBottom: '20px',
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