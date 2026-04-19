import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClock, faLocationDot, faTrash } from '@fortawesome/free-solid-svg-icons';

const Dashboard = ({ onBack }) => {
  const [savedTrips, setSavedTrips] = useState([]);

  // Lấy dữ liệu từ localStorage khi mở trang
  useEffect(() => {
    const data = localStorage.getItem('s_trip_saved_trips');
    if (data) setSavedTrips(JSON.parse(data));
  }, []);

  const deleteTrip = (index) => {
    const updatedTrips = savedTrips.filter((_, i) => i !== index);
    setSavedTrips(updatedTrips);
    localStorage.setItem('s_trip_saved_trips', JSON.stringify(updatedTrips));
  };

  const styles = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
    profileCard: { backgroundColor: 'white', borderRadius: '24px', padding: '30px', display: 'flex', alignItems: 'center', gap: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '50px' },
    avatar: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px', color: 'white' },
    tripGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' },
    tripCard: { backgroundColor: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'relative' },
    deleteBtn: { position: 'absolute', top: '20px', right: '20px', color: '#ef4444', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontSize: '18px' }
  };

  return (
    <div style={styles.container}>
      {/* THÔNG TIN CÁ NHÂN */}
      <div style={styles.profileCard}>
        <div style={styles.avatar}><FontAwesomeIcon icon={faUser} /></div>
        <div>
          <h2 style={{ margin: 0, fontSize: '32px' }}>Đào Ngọc Hưng</h2>
          <p style={{ color: '#6b7280', fontSize: '18px' }}>MSSV: 24120319 | Thành viên VIP S-Trip</p>
        </div>
      </div>

      <h3 style={{ fontSize: '28px', marginBottom: '30px' }}>Chuyến đi của bạn ({savedTrips.length})</h3>
      
      {savedTrips.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '20px' }}>Bạn chưa lưu lịch trình nào.</p>
      ) : (
        <div style={styles.tripGrid}>
          {savedTrips.map((trip, index) => (
            <div key={index} style={styles.tripCard}>
              <button style={styles.deleteBtn} onClick={() => deleteTrip(index)}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <h4 style={{ fontSize: '22px', color: '#10b981', marginBottom: '10px' }}>{trip.location}</h4>
              <p><FontAwesomeIcon icon={faClock} /> {trip.days}</p>
              <p><FontAwesomeIcon icon={faLocationDot} /> {trip.interest}</p>
              <button 
                style={{ marginTop: '15px', padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#f3f4f6', cursor: 'pointer' }}
                onClick={() => alert('Đang mở lại lịch trình chi tiết...')}>
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;