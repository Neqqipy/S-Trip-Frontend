import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, 
  faBolt, 
  faLocationDot, 
  faCalendarDays, 
  faMoneyBillWave, 
  faPlane,
  faUserGroup
} from '@fortawesome/free-solid-svg-icons';

const Hero = ({ onSearch }) => {
  // 1. Quản lý State: Điểm đi, Điểm đến, Ngày, Ngân sách, Số người
  const [origin, setOrigin] = useState('');
  const [location, setLocation] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);

  const [emptyFields, setEmptyFields] = useState({});
  const [shake, setShake] = useState(false); 

  const provinces = ["An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Đà Lạt","Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"];
  const dayOptions = ["2 ngày 1 đêm", "3 ngày 2 đêm", "4 ngày 3 đêm", "5 ngày 4 đêm"];
  const budgetOptions = ["5.000.000đ", "10.000.000đ", "15.000.000đ", "20.000.000đ"];

  const filterList = (query) => provinces.filter(p => 
    p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .includes(query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );

  const handleSearchClick = () => {
    const currentEmptyFields = {};
    if (!origin) currentEmptyFields.origin = true;
    if (!location) currentEmptyFields.location = true;
    if (!days) currentEmptyFields.days = true;
    if (!budget) currentEmptyFields.budget = true;

    setEmptyFields(currentEmptyFields);

    // Kích hoạt hiệu ứng rung khi thiếu thông tin
    if (Object.keys(currentEmptyFields).length > 0) {
      setShake(true); 
      setTimeout(() => setShake(false), 500); 
      return; 
    }

    if (onSearch) {
      onSearch({ origin, location, budget, days, passengers });
    }
  };

  const isAnyFieldEmpty = Object.keys(emptyFields).length > 0;

  // 🎨 Hệ thống Styles phóng to (Scale Up)
  const styles = {
    hero: {
      width: '100vw', height: '65vh', minHeight: '700px', position: 'relative',
      left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.4), rgba(17, 24, 39, 0.4)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000')`,
      backgroundSize: 'cover', backgroundPosition: 'center', color: 'white', textAlign: 'center'
    },
    searchContainer: {
      backgroundColor: '#ffffff', borderRadius: '9999px', padding: '25px 45px', 
      display: 'flex', alignItems: 'center', width: '98%', maxWidth: '1750px',
      marginTop: '60px', position: 'relative', transition: '0.3s all ease',
      boxShadow: isAnyFieldEmpty ? '0 0 35px rgba(239, 68, 68, 0.6)' : '0 25px 60px rgba(0, 0, 0, 0.4)',
      border: isAnyFieldEmpty ? '5px solid #ef4444' : '5px solid transparent',
    },
    searchItem: (isLast) => ({
      flex: 1, padding: '10px 35px', textAlign: 'left', 
      borderRight: isLast ? 'none' : '2px solid #f1f5f9', position: 'relative'
    }),
    label: (active) => ({
      fontSize: '18px', fontWeight: '800', color: active ? '#10b981' : '#9ca3af',
      textTransform: 'uppercase', marginBottom: '8px'
    }),
    input: { fontSize: '26px', fontWeight: '700', color: '#111827', border: 'none', outline: 'none', width: '100%', backgroundColor: 'transparent' },
    dropdown: {
      position: 'absolute', top: '120%', left: '0', right: '0', backgroundColor: 'white', borderRadius: '25px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflowY: 'auto', maxHeight: '400px', zIndex: 100, padding: '15px 0'
    },
    dropdownItem: { 
      padding: '18px 35px', color: '#333', cursor: 'pointer', fontSize: '22px', 
      display: 'flex', alignItems: 'center', gap: '15px', transition: '0.2s'
    },
    searchBtn: { 
      backgroundColor: '#10b981', color: 'white', height: '95px', padding: '0 65px', 
      borderRadius: '9999px', border: 'none', fontWeight: '900', fontSize: '28px', 
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '20px' 
    }
  };

  return (
    <div style={styles.hero} onClick={() => setActiveDropdown(null)}>
      <h1 style={{ fontSize: '90px', fontWeight: '900', margin: 0 }}>
        Khám phá thế giới cùng <span style={{ color: '#10b981' }}>S-Trip</span>
      </h1>
      
      {/* KHUNG TÌM KIẾM: Sử dụng biến 'shake' để kích hoạt animation CSS */}
      <div 
        key={shake ? 'shaking' : 'normal'} // Ép trình duyệt nhận diện lại animation mỗi lần rung
        style={styles.searchContainer} 
        className={shake ? 'shake' : ''} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* ĐIỂM ĐI */}
        <div style={styles.searchItem(false)}>
          <div style={styles.label(activeDropdown === 'origin')}>Điểm đi</div>
          <input 
            style={styles.input} 
            placeholder={emptyFields.origin ? "Từ đâu?" : "Sài Gòn..."} 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)} 
            onFocus={() => setActiveDropdown('origin')} 
          />
          {activeDropdown === 'origin' && (
            <div style={styles.dropdown}>
              {filterList(origin).map(p => (
                <div key={p} style={styles.dropdownItem} onClick={() => { setOrigin(p); setActiveDropdown(null); }}>
                  <FontAwesomeIcon icon={faPlane} style={{color: '#10b981', fontSize: '24px'}} /> {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ĐỊA ĐIỂM ĐẾN */}
        <div style={styles.searchItem(false)}>
          <div style={styles.label(activeDropdown === 'loc')}>Địa điểm</div>
          <input 
            style={styles.input} 
            placeholder={emptyFields.location ? "Đi đâu?" : "Huế, Đà Lạt..."} 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            onFocus={() => setActiveDropdown('loc')} 
          />
          {activeDropdown === 'loc' && (
            <div style={styles.dropdown}>
              {filterList(location).map(p => (
                <div key={p} style={styles.dropdownItem} onClick={() => { setLocation(p); setActiveDropdown(null); }}>
                  <FontAwesomeIcon icon={faLocationDot} style={{color: '#10b981', fontSize: '24px'}} /> {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SỐ NGÀY */}
        <div style={styles.searchItem(false)}>
          <div style={styles.label(activeDropdown === 'days')}>Số ngày</div>
          <input style={styles.input} placeholder="3 ngày 2 đêm" value={days} onChange={(e) => setDays(e.target.value)} onFocus={() => setActiveDropdown('days')} />
          {activeDropdown === 'days' && (
            <div style={styles.dropdown}>
              {dayOptions.map(d => (
                <div key={d} style={styles.dropdownItem} onClick={() => { setDays(d); setActiveDropdown(null); }}>
                  <FontAwesomeIcon icon={faCalendarDays} style={{color: '#10b981', fontSize: '24px'}} /> {d}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SỐ NGƯỜI */}
        <div style={styles.searchItem(false)}>
          <div style={styles.label(activeDropdown === 'passengers')}>Số người</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
             <FontAwesomeIcon icon={faUserGroup} style={{color: '#9ca3af', fontSize: '28px'}} />
             <input type="number" min="1" max="10" style={styles.input} value={passengers} onChange={(e) => setPassengers(e.target.value)} />
          </div>
        </div>

        {/* NGÂN SÁCH */}
        <div style={styles.searchItem(true)}>
          <div style={styles.label(activeDropdown === 'budget')}>Ngân sách</div>
          <input style={styles.input} placeholder="Kinh phí?" value={budget} onChange={(e) => setBudget(e.target.value)} onFocus={() => setActiveDropdown('budget')} />
          {activeDropdown === 'budget' && (
            <div style={styles.dropdown}>
              {budgetOptions.map(b => (
                <div key={b} style={styles.dropdownItem} onClick={() => { setBudget(b); setActiveDropdown(null); }}>
                  <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#10b981', fontSize: '24px'}} /> {b}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button style={styles.searchBtn} onClick={handleSearchClick}>
          <FontAwesomeIcon icon={faMagnifyingGlass} /> Tìm kiếm
        </button>
      </div>

      {/* GỢI Ý (Suggestion Tags) */}
      <div style={{ marginTop: '70px', display: 'flex', gap: '30px', alignItems: 'center' }}>
        <span style={{ fontSize: '40px', fontWeight: '900', color: 'white' }}>
          <FontAwesomeIcon icon={faBolt} style={{color: '#fbbf24', fontSize: '48px'}} /> Gợi ý:
        </span>
        {['Đà Lạt', 'Huế', 'Đà Nẵng', 'Sapa', 'Phú Quốc'].map(city => (
          <div 
            key={city} 
            style={{ 
              backgroundColor: hoveredTag === city ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
              padding: '12px 45px', borderRadius: '9999px', fontSize: '28px', color: 'white', fontWeight: '700', 
              cursor: 'pointer', border: '2px solid rgba(255,255,255,0.5)', transition: '0.3s'
            }}
            onMouseEnter={() => setHoveredTag(city)}
            onMouseLeave={() => setHoveredTag(null)}
            onClick={() => setLocation(city)}
          >
            {city}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;