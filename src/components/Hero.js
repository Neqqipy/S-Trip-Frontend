import React, { useState } from 'react';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, 
  faBolt, 
  faLocationDot, 
  faCalendarDays, 
  faMoneyBillWave, 
  faHeart 
} from '@fortawesome/free-solid-svg-icons';

const Hero = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('');
  const [interest, setInterest] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);

  const provinces = ["An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"];
  const dayOptions = ["2 ngày 1 đêm", "3 ngày 2 đêm", "4 ngày 3 đêm", "5 ngày 4 đêm"];
  const budgetOptions = ["1.000.000đ", "2.000.000đ", "3.000.000đ", "5.000.000đ"];
  const interestOptions = ["Nghỉ dưỡng", "Khám phá", "Ẩm thực", "Team building"];

  const filteredProvinces = provinces.filter(p => 
    p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .includes(location.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );

  const handleSearchClick = () => {
    if(!location) {
      alert("Nhi ơi, chọn địa điểm đã nè!");
      return;
    }
    if (onSearch) {
      onSearch({ location, budget, interest, days });
    }
  };

  const styles = {
    hero: {
      width: '100vw', // Sử dụng vw (view width) để ép tràn hết màn hình ngang
      height: '65vh', 
      minHeight: '650px', 
      position: 'relative',
      left: '50%', // Kết hợp với transform bên dưới để căn giữa tuyệt đối nếu nằm trong container
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.4), rgba(17, 24, 39, 0.4)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000')`,
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat', // Thêm dòng này cho chắc
      color: 'white', 
      textAlign: 'center'
    },
    searchContainer: {
      backgroundColor: '#ffffff', borderRadius: '9999px', padding: '20px', 
      display: 'flex', alignItems: 'center', width: '98%', maxWidth: '1600px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)', marginTop: '60px', position: 'relative'
    },
    searchItem: { flex: 1, padding: '5px 40px', textAlign: 'left', borderRight: '1px solid #eee', position: 'relative' },
    label: (active) => ({
      fontSize: '18px', fontWeight: '700', color: active ? '#10b981' : '#9ca3af',
      textTransform: 'uppercase', marginBottom: '8px', transition: '0.3s'
    }),
    input: { fontSize: '22px', fontWeight: '700', color: '#111827', border: 'none', outline: 'none', width: '100%', backgroundColor: 'transparent' },
    dropdown: {
      position: 'absolute', top: '110%', left: '0', right: '0', backgroundColor: 'white', borderRadius: '20px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.2)', overflowY: 'auto', maxHeight: '300px', zIndex: 100, padding: '10px 0'
    },
    dropdownItem: { 
      padding: '12px 25px', color: '#333', cursor: 'pointer', fontSize: '18px', 
      transition: '0.2s', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' 
    },
    searchBtn: { 
      backgroundColor: '#10b981', color: 'white', height: '80px', padding: '0 50px', 
      borderRadius: '9999px', border: 'none', fontWeight: '800', fontSize: '24px', 
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '15px' 
    },
    suggestions: { marginTop: '40px', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' },
    tag: (tagName) => ({
      backgroundColor: hoveredTag === tagName ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.5)', padding: '10px 40px', borderRadius: '9999px',
      fontSize: '24px', color: 'white', fontWeight: '700', cursor: 'pointer',
      transition: '0.4s all ease', backdropFilter: 'blur(10px)',
      transform: hoveredTag === tagName ? 'scale(1.1)' : 'scale(1)',
    })
  };

  return (
    <div style={styles.hero} onClick={() => setActiveDropdown(null)}>
      <h1 style={{ fontSize: '100px', fontWeight: '900', margin: 0 }}>
        Khám phá thế giới cùng <span style={{ color: '#10b981' }}>S-Trip</span>
      </h1>
      
      <div style={styles.searchContainer} onClick={(e) => e.stopPropagation()}>
        {/* ĐỊA ĐIỂM + ICON LOCATION */}
        <div style={styles.searchItem}>
          <div style={styles.label(activeDropdown === 'loc')}>Địa điểm</div>
          <input 
            style={styles.input} 
            placeholder="Bạn muốn đi đâu?" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            onFocus={() => setActiveDropdown('loc')} 
          />
          {activeDropdown === 'loc' && (
            <div style={styles.dropdown}>
              {filteredProvinces.map(p => (
                <div key={p} style={styles.dropdownItem} onClick={() => {setLocation(p); setActiveDropdown(null)}} onMouseOver={(e) => e.target.style.backgroundColor = '#f0fdf4'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <FontAwesomeIcon icon={faLocationDot} style={{color: '#10b981'}} /> {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SỐ NGÀY + ICON CALENDAR */}
        <div style={styles.searchItem}>
          <div style={styles.label(activeDropdown === 'days')}>Số ngày</div>
          <input style={styles.input} placeholder="VD: 3 ngày 2 đêm" value={days} onFocus={() => setActiveDropdown('days')} readOnly />
          {activeDropdown === 'days' && (
            <div style={styles.dropdown}>
              {dayOptions.map(d => (
                <div key={d} style={styles.dropdownItem} onClick={() => {setDays(d); setActiveDropdown(null)}} onMouseOver={(e) => e.target.style.backgroundColor = '#f0fdf4'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <FontAwesomeIcon icon={faCalendarDays} style={{color: '#10b981'}} /> {d}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NGÂN SÁCH + ICON MONEY */}
        <div style={styles.searchItem}>
          <div style={styles.label(activeDropdown === 'budget')}>Ngân sách</div>
          <input style={styles.input} placeholder="Ví dụ: 2.000.000đ" value={budget} onFocus={() => setActiveDropdown('budget')} readOnly />
          {activeDropdown === 'budget' && (
            <div style={styles.dropdown}>
              {budgetOptions.map(b => (
                <div key={b} style={styles.dropdownItem} onClick={() => {setBudget(b); setActiveDropdown(null)}} onMouseOver={(e) => e.target.style.backgroundColor = '#f0fdf4'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#10b981'}} /> {b}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SỞ THÍCH + ICON HEART */}
        <div style={{...styles.searchItem, borderRight: 'none'}}>
          <div style={styles.label(activeDropdown === 'interest')}>Sở thích</div>
          <input style={styles.input} placeholder="Nghỉ dưỡng..." value={interest} onFocus={() => setActiveDropdown('interest')} readOnly />
          {activeDropdown === 'interest' && (
            <div style={styles.dropdown}>
              {interestOptions.map(i => (
                <div key={i} style={styles.dropdownItem} onClick={() => {setInterest(i); setActiveDropdown(null)}} onMouseOver={(e) => e.target.style.backgroundColor = '#f0fdf4'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <FontAwesomeIcon icon={faHeart} style={{color: '#10b981'}} /> {i}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* NÚT TÌM KIẾM CÓ ICON MAGNIFYING GLASS */}
        <button style={styles.searchBtn} onClick={handleSearchClick}>
          <FontAwesomeIcon icon={faMagnifyingGlass} /> Tìm kiếm
        </button>
      </div>

      <div style={styles.suggestions}>
        <span style={{ fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FontAwesomeIcon icon={faBolt} style={{color: '#fbbf24'}} /> Gợi ý:
        </span>
        {['Đà Lạt', 'Hội An', 'Đà Nẵng', 'Sapa', 'Phú Quốc'].map(city => (
          <div 
            key={city} 
            style={styles.tag(city)}
            onMouseEnter={() => setHoveredTag(city)}
            onMouseLeave={() => setHoveredTag(null)}
            onClick={() => {setLocation(city); setActiveDropdown(null)}}
          >
            {city}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;