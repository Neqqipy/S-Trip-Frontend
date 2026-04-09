import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWandMagicSparkles, faHotel, faUtensils, 
  faMapLocationDot, faPenToSquare, faStar, faXmark, faLocationArrow
} from '@fortawesome/free-solid-svg-icons';
import { faCalendar as faRegularCalendar } from '@fortawesome/free-regular-svg-icons';
import MapBubble from './MapBubble'; 

// === DỮ LIỆU MẪU ===
const optionsRepo = {
  'Khách sạn': [
    { name: "Colline Hotel", rating: "4.8", price: "1.200.000đ/đêm", desc: "Khách sạn 4 sao hiện đại ngay trung tâm Đà Lạt." },
    { name: "Terracotta Resort", rating: "4.7", price: "1.500.000đ/đêm", desc: "Không gian xanh mát bên bờ hồ Tuyền Lâm." }
  ],
  'Điểm tham quan': [
    { name: "Săn mây Cầu Đất", rating: "4.9", price: "150.000đ", desc: "Đón bình minh rực rỡ tại đồi chè." },
    { name: "Thung lũng tình yêu", rating: "4.5", price: "250.000đ", desc: "Thơ mộng cho các cặp đôi." }
  ],
  'Địa điểm ăn uống': [
    { name: "Lẩu bò Ba Toa", rating: "4.6", price: "250.000đ", desc: "Đặc sản lẩu gỗ trứ danh." },
    { name: "Bánh căn Nhà Chung", rating: "4.7", price: "80.000đ", desc: "Bánh căn giòn rụm với nước chấm đậm đà." }
  ]
};

// === COMPONENT CON: LỰA CHỌN TRONG POP-UP ===
const OptionItem = ({ opt, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      style={{
        padding: '25px', borderRadius: '20px', cursor: 'pointer', transition: '0.3s',
        border: isHovered ? '3px solid #10b981' : '2px solid #f1f5f9',
        backgroundColor: 'white', marginBottom: '12px'
      }} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      onClick={() => onSelect(opt)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: '800', fontSize: '24px' }}>{opt.name}</span>
        <span style={{ color: '#eab308' }}><FontAwesomeIcon icon={faStar} /> {opt.rating}</span>
      </div>
      <p style={{ color: '#64748b', margin: '5px 0' }}>{opt.desc}</p>
      <span style={{ color: '#10b981', fontWeight: '800' }}>{opt.price}</span>
    </div>
  );
};

// === COMPONENT CON: THẺ HIỂN THỊ CHI TIẾT ===
const PlaceCard = ({ type, data, onEdit, locationName, setMapQuery }) => {
  const isHotel = type === 'Khách sạn';
  const mainColor = isHotel ? '#3b82f6' : (type === 'Điểm tham quan' ? '#8b5cf6' : '#f97316');

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '28px', padding: '30px', display: 'flex', gap: '25px', 
      border: '1px solid #f1f5f9', transition: '0.3s', flex: 1, position: 'relative',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    }}>
      <div style={{ fontSize: '40px', color: mainColor }}>
        <FontAwesomeIcon icon={isHotel ? faHotel : (type === 'Điểm tham quan' ? faMapLocationDot : faUtensils)} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: mainColor, textTransform: 'uppercase' }}>{type}</div>
        <div style={{ fontSize: '26px', fontWeight: '900', color: '#111827' }}>{data.name}</div>
        <div style={{ display: 'flex', gap: '15px', margin: '5px 0' }}>
           <span style={{ color: '#eab308', fontWeight: '700' }}><FontAwesomeIcon icon={faStar} /> {data.rating}</span>
           <span style={{ color: '#10b981', fontWeight: '700' }}>{data.price}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={() => setMapQuery(`${data.name} ${locationName}`)} 
            style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: mainColor, color: 'white', fontWeight: '700', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={faLocationArrow} /> Xem vị trí
          </button>
          <button 
            onClick={onEdit} 
            style={{ padding: '10px 20px', borderRadius: '12px', border: `1px solid ${mainColor}`, color: mainColor, backgroundColor: 'white', fontWeight: '700', cursor: 'pointer' }}
          >
            Đổi lựa chọn
          </button>
        </div>
      </div>
    </div>
  );
};

// === COMPONENT CHÍNH ===
const AiSchedule = ({ data: initialData }) => {
  const [currentHotel, setCurrentHotel] = useState(optionsRepo['Khách sạn'][0]);
  const [dailyPlans, setDailyPlans] = useState([]);
  const [mapQuery, setMapQuery] = useState('');
  const [modal, setModal] = useState({ show: false, type: '', day: null });

  useEffect(() => {
    if (initialData && initialData.location) {
      const numDays = parseInt(initialData.days.split(' ')[0]) || 2;
      const newPlans = [];
      for (let i = 1; i <= numDays; i++) {
        newPlans.push({
          day: i,
          tour: optionsRepo['Điểm tham quan'][i % optionsRepo['Điểm tham quan'].length],
          food: optionsRepo['Địa điểm ăn uống'][i % optionsRepo['Địa điểm ăn uống'].length]
        });
      }
      setDailyPlans(newPlans);
      setMapQuery(`${currentHotel.name} ${initialData.location}`);
    }
  }, [initialData, currentHotel]);

  const handleUpdate = (newVal) => {
    if (modal.type === 'Khách sạn') {
      setCurrentHotel(newVal);
      setMapQuery(`${newVal.name} ${initialData.location}`);
    } else {
      const updated = dailyPlans.map(d => 
        d.day === modal.day ? { ...d, [modal.type === 'Điểm tham quan' ? 'tour' : 'food']: newVal } : d
      );
      setDailyPlans(updated);
    }
    setModal({ show: false, type: '', day: null });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
      {/* POP-UP (Giữ nguyên) */}
      {modal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }} onClick={() => setModal({ show: false })}>
          <div style={{ backgroundColor: 'white', borderRadius: '30px', width: '600px', padding: '40px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', fontSize: '30px', cursor: 'pointer' }} onClick={() => setModal({ show: false })}><FontAwesomeIcon icon={faXmark} color="#9ca3af" /></button>
            <h2 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '25px' }}>Đổi {modal.type.toLowerCase()}</h2>
            {optionsRepo[modal.type].map((opt, i) => <OptionItem key={i} opt={opt} onSelect={handleUpdate} />)}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '50px', fontWeight: '900', color: '#111827' }}>Khám phá <span style={{ color: '#10b981' }}>{initialData.location}</span></h1>
        <p style={{ fontSize: '20px', color: '#64748b' }}>Hành trình {initialData.days} dành cho bạn</p>
      </div>

      {/* KHU VỰC CHỖ Ở + BẢN ĐỒ */}
      <div style={{ marginBottom: '60px' }}>
        <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '25px' }}>🛌 Chỗ ở đề xuất</div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', // Chỉnh ở đây để xếp dọc
          gap: '20px', 
          backgroundColor: '#f8fafc', 
          padding: '25px', 
          borderRadius: '40px' 
        }}>
          {/* Thẻ khách sạn nằm trên */}
          <PlaceCard 
            type="Khách sạn" 
            data={currentHotel} 
            locationName={initialData.location}
            setMapQuery={setMapQuery}
            onEdit={() => setModal({ show: true, type: 'Khách sạn' })} 
          />
          
          {/* Bản đồ nằm dưới */}
          <div style={{ borderRadius: '25px', overflow: 'hidden', height: '500px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <iframe
              title="hotel-map"
              width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=16&ie=UTF8&iwloc=near&output=embed`}
            ></iframe>
          </div>
        </div>
      </div>

      {/* LỊCH TRÌNH CHI TIẾT */}
      <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '25px' }}>🧩 Lịch trình chi tiết</div>
      {dailyPlans.map(d => (
        <div key={d.day} style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '26px', fontWeight: '800', marginBottom: '20px', color: '#10b981' }}>
            <FontAwesomeIcon icon={faRegularCalendar} /> Ngày {d.day}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <PlaceCard type="Điểm tham quan" data={d.tour} locationName={initialData.location} setMapQuery={setMapQuery} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day })} />
            <PlaceCard type="Địa điểm ăn uống" data={d.food} locationName={initialData.location} setMapQuery={setMapQuery} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day })} />
          </div>
        </div>
      ))}
      <MapBubble targetOffset={450} />
    </div>
  );
};

export default AiSchedule;