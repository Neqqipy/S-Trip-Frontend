import React from 'react';

const SkeletonLoader = () => {
  // Hiệu ứng nhấp nháy chuyên nghiệp
  const pulseStyle = {
    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  };

  const keyframes = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  `;

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px' },
    header: { height: '60px', backgroundColor: '#e2e8f0', borderRadius: '15px', width: '60%', margin: '0 auto 50px', ...pulseStyle },
    card: { backgroundColor: 'white', borderRadius: '28px', padding: '30px', display: 'flex', gap: '25px', marginBottom: '20px', ...pulseStyle },
    icon: { width: '60px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '15px' },
    lineLong: { height: '20px', backgroundColor: '#f1f5f9', borderRadius: '10px', width: '80%', marginBottom: '10px' },
    lineShort: { height: '20px', backgroundColor: '#f1f5f9', borderRadius: '10px', width: '40%' },
    mapPlaceholder: { height: '400px', backgroundColor: '#e2e8f0', borderRadius: '40px', marginTop: '20px', ...pulseStyle }
  };

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      <div style={styles.header}></div>
      
      <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '25px', color: '#e2e8f0' }}>🛌 Loading...</div>
      <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '40px' }}>
        <div style={styles.card}>
          <div style={styles.icon}></div>
          <div style={{ flex: 1 }}>
            <div style={styles.lineLong}></div>
            <div style={styles.lineShort}></div>
          </div>
        </div>
        <div style={styles.mapPlaceholder}></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;