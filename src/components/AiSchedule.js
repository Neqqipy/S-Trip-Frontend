import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWandMagicSparkles, faHandPointer, faHotel, faUtensils, 
  faMapLocationDot, faPenToSquare, faStar, faXmark, faBookmark
} from '@fortawesome/free-solid-svg-icons';
import { faCalendar as faRegularCalendar } from '@fortawesome/free-regular-svg-icons';

// === COMPONENT CON: LỰA CHỌN TRONG POP-UP ===
const OptionItem = ({ opt, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const styles = {
    card: {
      padding: '35px', borderRadius: '28px', cursor: 'pointer', transition: '0.3s all ease',
      border: isHovered ? '3px solid #10b981' : '2px solid #f1f5f9',
      backgroundColor: 'white', marginBottom: '20px'
    },
    name: { fontWeight: '900', fontSize: '32px', color: isHovered ? '#10b981' : '#111827', transition: '0.3s' },
    priceTag: {
      backgroundColor: isHovered ? '#10b981' : '#f0fdf4', color: isHovered ? 'white' : '#10b981',
      padding: '10px 20px', borderRadius: '12px', fontSize: '22px', fontWeight: '800'
    }
  };

  return (
    <div style={styles.card} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => onSelect(opt)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={styles.name}>{opt.name}</span>
        <span style={{ color: '#eab308', fontSize: '28px', fontWeight: '700' }}><FontAwesomeIcon icon={faStar} /> {opt.rating}</span>
      </div>
      <p style={{ fontSize: '22px', color: '#64748b', margin: '12px 0 20px 0' }}>{opt.desc}</p>
      <span style={styles.priceTag}>{opt.price}</span>
    </div>
  );
};

// === COMPONENT CON: THẺ HIỂN THỊ LỊCH TRÌNH ===
const PlaceCard = ({ type, data, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isTour = type === 'Điểm tham quan';
  const isHotel = type === 'Khách sạn';
  const mainColor = isTour ? '#8b5cf6' : (isHotel ? '#3b82f6' : '#f97316');
  const lightBg = isTour ? '#f5f3ff' : (isHotel ? '#eff6ff' : '#fff7ed');

  const styles = {
    card: {
      backgroundColor: isHovered ? (isTour ? '#ede9fe' : (isHotel ? '#dbeafe' : '#ffedd5')) : 'white',
      borderRadius: '32px', padding: isHotel ? '45px 50px' : '40px', display: 'flex', gap: '35px', alignItems: 'center',
      border: isHovered ? `3px solid ${mainColor}` : '1px solid #f1f5f9', transition: '0.3s all ease', cursor: 'pointer',
      position: 'relative', flex: 1, marginBottom: isHotel ? '50px' : '0'
    },
    editBtn: { position: 'absolute', top: '25px', right: '30px', color: mainColor, fontSize: '28px', opacity: isHovered ? 1 : 0, transition: '0.3s', background: 'none', border: 'none', cursor: 'pointer' }
  };

  return (
    <div style={styles.card} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <button style={styles.editBtn} onClick={(e) => { e.stopPropagation(); onEdit(); }}>
        <FontAwesomeIcon icon={faPenToSquare} />
      </button>
      <div style={{ width: '100px', height: '100px', borderRadius: '24px', backgroundColor: isHovered ? 'white' : lightBg, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '50px', color: mainColor }}>
        <FontAwesomeIcon icon={isHotel ? faHotel : (isTour ? faMapLocationDot : faUtensils)} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '18px', fontWeight: '800', color: mainColor, textTransform: 'uppercase' }}>{type}</div>
        <div style={{ fontSize: '32px', fontWeight: '900', color: isHovered ? mainColor : '#111827', margin: '4px 0' }}>{data.name}</div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
          <span style={{ color: '#eab308' }}><FontAwesomeIcon icon={faStar} /> {data.rating}</span>
          <span style={{ color: (isTour || isHotel) ? '#10b981' : '#f97316' }}>{data.price}</span>
        </div>
        <p style={{ fontSize: '20px', color: '#64748b', margin: 0 }}>{data.desc}</p>
      </div>
    </div>
  );
};

// === COMPONENT CHÍNH ===
const AiSchedule = ({ data: initialData }) => {
  // Kho dữ liệu để người dùng đổi
  const optionsRepo = {
    'Khách sạn': [
      { name: "Colline Hotel Đà Lạt", rating: "4.8", price: "1.200.000đ/đêm", desc: "Khách sạn 4 sao ngay trung tâm chợ Đà Lạt." },
      { name: "Terracotta Resort", rating: "4.7", price: "1.500.000đ/đêm", desc: "Không gian xanh mát bên hồ Tuyền Lâm." }
    ],
    'Điểm tham quan': [
      { name: "Săn mây Cầu Đất", rating: "4.9", price: "150.000đ", desc: "Đón bình minh rực rỡ tại đồi chè." },
      { name: "Thung lũng tình yêu", rating: "4.5", price: "250.000đ", desc: "Thơ mộng, lãng mạn cho các cặp đôi." },
      { name: "Thác Datanla", rating: "4.7", price: "200.000đ", desc: "Trải nghiệm máng trượt xuyên rừng thông." }
    ],
    'Địa điểm ăn uống': [
      { name: "Lẩu bò Ba Toa", rating: "4.6", price: "250.000đ", desc: "Đặc sản lẩu gỗ trứ danh Đà Lạt." },
      { name: "Bánh căn Nhà Chung", rating: "4.7", price: "80.000đ", desc: "Bánh căn giòn rụm với nước chấm đậm đà." }
    ]
  };

  // State lưu trữ toàn bộ lịch trình hiện tại
  const [currentHotel, setCurrentHotel] = useState(optionsRepo['Khách sạn'][0]);
  const [dailyPlans, setDailyPlans] = useState([
    { day: 1, tour: optionsRepo['Điểm tham quan'][0], food: optionsRepo['Địa điểm ăn uống'][0] },
    { day: 2, tour: optionsRepo['Điểm tham quan'][2], food: optionsRepo['Địa điểm ăn uống'][1] }
  ]);

  const [modal, setModal] = useState({ show: false, type: '', day: null });

  const handleUpdate = (newVal) => {
    if (modal.type === 'Khách sạn') {
      setCurrentHotel(newVal);
    } else {
      const updated = dailyPlans.map(d => 
        d.day === modal.day 
          ? { ...d, [modal.type === 'Điểm tham quan' ? 'tour' : 'food']: newVal }
          : d
      );
      setDailyPlans(updated);
    }
    setModal({ show: false, type: '', day: null });
  };

  if (!initialData) return null;

  return (
    <div style={{ maxWidth: '1700px', margin: '0 auto', padding: '60px' }}>
      {/* POP-UP CHỌN ĐỊA ĐIỂM */}
      {modal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }} onClick={() => setModal({ show: false })}>
          <div style={{ backgroundColor: 'white', borderRadius: '40px', width: '900px', padding: '50px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: '35px', right: '35px', border: 'none', background: 'none', fontSize: '35px', cursor: 'pointer' }} onClick={() => setModal({ show: false })}>
              <FontAwesomeIcon icon={faXmark} color="#9ca3af" />
            </button>
            <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '40px' }}>Đổi {modal.type.toLowerCase()}</h2>
            {optionsRepo[modal.type].map((opt, i) => (
              <OptionItem key={i} opt={opt} onSelect={handleUpdate} />
            ))}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#ecfdf5', color: '#10b981', padding: '12px 24px', borderRadius: '99px', fontSize: '18px', fontWeight: '700', marginBottom: '25px' }}>
          <FontAwesomeIcon icon={faWandMagicSparkles} /> Lịch trình AI đề xuất
        </div>
        <h1 style={{ fontSize: '65px', fontWeight: '900' }}>Kế hoạch hoàn hảo cho <span style={{ color: '#10b981' }}>{initialData.location}</span></h1>
        <p style={{ fontSize: '28px', color: '#6b7280' }}>Chuyến đi <b>{initialData.days}</b> | {initialData.budget} VNĐ/Người của bạn</p>
      </div>

      <div style={{ fontSize: '36px', fontWeight: '900', margin: '60px 0 30px 0' }}>🛌 Chỗ ở đề xuất</div>
      <PlaceCard type="Khách sạn" data={currentHotel} onEdit={() => setModal({ show: true, type: 'Khách sạn' })} />

      <div style={{ fontSize: '36px', fontWeight: '900', margin: '60px 0 30px 0' }}>🧩 Lịch trình chi tiết</div>
      {dailyPlans.map(d => (
        <div key={d.day} style={{ backgroundColor: 'white', padding: '50px', borderRadius: '40px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '35px' }}>
            <FontAwesomeIcon icon={faRegularCalendar} color="#10b981" /> Ngày {d.day}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <PlaceCard type="Điểm tham quan" data={d.tour} onEdit={() => setModal({ show: true, type: 'Điểm tham quan', day: d.day })} />
            <PlaceCard type="Địa điểm ăn uống" data={d.food} onEdit={() => setModal({ show: true, type: 'Địa điểm ăn uống', day: d.day })} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AiSchedule;