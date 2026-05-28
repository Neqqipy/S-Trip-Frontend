import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClock, faLocationDot, faTrash } from '@fortawesome/free-solid-svg-icons';

const Dashboard = ({ onBack }) => {
  const [savedTrips, setSavedTrips] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('s_trip_saved_trips');
    if (data) setSavedTrips(JSON.parse(data));
  }, []);

  const deleteTrip = (index) => {
    const updatedTrips = savedTrips.filter((_, i) => i !== index);
    setSavedTrips(updatedTrips);
    localStorage.setItem('s_trip_saved_trips', JSON.stringify(updatedTrips));
  };

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-profile-card {
          background: white;
          border-radius: 24px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          gap: 28px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          margin-bottom: 44px;
        }

        .dashboard-avatar {
          width: 88px; height: 88px;
          border-radius: 50%;
          background-color: #10b981;
          display: flex; justify-content: center; align-items: center;
          font-size: 36px; color: white;
          flex-shrink: 0;
        }

        .dashboard-trip-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .dashboard-trip-card {
          background: white;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          position: relative;
          border: 1px solid #f1f5f9;
        }

        .dashboard-delete-btn {
          position: absolute; top: 18px; right: 18px;
          color: #ef4444; cursor: pointer;
          border: none; background: transparent;
          font-size: 16px;
          padding: 6px; border-radius: 8px;
          min-width: 36px; min-height: 36px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .dashboard-delete-btn:hover { background: #fef2f2; }

        .dashboard-detail-btn {
          margin-top: 14px;
          padding: 10px 20px;
          border-radius: 12px;
          border: none;
          background-color: #f3f4f6;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          min-height: 40px;
          transition: background 0.2s;
        }
        .dashboard-detail-btn:hover { background: #e5e7eb; }

        /* ══════════════════════════════════════
           📱  Dashboard — Mobile responsive
        ══════════════════════════════════════ */
        @media (max-width: 768px) {
          .dashboard-container { padding: 24px 16px; }

          .dashboard-profile-card {
            padding: 20px;
            gap: 18px;
            border-radius: 18px;
            margin-bottom: 28px;
          }

          .dashboard-avatar { width: 68px; height: 68px; font-size: 28px; }

          .dashboard-profile-card h2 { font-size: 22px !important; }
          .dashboard-profile-card p  { font-size: 14px !important; }

          .dashboard-trip-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .dashboard-trip-card { padding: 18px; }
        }

        @media (max-width: 480px) {
          .dashboard-container { padding: 16px 12px; }
          .dashboard-profile-card { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* THÔNG TIN CÁ NHÂN */}
      <div className="dashboard-profile-card">
        <div className="dashboard-avatar">
          <FontAwesomeIcon icon={faUser} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '30px', color: '#111827' }}>Đào Ngọc Hưng</h2>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: '6px 0 0' }}>MSSV: 24120319 | Thành viên VIP S-Trip</p>
        </div>
      </div>

      <h3 style={{ fontSize: '24px', marginBottom: '24px', color: '#111827' }}>
        Chuyến đi của bạn ({savedTrips.length})
      </h3>

      {savedTrips.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '18px', padding: '40px 0' }}>
          Bạn chưa lưu lịch trình nào.
        </p>
      ) : (
        <div className="dashboard-trip-grid">
          {savedTrips.map((trip, index) => (
            <div key={index} className="dashboard-trip-card">
              <button className="dashboard-delete-btn" onClick={() => deleteTrip(index)} aria-label="Xóa chuyến đi">
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <h4 style={{ fontSize: '20px', color: '#10b981', marginBottom: '12px', paddingRight: '36px' }}>
                {trip.location}
              </h4>
              <p style={{ color: '#4b5563', fontSize: '15px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faClock} style={{ color: '#10b981' }} /> {trip.days}
              </p>
              <p style={{ color: '#4b5563', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faLocationDot} style={{ color: '#10b981' }} /> {trip.interest}
              </p>
              <button className="dashboard-detail-btn" onClick={() => alert('Đang mở lại lịch trình chi tiết...')}>
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