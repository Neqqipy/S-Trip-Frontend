import React from 'react';

const NotFound = ({ onBackHome }) => {
  const styles = {
    container: { textAlign: 'center', padding: '100px 20px', backgroundColor: '#f9fafb', minHeight: '60vh' },
    errorCode: { fontSize: '150px', fontWeight: '900', color: '#10b981', margin: 0, lineHeight: 1 },
    title: { fontSize: '32px', fontWeight: '800', color: '#1f2937', marginTop: '20px' },
    desc: { color: '#6b7280', fontSize: '18px', marginBottom: '40px' },
    btn: { backgroundColor: '#10b981', color: 'white', padding: '15px 40px', borderRadius: '9999px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '18px' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.errorCode}>404</h1>
      <h2 style={styles.title}>Ối! Bạn bị lạc đường rồi</h2>
      <p style={styles.desc}>Địa điểm này không nằm trong bản đồ của S-Trip. Hãy quay lại trang chủ nhé!</p>
      <button style={styles.btn} onClick={onBackHome}>Quay về Trang chủ</button>
    </div>
  );
};

export default NotFound;