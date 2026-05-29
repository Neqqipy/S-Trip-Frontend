import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, faBolt, faLocationDot, faCalendarDays,
  faMoneyBillWave, faPlane, faUserGroup, faRightLeft
} from '@fortawesome/free-solid-svg-icons';

const Hero = ({ onSearch, isDark = false }) => {
  const _last = (() => { try { return JSON.parse(localStorage.getItem('s_trip_last_search') || '{}'); } catch { return {}; } })();
  const [origin, setOrigin] = useState(_last.origin || '');
  const [location, setLocation] = useState(_last.location || '');
  const [departureDate, setDepartureDate] = useState(_last.departureDate || '');
  const [days, setDays] = useState(_last.days || '');
  const [budget, setBudget] = useState(String(_last.budget || ''));
  const [passengers, setPassengers] = useState(_last.passengers || 1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const today = new Date(); today.setHours(0,0,0,0);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [hoveredTag, setHoveredTag] = useState(null);
  const [emptyFields, setEmptyFields] = useState({});
  const [shake, setShake] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);

  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleSwap = () => { setOrigin(location); setLocation(origin); };

  const provinces = ["An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Biên Hòa", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Buôn Ma Thuột", "Cà Mau", "Cam Ranh", "Cần Thơ", "Cao Bằng", "Cửa Lò", "Đà Lạt", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Hới", "Đồng Nai", "Đồng Tháp", "Đông Hà", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hạ Long", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hoa Lư", "Hòa Bình", "Hội An", "Huế", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Long Xuyên", "Móng Cái", "Mỹ Tho", "Nam Định", "Nghệ An", "Nha Trang", "Ninh Bình", "Ninh Thuận", "Phan Rang - Tháp Chàm", "Phan Thiết", "Phú Quốc", "Phú Thọ", "Phú Yên", "Pleiku", "Quy Nhơn", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Rạch Giá", "Sa Pa", "Sóc Trăng", "Sơn La", "Tam Kỳ", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuy Hòa", "Tuyên Quang", "Uông Bí", "Vinh", "Vĩnh Long", "Vĩnh Phúc", "Vũng Tàu", "Yên Bái"];
  const dayOptions = ["2 ngày 1 đêm", "3 ngày 2 đêm", "4 ngày 3 đêm", "5 ngày 4 đêm"];
  const budgetOptions = ["5.000.000đ", "10.000.000đ", "15.000.000đ", "20.000.000đ"];

  const filterList = (query) => provinces.filter(p =>
    p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .includes(query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );

  const extra_aliases = new Set(["Sapa","Sa Pa","Đà Lạt","Da Lat","Huế","Hue","Phú Quốc","Phu Quoc","Hội An","Hoi An","Nha Trang","Vũng Tàu","Vung Tau","Mũi Né","Mui Ne","Buôn Ma Thuột","Buon Ma Thuot","Cần Thơ","Can Tho","Hải Phòng","Hai Phong"]);
  const provinces_set = new Set(provinces);
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
      setShake(true); setTimeout(() => setShake(false), 500); return;
    }
    if (onSearch) onSearch({ origin, location, departureDate, budget, days, passengers });
  };

  const isAnyFieldEmpty = Object.keys(emptyFields).length > 0;
  const divider = isDark ? '#3a3a3a' : '#e2e8f0';

  // Desktop item style — original layout
  const dItem = (isLast) => ({
    flex: 1, padding: '10px 30px', textAlign: 'left', position: 'relative',
    borderRight: isLast ? 'none' : `1px solid ${divider}`,
  });

  const styles = {
    hero: {
      width: '100vw', height: 'auto',
      position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      backgroundImage: `linear-gradient(rgba(17,24,39,0.4),rgba(17,24,39,0.5)),url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000')`,
      backgroundSize: 'cover', backgroundPosition: 'center', color: 'white', textAlign: 'center',
      paddingTop: isMobile ? '100px' : '180px', paddingBottom: isMobile ? '25px' : '80px',
    },
    bar: {
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      borderRadius: isMobile ? '20px' : '100px',
      padding: isMobile ? '0' : '22px 36px',
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      width: isMobile ? 'calc(100% - 24px)' : '95%',
      maxWidth: isMobile ? '100%' : '1600px',
      marginTop: isMobile ? '30px' : '50px', position: 'relative', overflow: 'visible',
      transition: '0.4s all cubic-bezier(0.175,0.885,0.32,1.275)',
      boxShadow: isAnyFieldEmpty ? '0 0 30px rgba(239,68,68,0.4)' : '0 25px 50px -12px rgba(0,0,0,0.25)',
      border: isAnyFieldEmpty ? '3px solid #ef4444' : `1px solid ${isDark ? '#3a3a3a' : '#e2e8f0'}`,
    },
    label: {
      fontSize: isMobile ? '11px' : '13px', fontWeight: '700', color: '#10b981',
      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
    },
    input: {
      fontSize: isMobile ? '14px' : '20px', fontWeight: '600',
      color: isDark ? '#e8e8e8' : '#1e293b',
      border: 'none', outline: 'none', width: '100%', backgroundColor: 'transparent',
      padding: '0', colorScheme: isDark ? 'dark' : 'light',
    },
    dropdown: {
      position: 'absolute', top: '120%', left: '0', right: '0',
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderRadius: '20px', boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
      overflowY: 'auto', maxHeight: '260px', zIndex: 100, padding: '12px 0',
    },
    dropdownItem: {
      padding: '12px 24px', color: isDark ? '#e8e8e8' : '#333',
      cursor: 'pointer', fontSize: '16px',
      display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s',
    },
    searchBtn: {
      backgroundColor: '#10b981', color: 'white',
      height: isMobile ? '50px' : '72px',
      padding: isMobile ? '0 20px' : '0 45px',
      borderRadius: isMobile ? '0 0 18px 18px' : '50px',
      border: 'none', fontWeight: '700', fontSize: isMobile ? '16px' : '20px',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
      marginLeft: isMobile ? '0' : '20px',
      width: isMobile ? '100%' : 'auto',
      flexShrink: 0,
      boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)', transition: '0.3s',
    },
  };

  const Dropdown = ({ type, list, icon }) => activeDropdown === type ? (
    <div style={styles.dropdown} className="hero-dropdown">
      {list.map(p => (
        <div key={p} style={styles.dropdownItem} onClick={() => {
          if (type === 'origin') setOrigin(p);
          else if (type === 'loc') setLocation(p);
          else if (type === 'days') setDays(p);
          else if (type === 'budget') setBudget(p);
          setActiveDropdown(null);
        }}>
          <FontAwesomeIcon icon={icon} style={{color:'#10b981'}} /> {p}
        </div>
      ))}
    </div>
  ) : null;

  return (
    <div style={styles.hero} className="hero-section" onClick={() => setActiveDropdown(null)}>
      <style>{`
        .hero-search-bar input {
          background: transparent !important; background-color: transparent !important;
          border: none !important; outline: none !important; box-shadow: none !important;
        }
        .hero-search-bar input:-webkit-autofill,
        .hero-search-bar input:-webkit-autofill:hover,
        .hero-search-bar input:-webkit-autofill:focus {
          transition: background-color 5000s ease-in-out 0s !important;
          -webkit-text-fill-color: inherit !important;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
        }
        .hero-search-bar input::placeholder { color: #6b7280 !important; }
        @keyframes shake {
          10%,90%{transform:translate3d(-2px,0,0)} 20%,80%{transform:translate3d(4px,0,0)}
          30%,50%,70%{transform:translate3d(-8px,0,0)} 40%,60%{transform:translate3d(8px,0,0)}
        }
        .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @media (max-width: 1024px) { .hero-title { font-size: 60px !important; } }
        @media (max-width: 768px) {
          .hero-title { font-size: 40px !important; padding: 0 16px !important; line-height: 1.3 !important; }
          .hero-dropdown { max-height: 200px !important; border-radius: 16px !important; }
          .hero-tags { margin-top: 16px !important; flex-wrap: wrap !important; justify-content: center !important; gap: 8px !important; padding: 0 16px !important; }
          .hero-tag-label { font-size: 16px !important; }
          .hero-tag { padding: 7px 16px !important; font-size: 13px !important; }
        }
        @media (max-width: 480px) { .hero-title { font-size: 32px !important; } }
      `}</style>

      <h1 className="hero-title" style={{ fontSize: '90px', fontWeight: '900', margin: 0 }}>
        Khám phá thế giới cùng <span style={{ color: '#10b981', whiteSpace: 'nowrap' }}>S-Trip</span>
      </h1>

      <div
        key={shake ? 'shaking' : 'normal'}
        style={styles.bar}
        className={`hero-search-bar${shake ? ' shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile ? (
          /* ── MOBILE LAYOUT: Dark/Light Mode & Tối ưu màu sắc S-Trip ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', padding: '16px' }}>
            
            {/* HÀNG 1: TỪ - ĐẾN */}
            <div>
              <div style={{ display: 'flex', marginBottom: '8px' }}>
                <div style={{ flex: 1, padding: '0 20px', color: isDark ? '#e8e8e8' : '#1e293b', fontSize: '14px', fontWeight: '700' }}>Từ</div>
                <div style={{ flex: 1, padding: '0 20px', color: isDark ? '#e8e8e8' : '#1e293b', fontSize: '14px', fontWeight: '700' }}>Đến</div>
              </div>
              
              <div style={{ display: 'flex', position: 'relative', background: 'transparent', borderRadius: '16px', border: `1px solid ${divider}` }}>
                
                {/* Cột 1: Điểm đi */}
                <div style={{ flex: 1, padding: '16px 20px', borderRight: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                  <FontAwesomeIcon icon={faPlane} style={{ color: '#10b981', fontSize: '20px' }} />
                  <div style={{ flex: 1 }}>
                    <input style={{ ...styles.input, fontSize: '16px', fontWeight: '700', color: isDark ? '#fff' : '#1e293b' }} placeholder="Từ đâu?" value={origin}
                      onChange={e => setOrigin(e.target.value)} onFocus={() => setActiveDropdown('origin')} />
                  </div>
                  <Dropdown type="origin" list={filterList(origin)} icon={faPlane} />
                </div>

                {/* Nút Swap chính giữa */}
                <div onClick={e => { e.stopPropagation(); handleSwap(); }}
                  style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: isDark ? '#3a3a3a' : '#fff',
                    border: `1.5px solid ${divider}`, color: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}>
                  <FontAwesomeIcon icon={faRightLeft} style={{ fontSize: '14px' }} />
                </div>

                {/* Cột 2: Điểm đến */}
                <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                  <FontAwesomeIcon icon={faLocationDot} style={{ color: '#10b981', fontSize: '20px' }} />
                  <div style={{ flex: 1 }}>
                    <input style={{ ...styles.input, fontSize: '16px', fontWeight: '700', color: isDark ? '#fff' : '#1e293b' }} placeholder="Đi đâu?" value={location}
                      onChange={e => setLocation(e.target.value)} onFocus={() => setActiveDropdown('loc')} />
                  </div>
                  <Dropdown type="loc" list={filterList(location)} icon={faLocationDot} />
                </div>
              </div>
            </div>

            {/* HÀNG 2: NGÀY ĐI - SỐ NGÀY */}
            <div>
              <div style={{ display: 'flex', marginBottom: '8px' }}>
                <div style={{ flex: 1, padding: '0 20px', color: isDark ? '#e8e8e8' : '#1e293b', fontSize: '14px', fontWeight: '700' }}>Ngày đi</div>
                <div style={{ flex: 1, padding: '0 20px', color: isDark ? '#e8e8e8' : '#1e293b', fontSize: '14px', fontWeight: '700' }}>Số ngày</div>
              </div>
              <div style={{ display: 'flex', background: 'transparent', borderRadius: '16px', border: `1px solid ${divider}` }}>
                
                {/* Cột 1: Ngày đi */}
                <div style={{ flex: 1, padding: '16px 20px', borderRight: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', cursor: 'pointer' }}
                  onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}>
                  <FontAwesomeIcon icon={faCalendarDays} style={{ color: '#10b981', fontSize: '20px' }} />
                  <span style={{ ...styles.input, fontSize: '16px', fontWeight: '700', color: departureDate ? (isDark ? '#fff' : '#1e293b') : '#9ca3af' }}>
                    {departureDate ? departureDate.split('-').reverse().join('/') : 'Chọn ngày'}
                  </span>
                  {activeDropdown === 'date' && <CalendarDropdown {...{calYear,calMonth,setCalYear,setCalMonth,today,departureDate,setDepartureDate,setActiveDropdown,isDark,styles,isMobile}} />}
                </div>

                {/* Cột 2: Số ngày (Không Icon) */}
                <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <div style={{ flex: 1 }}>
                    <input style={{ ...styles.input, fontSize: '16px', fontWeight: '700', color: isDark ? '#fff' : '#1e293b' }} placeholder="Ví dụ: 3 ngày" value={days} 
                      onChange={e => setDays(e.target.value)} onFocus={() => setActiveDropdown('days')} />
                  </div>
                  <Dropdown type="days" list={dayOptions} icon={faCalendarDays} />
                </div>
              </div>
            </div>

            {/* HÀNG 3: KHÁCH - NGÂN SÁCH */}
            <div>
              <div style={{ display: 'flex', marginBottom: '8px' }}>
                <div style={{ flex: 1, padding: '0 20px', color: isDark ? '#e8e8e8' : '#1e293b', fontSize: '14px', fontWeight: '700' }}>Số khách</div>
                <div style={{ flex: 1, padding: '0 20px', color: isDark ? '#e8e8e8' : '#1e293b', fontSize: '14px', fontWeight: '700' }}>Ngân sách</div>
              </div>
              <div style={{ display: 'flex', background: 'transparent', borderRadius: '16px', border: `1px solid ${divider}` }}>
                
                {/* Cột 1: Số người */}
                <div style={{ flex: 1, padding: '16px 20px', borderRight: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FontAwesomeIcon icon={faUserGroup} style={{ color: '#10b981', fontSize: '20px' }} />
                  <div style={{ flex: 1 }}>
                    <input type="number" min="1" max="10" style={{ ...styles.input, fontSize: '16px', fontWeight: '700', color: isDark ? '#fff' : '#1e293b' }} value={passengers} onChange={e => setPassengers(e.target.value)} />
                  </div>
                </div>

                {/* Cột 2: Ngân sách (Không Icon) */}
                <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <div style={{ flex: 1 }}>
                    <input style={{ ...styles.input, fontSize: '16px', fontWeight: '700', color: isDark ? '#fff' : '#1e293b' }} placeholder="Tùy chọn" value={budget}
                      onChange={e => { const f=e.target.value.replace(/[^0-9]/g,''); setBudget(f||''); }}
                      onFocus={() => { setActiveDropdown('budget'); setBudget(String(budget).replace(/[.đ\s]/g,'')); }}
                      onBlur={() => { const r=String(budget).replace(/[.đ\s]/g,''); if(r&&parseInt(r)>0){setBudget(parseInt(r).toLocaleString('vi-VN')+'đ'); setEmptyFields(f=>({...f,budget:false}));} }} />
                  </div>
                  <Dropdown type="budget" list={budgetOptions} icon={faMoneyBillWave} />
                </div>
              </div>
            </div>

            {/* NÚT TÌM KIẾM */}
            <button style={{ ...styles.searchBtn, width: '100%', borderRadius: '16px', marginTop: '12px', marginBottom: '0px', height: '56px', fontSize: '18px', fontWeight: '800' }} onClick={handleSearchClick}>
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: '18px' }} /> Tìm kiếm
            </button>
          </div>
        ) : (
          /* ── DESKTOP LAYOUT: original horizontal row ── */
          <>
            {/* Điểm đi */}
            <div style={dItem(false)} className="hero-search-item hero-item-origin">
              <div style={{...styles.label, fontSize:'12px', marginBottom:'6px'}} className="s-label">Điểm đi</div>
              <input style={styles.input} placeholder="Từ đâu?" value={origin}
                onChange={e => setOrigin(e.target.value)} onFocus={() => setActiveDropdown('origin')} />
              {activeDropdown==='origin' && (
                <div style={styles.dropdown} className="hero-dropdown">
                  {filterList(origin).map(p => (
                    <div key={p} style={styles.dropdownItem} onClick={() => { setOrigin(p); setActiveDropdown(null); }}>
                      <FontAwesomeIcon icon={faPlane} style={{color:'#10b981'}} /> {p}
                    </div>
                  ))}
                </div>
              )}
              {/* Swap button overlapping right border */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSwap(); }} title="Đổi chiều"
                style={{position:'absolute',top:'50%',right:'-16px',transform:'translateY(-50%)',width:'32px',height:'32px',borderRadius:'50%',background:isDark?'#2a2a2a':'#fff',border:'1.5px solid #10b981',color:'#10b981',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',flexShrink:0,boxShadow:'0 1px 4px rgba(0,0,0,0.12)',zIndex:10}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(16,185,129,0.15)';e.currentTarget.style.transform='translateY(-50%) rotate(180deg)';}}
                onMouseLeave={e=>{e.currentTarget.style.background=isDark?'#2a2a2a':'#fff';e.currentTarget.style.transform='translateY(-50%) rotate(0deg)';}}
              >
                <FontAwesomeIcon icon={faRightLeft} style={{fontSize:'12px'}} />
              </button>
            </div>
            {/* Địa điểm */}
            <div style={dItem(false)} className="hero-search-item hero-item-loc">
              <div style={{...styles.label, fontSize:'12px', marginBottom:'6px'}} className="s-label">Địa điểm</div>
              <input style={styles.input} placeholder="Đi đâu?" value={location}
                onChange={e => setLocation(e.target.value)} onFocus={() => setActiveDropdown('loc')} />
              {activeDropdown==='loc' && (
                <div style={styles.dropdown} className="hero-dropdown">
                  {filterList(location).map(p => (
                    <div key={p} style={styles.dropdownItem} onClick={() => { setLocation(p); setActiveDropdown(null); }}>
                      <FontAwesomeIcon icon={faLocationDot} style={{color:'#10b981'}} /> {p}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Ngày đi */}
            <div style={dItem(false)} className="hero-search-item hero-item-date">
              <div style={{...styles.label, fontSize:'12px', marginBottom:'6px'}} className="s-label">Ngày đi</div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',width:'100%',cursor:'pointer'}}
                onClick={() => setActiveDropdown(activeDropdown==='date'?null:'date')}>
                <span className="hero-input-text" style={{...styles.input,color:departureDate?(isDark?'#e8e8e8':'#111827'):'#9ca3af'}}>
                  {departureDate ? departureDate.split('-').reverse().join('/') : 'dd/mm/yyyy'}
                </span>
                <FontAwesomeIcon icon={faCalendarDays} style={{color:'#10b981',fontSize:'18px',flexShrink:0}} />
              </div>
              {activeDropdown==='date' && <CalendarDropdown {...{calYear,calMonth,setCalYear,setCalMonth,today,departureDate,setDepartureDate,setActiveDropdown,isDark,styles,isMobile}} />}
            </div>
            {/* Số ngày */}
            <div style={dItem(false)} className="hero-search-item hero-item-days">
              <div style={{...styles.label, fontSize:'12px', marginBottom:'6px'}} className="s-label">Số ngày</div>
              <input style={styles.input} placeholder="3 ngày 2 đêm" autoComplete="off"
                value={days} onChange={e => setDays(e.target.value)} onFocus={() => setActiveDropdown('days')} />
              {activeDropdown==='days' && (
                <div style={styles.dropdown} className="hero-dropdown">
                  {dayOptions.map(d => (
                    <div key={d} style={styles.dropdownItem} onClick={() => { setDays(d); setActiveDropdown(null); }}>
                      <FontAwesomeIcon icon={faCalendarDays} style={{color:'#10b981'}} /> {d}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Số người */}
            <div style={dItem(false)} className="hero-search-item hero-item-pax">
              <div style={{...styles.label, fontSize:'12px', marginBottom:'6px'}} className="s-label">Số người</div>
              <div style={{display:'flex',alignItems:'center',gap:'15px'}}>
                <FontAwesomeIcon icon={faUserGroup} style={{color:'#9ca3af',fontSize:'20px'}} />
                <input type="number" min="1" max="10" style={styles.input} value={passengers} onChange={e => setPassengers(e.target.value)} />
              </div>
            </div>
            {/* Ngân sách */}
            <div style={dItem(true)} className="hero-search-item hero-item-budget">
              <div style={{...styles.label, fontSize:'12px', marginBottom:'6px'}} className="s-label">Ngân sách</div>
              <input style={styles.input} placeholder="Kinh phí?" value={budget}
                onChange={e => { const f=e.target.value.replace(/[^0-9]/g,''); setBudget(f||''); }}
                onFocus={() => { setActiveDropdown('budget'); setBudget(String(budget).replace(/[.đ\s]/g,'')); }}
                onBlur={() => { const r=String(budget).replace(/[.đ\s]/g,''); if(r&&parseInt(r)>0){setBudget(parseInt(r).toLocaleString('vi-VN')+'đ'); setEmptyFields(f=>({...f,budget:false}));} }} />
              {activeDropdown==='budget' && (
                <div style={styles.dropdown} className="hero-dropdown">
                  {budgetOptions.map(b => (
                    <div key={b} style={styles.dropdownItem} onClick={() => { setBudget(b); setActiveDropdown(null); }}>
                      <FontAwesomeIcon icon={faMoneyBillWave} style={{color:'#10b981'}} /> {b}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Search button */}
            <button style={styles.searchBtn} className="hero-search-btn" onClick={handleSearchClick}>
              <FontAwesomeIcon icon={faMagnifyingGlass} /> Tìm kiếm
            </button>
          </>
        )}
      </div>

      {/* GỢI Ý TAGS */}
      <div className="hero-tags" style={{marginTop: isMobile ? '30px' : '70px',display:'flex',gap:'30px',alignItems:'center'}}>
        <span className="hero-tag-label" style={{fontSize:'32px',fontWeight:'900',color:'white'}}>
          <FontAwesomeIcon icon={faBolt} style={{color:'#fbbf24'}} /> Gợi ý:
        </span>
        {(isMobile ? ['Đà Lạt','Huế','Đà Nẵng'] : ['Đà Lạt','Huế','Đà Nẵng', 'Sapa', 'Phú Quốc']).map(city => (
          <div key={city} className="hero-tag"
            style={{
              backgroundColor: hoveredTag===city?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.2)',
              padding:'10px 40px', borderRadius:'9999px', fontSize:'24px', color:'white', fontWeight:'700',
              cursor:'pointer', border:'1px solid rgba(255,255,255,0.5)', transition:'0.3s',
            }}
            onMouseEnter={() => setHoveredTag(city)}
            onMouseLeave={() => setHoveredTag(null)}
            onClick={() => setLocation(city)}
          >{city}</div>
        ))}
      </div>
    </div>
  );
};

// Calendar dropdown extracted to avoid repetition
const CalendarDropdown = ({ calYear, calMonth, setCalYear, setCalMonth, today, departureDate, setDepartureDate, setActiveDropdown, isDark, styles, isMobile }) => {
  const sel = departureDate ? new Date(departureDate) : null;
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const cells = Array(offset).fill(null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  const prevMonth = () => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); };
  const nextMonth = () => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); };
  return (
    <div style={{...styles.dropdown,maxHeight:'none',padding:isMobile?'10px':'16px',overflowY:'visible', width: isMobile ? '220px' : '280px', left: '50%', transform: 'translateX(-50%)'}} className="hero-calendar-dropdown" onClick={e=>e.stopPropagation()}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
        <button onClick={prevMonth} style={{background:'none',border:'none',cursor:'pointer',color:isDark?'#e8e8e8':'#333',fontSize:'16px',minWidth:'32px',minHeight:'32px'}}>‹</button>
        <span style={{fontWeight:'700',color:isDark?'#e8e8e8':'#333'}}>{months[calMonth]} {calYear}</span>
        <button onClick={nextMonth} style={{background:'none',border:'none',cursor:'pointer',color:isDark?'#e8e8e8':'#333',fontSize:'16px',minWidth:'32px',minHeight:'32px'}}>›</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px',textAlign:'center'}}>
        {['T2','T3','T4','T5','T6','T7','CN'].map(d=>(
          <div key={d} style={{fontSize:'11px',fontWeight:'700',color:'#10b981',padding:'4px 0'}}>{d}</div>
        ))}
        {cells.map((day,i) => {
          if(!day) return <div key={i}/>;
          const d = new Date(calYear, calMonth, day);
          const isPast = d < today;
          const isSel = sel && d.toDateString()===sel.toDateString();
          const isToday = d.toDateString()===today.toDateString();
          return (
            <div key={i} onClick={() => {
              if(isPast) return;
              setDepartureDate(`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
              setActiveDropdown(null);
            }} style={{
              aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',
              borderRadius:'8px',cursor:isPast?'default':'pointer',
              fontWeight:isSel||isToday?'700':'500',fontSize:isMobile?'12px':'13px',
              backgroundColor:isSel?'#10b981':'transparent',
              color:isSel?'#fff':isPast?(isDark?'#555':'#ccc'):isToday?'#10b981':(isDark?'#e8e8e8':'#333'),
              border:isToday&&!isSel?'1px solid #10b981':'1px solid transparent',
              minHeight: isMobile ? '24px' : '32px',
            }}>{day}</div>
          );
        })}
      </div>
    </div>
  );
};

export default Hero;