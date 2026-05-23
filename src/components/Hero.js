import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, 
  faBolt, 
  faLocationDot, 
  faCalendarDays, 
  faMoneyBillWave, 
  faPlane,
  faUserGroup,
  faRightLeft
} from '@fortawesome/free-solid-svg-icons';

const Hero = ({ onSearch, isDark = false }) => {
  // Khôi phục giá trị từ lần tìm kiếm trước
  const _last = (() => { try { return JSON.parse(localStorage.getItem('s_trip_last_search') || '{}'); } catch { return {}; } })();
  const [origin, setOrigin] = useState(_last.origin || '');
  const [location, setLocation] = useState(_last.location || '');
  const [departureDate, setDepartureDate] = useState(_last.departureDate ? (() => {
    // Convert stored dd/mm/yyyy back or use as-is
    return '';
  })() : '');
  const [days, setDays] = useState(_last.days || '');
  const [budget, setBudget] = useState(String(_last.budget || ''));
  const [passengers, setPassengers] = useState(_last.passengers || 1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dateInput, setDateInput] = useState(_last.departureDate || '');
  const [hoveredTag, setHoveredTag] = useState(null);
  const [emptyFields, setEmptyFields] = useState({});
  const [shake, setShake] = useState(false); 

  const handleSwap = () => {
    setOrigin(location);
    setLocation(origin);
  };

  const provinces = ["An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"];
  const cities = [
    // Thành phố trực thuộc Trung ương
    "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
    // Thành phố trực thuộc tỉnh
    "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bảo Lộc",
    "Biên Hòa", "Buôn Ma Thuột",
    "Cà Mau", "Cam Ranh", "Cao Bằng", "Cao Lãnh",
    "Châu Đốc", "Chí Linh",
    "Dĩ An",
    "Đà Lạt", "Điện Biên Phủ", "Đông Hà", "Đồng Hới",
    "Gia Nghĩa",
    "Hà Giang", "Hà Tĩnh", "Hạ Long", "Hải Dương",
    "Hòa Bình", "Hội An", "Huế", "Hưng Yên",
    "Kon Tum",
    "Lai Châu", "Lạng Sơn", "Lào Cai", "Long Khánh", "Long Xuyên",
    "Móng Cái", "Mỹ Tho",
    "Nam Định", "Nha Trang", "Ninh Bình",
    "Phan Rang - Tháp Chàm", "Phan Thiết", "Pleiku", "Phú Quốc", "Phủ Lý",
    "Quy Nhơn",
    "Rạch Giá",
    "Sa Đéc", "Sa Pa", "Sầm Sơn", "Sóc Trăng", "Sơn La",
    "Tam Kỳ", "Tân An", "Thái Bình", "Thái Nguyên",
    "Thanh Hóa", "Thuận An", "Thủ Dầu Một", "Tuy Hòa",
    "Uông Bí",
    "Việt Trì", "Vinh", "Vĩnh Long", "Vĩnh Yên", "Vũng Tàu",
    "Yên Bái"
  ];
  const locationsAll = [...new Set([...cities, ...provinces])]
    .sort((a, b) => a.normalize("NFD").localeCompare(b.normalize("NFD"), 'vi'));
  const dayOptions = ["2 ngày 1 đêm", "3 ngày 2 đêm", "4 ngày 3 đêm", "5 ngày 4 đêm"];
  const budgetOptions = ["5.000.000đ", "10.000.000đ", "15.000.000đ", "20.000.000đ"];

  // --- HÀM LỌC TỈNH THÀNH (ĐÃ KHÔI PHỤC) ---
  const filterList = (query) => provinces.filter(p => 
    p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .includes(query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );

  const extra_aliases = new Set(["Sapa","Sa Pa","Đà Lạt","Da Lat","Huế","Hue","Phú Quốc","Phu Quoc","Hội An","Hoi An","Nha Trang","Vũng Tàu","Vung Tau","Mũi Né","Mui Ne","Buôn Ma Thuột","Buon Ma Thuot","Cần Thơ","Can Tho","Hải Phòng","Hai Phong"]);
  const provinces_set = new Set(["An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"]);
  const _norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const isValidProvince = (val) => {
    if (!val) return false;
    if (provinces_set.has(val) || extra_aliases.has(val)) return true;
    const v = _norm(val).replace(/^(tp\.?|tinh|thanh pho)\s*/, '');
    return [...provinces_set, ...extra_aliases].some(p => {
      const pn = _norm(p).replace(/^(tp\.?|tinh|thanh pho)\s*/, '');
      return pn === v || pn.includes(v) || v.includes(pn);
    });
  };

  const handleSearchClick = () => {
    const currentEmptyFields = {};
    if (!origin || !isValidProvince(origin)) currentEmptyFields.origin = true;
    if (!location || !isValidProvince(location)) currentEmptyFields.location = true;
    if (!departureDate) currentEmptyFields.departureDate = true;
    if (!days) currentEmptyFields.days = true;
    const rawBudget = String(budget).replace(/[.đ\s]/g, '');
    if (!budget || !/^\d+$/.test(rawBudget) || parseInt(rawBudget) <= 0) currentEmptyFields.budget = true;

    setEmptyFields(currentEmptyFields);
    if (Object.keys(currentEmptyFields).length > 0) {
      setShake(true); 
      setTimeout(() => setShake(false), 500); 
      return; 
    }

    if (onSearch) {
      onSearch({ origin, location, departureDate: dateInput, budget, days, passengers });
    }
  };

  const isAnyFieldEmpty = Object.keys(emptyFields).length > 0;

  const styles = {
  hero: {
    width: '100vw', 
    height: '70vh', 
    minHeight: '600px',
    position: 'relative',
    left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.4), rgba(17, 24, 39, 0.5)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000')`,
    backgroundSize: 'cover', backgroundPosition: 'center', color: 'white', textAlign: 'center',
    paddingTop: '40px'
  },
  searchContainer: {
    backgroundColor: isDark ? '#2a2a2a' : '#ffffff', 
    borderRadius: '100px', 
    padding: '15px 30px', 
    display: 'flex', alignItems: 'center', 
    width: '95%',          
    maxWidth: '1350px',
    marginTop: '45px',
    position: 'relative', 
    transition: '0.4s all cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: isAnyFieldEmpty ? '0 0 30px rgba(239, 68, 68, 0.4)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: isAnyFieldEmpty ? '3px solid #ef4444' : `1px solid ${isDark ? '#3a3a3a' : '#e2e8f0'}`,
  },
  searchItem: (isLast) => ({
    flex: 1, 
    padding: '10px 20px',
    textAlign: 'left', 
    borderRight: isLast ? 'none' : `1px solid ${isDark ? '#3a3a3a' : '#f1f5f9'}`,
    position: 'relative'
  }),
  label: (active) => ({
    fontSize: '12px',      
    fontWeight: '700', 
    color: '#10b981',
    textTransform: 'uppercase', 
    letterSpacing: '0.5px',
    marginBottom: '6px'
  }),
  input: { 
    fontSize: '17px',
    fontWeight: '600', 
    color: isDark ? '#e8e8e8' : '#1e293b', 
    border: 'none', outline: 'none', width: '100%', backgroundColor: 'transparent',
    padding: '0',
    colorScheme: isDark ? 'dark' : 'light',
  },
  dropdown: {
    position: 'absolute', top: '120%', left: '0', right: '0', backgroundColor: isDark ? '#2a2a2a' : 'white', 
    borderRadius: '20px',
    boxShadow: '0 15px 30px rgba(0,0,0,0.2)', overflowY: 'auto', 
    maxHeight: '260px',
    zIndex: 100, 
    padding: '12px 0'
  },
  dropdownItem: { 
    padding: '12px 24px',
    color: isDark ? '#e8e8e8' : '#333', cursor: 'pointer', 
    fontSize: '16px',
    display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s'
  },
  searchBtn: { 
    backgroundColor: '#10b981', 
    color: 'white', 
    height: '60px', // Nút tìm kiếm cao vừa phải, ôm gọn gàng
    padding: '0 35px', 
    borderRadius: '50px', 
    border: 'none', 
    fontWeight: '700', 
    fontSize: '18px',
    cursor: 'pointer', 
    display: 'flex', alignItems: 'center', gap: '10px',
    marginLeft: '15px',
    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
    transition: '0.3s'
  }
};

  return (
    <div style={styles.hero} onClick={() => setActiveDropdown(null)}>
      <style>{`
        .hero-search-bar input {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .hero-search-bar input:-webkit-autofill,
        .hero-search-bar input:-webkit-autofill:hover, 
        .hero-search-bar input:-webkit-autofill:focus, 
        .hero-search-bar input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s !important; /* Trì hoãn việc đổi màu nền vô thời hạn */
          -webkit-text-fill-color: inherit !important; /* Giữ nguyên màu chữ gốc của bạn */
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
        }
        .hero-search-bar input::placeholder { 
          color: #6b7280 !important; 
        }
      `}</style>
      <h1 style={{ fontSize: '90px', fontWeight: '900', margin: 0 }}>
        Khám phá thế giới cùng <span style={{ color: '#10b981' }}>S-Trip</span>
      </h1>
      
      <div 
        key={shake ? 'shaking' : 'normal'} 
        style={styles.searchContainer} 
        className={`hero-search-bar${shake ? ' shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ĐIỂM ĐI */}
        <div style={styles.searchItem(false)}>
          <div style={styles.label(activeDropdown === 'origin')}>Điểm đi</div>
          <input 
            style={styles.input} 
            placeholder="Từ đâu?" 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)} 
            onFocus={() => setActiveDropdown('origin')} 
          />
          {activeDropdown === 'origin' && (
            <div style={styles.dropdown}>
              {filterList(origin).map(p => (
                <div key={p} style={styles.dropdownItem} onClick={() => { setOrigin(p); setActiveDropdown(null); }}>
                  <FontAwesomeIcon icon={faPlane} style={{color: '#10b981'}} /> {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SWAP BUTTON */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={handleSwap}
            title="Đổi chiều"
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
              border: '1.5px solid rgba(16,185,129,0.35)',
              color: '#10b981', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(16,185,129,0.25)'; e.currentTarget.style.transform='rotate(180deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background=isDark?'rgba(16,185,129,0.15)':'rgba(16,185,129,0.1)'; e.currentTarget.style.transform='rotate(0deg)'; }}
          >
            <FontAwesomeIcon icon={faRightLeft} style={{ fontSize: '13px' }} />
          </button>
        </div>

        {/* ĐỊA ĐIỂM ĐẾN */}
        <div style={styles.searchItem(false)}>
          <div style={styles.label(activeDropdown === 'loc')}>Địa điểm</div>
          <input 
            style={styles.input} 
            placeholder="Đi đâu?" 
            value={location} 
            autoComplete="off"
            onChange={(e) => setLocation(e.target.value)} 
            onFocus={() => setActiveDropdown('loc')} 
          />
          {activeDropdown === 'loc' && (
            <div style={styles.dropdown}>
              {locationsAll.filter(p =>
                p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .includes(location.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
              ).map(p => (
                <div key={p} style={styles.dropdownItem} onClick={() => { setLocation(p); setActiveDropdown(null); }}>
                  <FontAwesomeIcon icon={faLocationDot} style={{color: '#10b981'}} /> {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NGÀY ĐI */}
        <div style={styles.searchItem(false)}>
          <div style={styles.label(activeDropdown === 'date')}>Ngày đi</div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="dd/mm/yyyy"
            autoComplete="off"
            style={{...styles.input, color: dateInput ? (isDark ? '#e8e8e8' : '#111827') : '#9ca3af'}}
            value={dateInput}
            onChange={(e) => {
              let raw = e.target.value.replace(/[^\d]/g, '');
              if (raw.length > 8) raw = raw.slice(0, 8);
              let formatted = raw;
              if (raw.length >= 5) formatted = raw.slice(0,2) + '/' + raw.slice(2,4) + '/' + raw.slice(4);
              else if (raw.length >= 3) formatted = raw.slice(0,2) + '/' + raw.slice(2);
              setDateInput(formatted);
              // Validate và lưu vào departureDate dạng yyyy-mm-dd để check logic
              if (raw.length === 8) {
                const dd = raw.slice(0,2), mm = raw.slice(2,4), yyyy = raw.slice(4);
                const iso = `${yyyy}-${mm}-${dd}`;
                const d = new Date(iso);
                const today = new Date(); today.setHours(0,0,0,0);
                if (!isNaN(d) && d >= today) setDepartureDate(iso);
                else setDepartureDate('');
              } else {
                setDepartureDate('');
              }
            }}
            onFocus={() => setActiveDropdown('date')}
          />
        </div>

        {/* SỐ NGÀY */}
        <div style={styles.searchItem(false)}>
          <div style={styles.label(activeDropdown === 'days')}>Số ngày</div>
          <input 
            style={styles.input} 
            placeholder="3 ngày 2 đêm" 
            autoComplete="off"
            value={days} 
            onChange={(e) => setDays(e.target.value)}
            onFocus={() => setActiveDropdown('days')} 
          />
          {activeDropdown === 'days' && (
            <div style={styles.dropdown}>
              {dayOptions.map(d => (
                <div key={d} style={styles.dropdownItem} onClick={() => { setDays(d); setActiveDropdown(null); }}>
                  <FontAwesomeIcon icon={faCalendarDays} style={{color: '#10b981'}} /> {d}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SỐ NGƯỜI */}
        <div style={styles.searchItem(false)}>
          <div style={styles.label(activeDropdown === 'passengers')}>Số người</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
             <FontAwesomeIcon icon={faUserGroup} style={{color: '#9ca3af', fontSize: '24px'}} />
             <input 
               type="number" 
               min="1" 
               max="10" 
               style={styles.input} 
               value={passengers} 
               onChange={(e) => setPassengers(e.target.value)} 
             />
          </div>
        </div>

        {/* NGÂN SÁCH */}
        <div style={styles.searchItem(true)}>
          <div style={styles.label(activeDropdown === 'budget')}>Ngân sách</div>
          <input 
            style={styles.input} 
            placeholder="Kinh phí?" 
            value={budget} 
            onChange={(e) => {
              const val = e.target.value;
              const filtered = val.replace(/[^0-9]/g, '');
              if (filtered === '') { setBudget(''); return; }
              setBudget(filtered);
            }}
            onFocus={(e) => {
              setActiveDropdown('budget');
              const raw = String(budget).replace(/[.đ\s]/g, '');
              setBudget(raw);
            }}
            onBlur={() => {
              const raw = String(budget).replace(/[.đ\s]/g, '');
              if (raw && parseInt(raw) > 0) {
                setBudget(parseInt(raw).toLocaleString('vi-VN') + 'đ');
                setEmptyFields(f => ({...f, budget: false}));
              }
            }} 
          />
          {activeDropdown === 'budget' && (
            <div style={styles.dropdown}>
              {budgetOptions.map(b => (
                <div key={b} style={styles.dropdownItem} onClick={() => { setBudget(b); setActiveDropdown(null); }}>
                  <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#10b981'}} /> {b}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button style={styles.searchBtn} onClick={handleSearchClick}>
          <FontAwesomeIcon icon={faMagnifyingGlass} /> Tìm kiếm
        </button>
      </div>

      {/* GỢI Ý TAGS */}
      <div style={{ marginTop: '70px', display: 'flex', gap: '30px', alignItems: 'center' }}>
        <span style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>
          <FontAwesomeIcon icon={faBolt} style={{color: '#fbbf24'}} /> Gợi ý:
        </span>
        {['Đà Lạt', 'Huế', 'Đà Nẵng', 'Sapa', 'Phú Quốc'].map(city => (
          <div 
            key={city} 
            style={{ 
              backgroundColor: hoveredTag === city ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
              padding: '10px 40px', borderRadius: '9999px', fontSize: '24px', color: 'white', fontWeight: '700', 
              cursor: 'pointer', border: '1px solid rgba(255,255,255,0.5)', transition: '0.3s'
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