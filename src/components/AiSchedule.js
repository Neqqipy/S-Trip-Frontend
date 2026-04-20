import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWandMagicSparkles, faHotel, faUtensils, faMapLocationDot,
  faPenToSquare, faStar, faXmark, faLocationArrow, faPlane,
  faSun, faCloudSun, faMoon
} from '@fortawesome/free-solid-svg-icons';
import { faCalendar as faRegularCalendar } from '@fortawesome/free-regular-svg-icons';

// 📦 Mock data dự phòng khi backend không trả về dữ liệu
const mockRepo = {
  'Khách sạn': [
    { name: "Colline Hotel", rating: "4.8", price: "1.200.000đ/đêm", desc: "Khách sạn 4 sao hiện đại ngay trung tâm." },
    { name: "Terracotta Resort", rating: "4.7", price: "1.500.000đ/đêm", desc: "Không gian xanh mát bên bờ hồ." }
  ],
  'Điểm tham quan': [
    { name: "Địa điểm tham quan 1", rating: "4.8", price: "150.000đ", desc: "Địa điểm nổi tiếng tại điểm đến." },
    { name: "Địa điểm tham quan 2", rating: "4.5", price: "200.000đ", desc: "Trải nghiệm độc đáo không thể bỏ qua." },
    { name: "Địa điểm tham quan 3", rating: "4.7", price: "170.000đ", desc: "Khám phá vẻ đẹp thiên nhiên." }
  ],
  'Địa điểm ăn uống': [
    { name: "Nhà hàng địa phương 1", rating: "4.6", price: "250.000đ", desc: "Đặc sản địa phương đậm đà hương vị." },
    { name: "Quán ăn ngon 2", rating: "4.7", price: "80.000đ", desc: "Món ăn truyền thống giá bình dân." },
    { name: "Quán ăn ngon 3", rating: "4.8", price: "120.000đ", desc: "Ẩm thực đặc trưng vùng miền." }
  ]
};

const normalizeActivity = (item) => ({
  name: item.name,
  rating: item.rating || "4.5",
  price: item.price || "Giá tùy chọn",
  desc: item.desc || "",
  thumbnail: item.thumbnail || null,
});

// 🎨 PlaceCard
const PlaceCard = ({ type, data, sessionLabel, locationName, setMapQuery, onEdit }) => {
  const isHotel = type === 'Khách sạn';
  const isFlight = type === 'Chuyến bay';
  const icon = isHotel ? faHotel : (isFlight ? faPlane : (type === 'Địa điểm ăn uống' ? faUtensils : faMapLocationDot));
  const mainColor = isHotel ? '#3b82f6' : (isFlight ? '#10b981' : (type === 'Điểm tham quan' ? '#8b5cf6' : '#f97316'));
  const sessionIcon = sessionLabel === 'Sáng' ? faSun : (sessionLabel === 'Chiều' ? faCloudSun : faMoon);

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '35px', padding: '35px', display: 'flex', gap: '30px',
      border: '1px solid #f1f5f9', flex: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.05)', alignItems: 'center'
    }}>
      <div style={{ width: '140px', height: '140px', flexShrink: 0, borderRadius: '25px', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {data.thumbnail ? (
          <img src={data.thumbnail} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <FontAwesomeIcon icon={sessionLabel ? sessionIcon : icon} style={{ fontSize: '40px', color: mainColor }} />
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '800', color: mainColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {sessionLabel ? `${sessionLabel} · ${type}` : type}
        </div>
        <div style={{ fontSize: '22px', fontWeight: '900', color: '#111827', margin: '8px 0' }}>{data.name || data.airline}</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: '#eab308', fontWeight: '700' }}><FontAwesomeIcon icon={faStar} /> {data.rating || 'N/A'}</span>
          <span style={{ color: '#10b981', fontWeight: '800' }}>{data.price}</span>
        </div>
        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>{data.desc}</div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
          {!isFlight && (
            <button
              onClick={() => setMapQuery(`${data.name} ${locationName}`)}
              style={{ padding: '12px 25px', borderRadius: '15px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
            >
              <FontAwesomeIcon icon={faLocationArrow} /> Vị trí
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${mainColor}`, color: mainColor, backgroundColor: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
            >
              <FontAwesomeIcon icon={faPenToSquare} /> Đổi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── COMPONENT CHÍNH ──────────────────────────────────────────
const AiSchedule = ({ data: initialData, onSave }) => {
  const numDays = parseInt(initialData?.days?.toString().split(' ')[0]) || 3;
  const [dailyPlans, setDailyPlans] = useState([]);
  const [mapQuery, setMapQuery] = useState('');
  const [modal, setModal] = useState({ show: false, type: '', day: null, session: '', subType: '' });

  const realTours = (initialData.realTours || []).map(normalizeActivity);
  const realFoods = (initialData.realFoods || []).map(normalizeActivity);
  const toursPool = realTours.length > 0 ? realTours : mockRepo['Điểm tham quan'];
  const foodsPool = realFoods.length > 0 ? realFoods : mockRepo['Địa điểm ăn uống'];

  const [currentHotel, setCurrentHotel] = useState(() => {
    if (initialData.realHotels?.length > 0) {
      const h = initialData.realHotels[0];
      return {
        name: h.name, rating: h.rating,
        price: h.price_per_night?.toLocaleString() + "đ/đêm" || "Liên hệ",
        thumbnail: h.thumbnail, desc: "Lựa chọn tốt nhất dựa trên ngân sách."
      };
    }
    return mockRepo['Khách sạn'][0];
  });

  useEffect(() => {
    const plans = [];
    for (let i = 0; i < numDays; i++) {
      plans.push({
        day: i + 1,
          morning: {
            tour: toursPool[(i * 3) % toursPool.length],
            food: foodsPool[(i * 3) % foodsPool.length]
          },
          afternoon: {
            tour: toursPool[(i * 3 + 1) % toursPool.length],
            food: foodsPool[(i * 3 + 1) % foodsPool.length]
          },
          evening: {
            tour: toursPool[(i * 3 + 2) % toursPool.length],
            food: foodsPool[(i * 3 + 2) % foodsPool.length]
        }
      });
    }
    setDailyPlans(plans);
    setMapQuery(`${currentHotel.name} ${initialData.location}`);
  }, [initialData.location, numDays]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = (newVal) => {
    if (modal.type === 'Khách sạn') {
      setCurrentHotel(newVal);
      setMapQuery(`${newVal.name} ${initialData.location}`);
    } else {
      setDailyPlans(prev => prev.map(d => d.day === modal.day 
        ? { ...d, [modal.session]: { ...d[modal.session], [modal.subType]: newVal } } 
        : d));
    }
    setModal({ show: false, type: '', day: null, session: '', subType: '' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
      {/* MODAL ĐỔI LỰA CHỌN */}
      {modal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }} onClick={() => setModal({ show: false })}>
          <div style={{ backgroundColor: 'white', borderRadius: '35px', width: '550px', padding: '35px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '900' }}>Chọn {modal.type} tại {initialData.location}</h2>
              <FontAwesomeIcon icon={faXmark} style={{ cursor: 'pointer', fontSize: '28px', color: '#9ca3af' }} onClick={() => setModal({ show: false })} />
            </div>
            {(modal.type === 'Khách sạn' ? mockRepo['Khách sạn'] : (modal.subType === 'tour' ? toursPool : foodsPool)).map((opt, i) => (
              <div key={i} onClick={() => handleUpdate(opt)} style={{ padding: '20px', borderRadius: '20px', border: '2px solid #f1f5f9', marginBottom: '10px', cursor: 'pointer' }}>
                <div style={{ fontWeight: '800' }}>{opt.name} · <span style={{ color: '#eab308' }}>{opt.rating}⭐</span></div>
                <div style={{ color: '#10b981', fontWeight: '700' }}>{opt.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '80px', fontWeight: '900' }}>
          <FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: '#10b981', marginRight: '18px' }} />
          Hành trình tại <span style={{ color: '#10b981' }}>{initialData.location}</span>
        </h1>
        <p style={{ fontSize: '28px', color: '#64748b' }}>Hành trình {numDays} ngày của bạn sẵn sàng ✨</p>
      </div>

      {/* 1. CHUYẾN BAY */}
      {initialData.realFlights?.length > 0 && (
        <div style={{ marginBottom: '55px' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>✈️ Chuyến bay đề xuất</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            {initialData.realFlights.slice(0, 2).map((f, i) => (
              <PlaceCard key={i} type="Chuyến bay" data={{
                airline: f.airline, price: f.price?.toLocaleString() + "đ",
                thumbnail: f.thumbnail, desc: `Hãng bay: ${f.airline} · Thời gian bay: ${f.total_duration} phút`
              }} />
            ))}
          </div>
        </div>
      )}

      {/* 2. KHÁCH SẠN */}
      <div style={{ marginBottom: '60px' }}>
        <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>
          🛌 Chỗ ở {initialData.realHotels?.length > 0 ? '(Dữ liệu thực)' : '(Gợi ý)'}
        </div>
        <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '40px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <PlaceCard
            type="Khách sạn" data={currentHotel} locationName={initialData.location}
            setMapQuery={setMapQuery} onEdit={() => setModal({ show: true, type: 'Khách sạn' })}
          />
          <div style={{ borderRadius: '25px', overflow: 'hidden', height: '450px', border: '1px solid #e2e8f0' }}>
            <iframe title="map" width="100%" height="100%" style={{ border: 0 }} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}></iframe>
          </div>
        </div>
      </div>

      {/* 3. LỊCH TRÌNH 3 BUỔI */}
      <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '25px' }}>🧩 Kế hoạch chi tiết theo buổi</div>
      {dailyPlans.map(d => (
        <div key={d.day} style={{ marginBottom: '45px', padding: '35px', backgroundColor: '#f8fafc', borderRadius: '40px' }}>
          <div style={{ fontWeight: '900', color: '#10b981', fontSize: '26px', marginBottom: '30px' }}>
            <FontAwesomeIcon icon={faRegularCalendar} /> Ngày {d.day}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            {/* Morning Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '800', color: '#64748b', fontSize: '14px' }}><FontAwesomeIcon icon={faSun} /> BUỔI SÁNG</div>
              <div style={{ display: 'flex', gap: '25px' }}>
                <PlaceCard type="Điểm tham quan" sessionLabel="Sáng" data={d.morning.tour} locationName={initialData.location} setMapQuery={setMapQuery} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day, session: 'morning', subType: 'tour' })} />
                <PlaceCard type="Địa điểm ăn uống" sessionLabel="Sáng" data={d.morning.food} locationName={initialData.location} setMapQuery={setMapQuery} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day, session: 'morning', subType: 'food' })} />
              </div>
            </div>

            {/* Afternoon Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '800', color: '#64748b', fontSize: '14px' }}><FontAwesomeIcon icon={faCloudSun} /> BUỔI CHIỀU</div>
              <div style={{ display: 'flex', gap: '25px' }}>
                <PlaceCard type="Điểm tham quan" sessionLabel="Chiều" data={d.afternoon.tour} locationName={initialData.location} setMapQuery={setMapQuery} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day, session: 'afternoon', subType: 'tour' })} />
                <PlaceCard type="Địa điểm ăn uống" sessionLabel="Chiều" data={d.afternoon.food} locationName={initialData.location} setMapQuery={setMapQuery} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day, session: 'afternoon', subType: 'food' })} />
              </div>
            </div>

            {/* Evening Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '800', color: '#64748b', fontSize: '14px' }}><FontAwesomeIcon icon={faMoon} /> BUỔI TỐI</div>
              <div style={{ display: 'flex', gap: '25px' }}>
                <PlaceCard type="Điểm tham quan" sessionLabel="Tối" data={d.evening.tour} locationName={initialData.location} setMapQuery={setMapQuery} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day, session: 'evening', subType: 'tour' })} />
                <PlaceCard type="Địa điểm ăn uống" sessionLabel="Tối" data={d.evening.food} locationName={initialData.location} setMapQuery={setMapQuery} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day, session: 'evening', subType: 'food' })} />
              </div>
            </div>
          </div>
        </div>
      ))}
 
      {/* NÚT LƯU */}
      <div style={{ textAlign: 'center', marginTop: '60px', paddingBottom: '40px' }}>
        <button onClick={onSave} style={{ backgroundColor: '#10b981', color: 'white', padding: '22px 65px', borderRadius: '99px', border: 'none', fontWeight: '800', fontSize: '24px', cursor: 'pointer', boxShadow: '0 12px 35px rgba(16,129,129,0.4)' }}>
          💾 Lưu lịch trình vào Dashboard
        </button>
      </div>
    </div>
  );
};

export default AiSchedule;