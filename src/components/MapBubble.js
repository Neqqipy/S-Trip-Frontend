import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faUtensils, faMapLocationDot, faRoute,
  faSun, faCloudSun, faMoon, faSpinner
} from '@fortawesome/free-solid-svg-icons';

// ── Mock fallback ─────────────────────────────────────────────
const mockTours = [
  { name: "Địa điểm tham quan 1", thumbnail: null },
  { name: "Địa điểm tham quan 2", thumbnail: null },
  { name: "Địa điểm tham quan 3", thumbnail: null },
];
const mockFoods = [
  { name: "Nhà hàng địa phương 1", thumbnail: null },
  { name: "Quán ăn ngon 2",        thumbnail: null },
  { name: "Quán ăn ngon 3",        thumbnail: null },
];

const SESSION_META = [
  { key: 'morning',   label: 'Sáng',  icon: faSun,      color: '#f59e0b' },
  { key: 'afternoon', label: 'Chiều', icon: faCloudSun,  color: '#3b82f6' },
  { key: 'evening',   label: 'Tối',   icon: faMoon,      color: '#8b5cf6' },
];

function buildDayPlaces(data) {
  const toursPool = data.realTours?.length > 0 ? data.realTours : mockTours;
  const foodsPool = data.realFoods?.length > 0 ? data.realFoods : mockFoods;
  const numDays   = parseInt(data.days?.toString().split(' ')[0]) || 3;
  const days = [];
  for (let i = 0; i < numDays; i++) {
    const places = [];
    SESSION_META.forEach((s, si) => {
      const idx = i * 3 + si;
      places.push({ session: s.label, sessionColor: s.color, sessionIcon: s.icon, type: 'tour', name: toursPool[idx % toursPool.length].name, thumbnail: toursPool[idx % toursPool.length].thumbnail || null });
      places.push({ session: s.label, sessionColor: s.color, sessionIcon: s.icon, type: 'food', name: foodsPool[idx % foodsPool.length].name, thumbnail: foodsPool[idx % foodsPool.length].thumbnail || null });
    });
    days.push(places);
  }
  return days;
}

// ── Geocode tuần tự có delay để tránh rate-limit Nominatim ───
const geocodeCache = {};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function geocodeSequential(places, location) {
  const results = [];
  for (const place of places) {
    const key = `${place.name} ${location}`;
    if (geocodeCache[key]) {
      results.push({ ...place, ...geocodeCache[key] });
      continue;
    }
    try {
      // Thử tìm với tên đầy đủ trước
      let res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(key)}&format=json&limit=1&accept-language=vi`,
        { headers: { 'User-Agent': 'STrip-App/1.0' } }
      );
      let data = await res.json();

      // Nếu không tìm được, thử chỉ với tên địa điểm
      if (!data.length) {
        await sleep(400);
        res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place.name)}&format=json&limit=1&accept-language=vi`,
          { headers: { 'User-Agent': 'STrip-App/1.0' } }
        );
        data = await res.json();
      }

      if (data.length) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        geocodeCache[key] = coords;
        results.push({ ...place, ...coords });
      }
    } catch {}

    // Delay giữa các request để không bị rate-limit (Nominatim: max 1 req/s)
    await sleep(500);
  }
  return results;
}

// ── Tạo HTML Leaflet + OSRM routing ──────────────────────────
function buildLeafletHtml(markers) {
  const markersJson = JSON.stringify(markers);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
    .custom-label {
      background: white;
      border: 2px solid #10b981;
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 800;
      color: #111;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
  (async function() {
    const markers = ${markersJson};
    if (!markers.length) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-family:sans-serif;flex-direction:column;gap:8px"><div style="font-size:32px">🗺️</div><div>Không tìm được tọa độ địa điểm</div></div>';
      return;
    }

    const map = L.map('map', { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const typeColors = { tour: '#8b5cf6', food: '#f97316' };
    const latlngs = [];

    // Vẽ markers có số thứ tự
    markers.forEach((m, i) => {
      const color = typeColors[m.type] || '#10b981';
      const emoji = m.type === 'tour' ? '📍' : '🍜';
      const html = \`
        <div style="position:relative;width:36px;height:44px">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
            <ellipse cx="18" cy="42" rx="5" ry="2" fill="rgba(0,0,0,0.25)"/>
            <path d="M18 1C10.3 1 4 7.3 4 15c0 9.6 14 27 14 27s14-17.4 14-27C32 7.3 25.7 1 18 1z" 
                  fill="\${color}" stroke="white" stroke-width="1.5"/>
            <circle cx="18" cy="15" r="8" fill="white"/>
            <text x="18" y="19" text-anchor="middle" font-size="10" font-weight="900" fill="\${color}" font-family="sans-serif">\${i+1}</text>
          </svg>
        </div>\`;
      const icon = L.divIcon({ html, iconSize:[36,44], iconAnchor:[18,44], popupAnchor:[0,-46], className:'' });
      const sessionLabel = m.session || '';
      L.marker([m.lat, m.lng], { icon }).addTo(map)
        .bindPopup(\`
          <div style="font-family:sans-serif;min-width:160px">
            <div style="font-size:13px;font-weight:900;color:#111;margin-bottom:4px">\${m.name}</div>
            <div style="font-size:11px;color:\${color};font-weight:700">\${emoji} \${m.type === 'tour' ? 'Tham quan' : 'Ăn uống'}</div>
            \${sessionLabel ? '<div style="font-size:11px;color:#9ca3af;margin-top:2px">Buổi ' + sessionLabel + '</div>' : ''}
          </div>\`);
      latlngs.push([m.lat, m.lng]);
    });

    // Fit bounds trước
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [40, 40] });

    // Vẽ route theo đường thật bằng OSRM
    if (latlngs.length > 1) {
      try {
        const coordStr = markers.map(m => m.lng + ',' + m.lat).join(';');
        const url = 'https://router.project-osrm.org/route/v1/driving/' + coordStr
                  + '?overview=full&geometries=geojson&continue_straight=false';
        const res  = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.[0]) {
          L.geoJSON(data.routes[0].geometry, {
            style: { color: '#10b981', weight: 4, opacity: 0.85, lineJoin: 'round', lineCap: 'round' }
          }).addTo(map);
        } else {
          // Fallback: đường thẳng nếu OSRM lỗi
          L.polyline(latlngs, { color:'#10b981', weight:3, opacity:0.7, dashArray:'8 5' }).addTo(map);
        }
      } catch {
        L.polyline(latlngs, { color:'#10b981', weight:3, opacity:0.7, dashArray:'8 5' }).addTo(map);
      }
    }
  })();
  </script>
</body>
</html>`;
}

// ── Map Panel ─────────────────────────────────────────────────
const MapPanel = ({ data, onClose }) => {
  const numDays = parseInt(data.days?.toString().split(' ')[0]) || 3;
  const allDays = buildDayPlaces(data);
  const [selectedDay, setSelectedDay] = useState(0);
  const [mapHtml,     setMapHtml]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [loadingMsg,  setLoadingMsg]  = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    const dayPlaces = allDays[selectedDay] || [];
    setLoading(true);
    setMapHtml('');
    setLoadingMsg('Đang tìm tọa độ địa điểm...');

    geocodeSequential(dayPlaces, data.location).then(results => {
      if (cancelled) return;
      if (results.length > 0) setLoadingMsg('Đang vẽ tuyến đường...');
      setMapHtml(buildLeafletHtml(results));
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [selectedDay, data.location]); // eslint-disable-line react-hooks/exhaustive-deps

  const dayPlaces = allDays[selectedDay] || [];
  const typeColor = (t) => t === 'tour' ? '#8b5cf6' : '#f97316';
  const typeIcon  = (t) => t === 'tour' ? faMapLocationDot : faUtensils;

  return ReactDOM.createPortal(
    <>
      <style>{`
        @keyframes mbFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes mbSlideIn { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes mbSpin    { to{transform:rotate(360deg)} }
        .mb-panel   { animation: mbSlideIn 0.3s cubic-bezier(.22,1,.36,1) forwards; }
        .mb-overlay { animation: mbFadeIn  0.2s ease forwards; }
        .mb-daytab:hover   { background:#f0fdf4 !important; }
        .mb-close:hover    { background:#fee2e2 !important; color:#ef4444 !important; }
        .mb-placerow:hover { background:#f8fafc !important; }
        .mb-spin { animation: mbSpin 1s linear infinite; display:inline-block; }
      `}</style>

      <div className="mb-overlay" onClick={onClose} style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', zIndex:999998 }} />

      <div className="mb-panel" style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(780px,100vw)', backgroundColor:'white', zIndex:999999, display:'flex', flexDirection:'column', boxShadow:'-20px 0 60px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FontAwesomeIcon icon={faRoute} style={{ color:'white', fontSize:18 }} />
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:900, color:'#111827' }}>Bản đồ hành trình · {data.location}</div>
              <div style={{ fontSize:12, color:'#9ca3af' }}>{numDays} ngày · {dayPlaces.length} địa điểm hôm nay</div>
            </div>
          </div>
          <button className="mb-close" onClick={onClose} style={{ width:38, height:38, borderRadius:'50%', border:'none', backgroundColor:'#f1f5f9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'0.15s', fontSize:16, color:'#374151' }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Tab ngày */}
        <div style={{ display:'flex', gap:8, padding:'14px 24px', borderBottom:'1px solid #f1f5f9', flexShrink:0, overflowX:'auto' }}>
          {Array.from({ length: numDays }, (_, i) => (
            <button key={i} className="mb-daytab" onClick={() => setSelectedDay(i)} style={{ padding:'8px 20px', borderRadius:99, border:'1.5px solid #10b981', background: selectedDay===i ? '#10b981':'white', color: selectedDay===i ? 'white':'#10b981', fontWeight:800, fontSize:14, cursor:'pointer', whiteSpace:'nowrap', transition:'0.15s' }}>
              Ngày {i + 1}
            </button>
          ))}
        </div>

        {/* Map + List */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          {/* Bản đồ */}
          <div style={{ flex:'0 0 55%', borderRight:'1px solid #f1f5f9', position:'relative', background:'#f8fafc' }}>
            {loading && (
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'#9ca3af', zIndex:10 }}>
                <FontAwesomeIcon icon={faSpinner} className="mb-spin" style={{ fontSize:28, color:'#10b981' }} />
                <div style={{ fontSize:13, fontWeight:600 }}>{loadingMsg}</div>
                <div style={{ fontSize:11, color:'#d1d5db' }}>Đang geocode {dayPlaces.length} địa điểm...</div>
              </div>
            )}
            {!loading && mapHtml && (
              <iframe
                key={selectedDay}
                title="leaflet-map"
                width="100%" height="100%"
                style={{ border:0, display:'block' }}
                srcDoc={mapHtml}
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>

          {/* Danh sách */}
          <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
            {SESSION_META.map((session) => {
              const sp = dayPlaces.filter(p => p.session === session.label);
              return (
                <div key={session.key} style={{ marginBottom:4 }}>
                  <div style={{ padding:'8px 20px', display:'flex', alignItems:'center', gap:8, fontSize:11, fontWeight:800, color:session.color, textTransform:'uppercase', letterSpacing:'0.5px', position:'sticky', top:0, background:'white', zIndex:1, borderBottom:'1px solid #f8fafc' }}>
                    <FontAwesomeIcon icon={session.icon} /> Buổi {session.label}
                  </div>
                  <div style={{ padding:'4px 20px', position:'relative' }}>
                    {sp.length > 1 && <div style={{ position:'absolute', left:36, top:24, bottom:24, width:2, backgroundColor:'#e2e8f0', zIndex:0 }} />}
                    {sp.map((place, pi) => {
                      const globalIdx = dayPlaces.indexOf(place);
                      return (
                        <div key={pi} className="mb-placerow" style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 8px', borderRadius:12, cursor:'default', transition:'0.15s', position:'relative', zIndex:1, marginBottom:2 }}>
                          <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:typeColor(place.type), display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', border:'2px solid white' }}>
                            {place.thumbnail
                              ? <img src={place.thumbnail} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                              : <FontAwesomeIcon icon={typeIcon(place.type)} style={{ color:'white', fontSize:13 }} />}
                          </div>
                          <div style={{ position:'absolute', left:34, top:8, width:14, height:14, borderRadius:'50%', backgroundColor:'white', border:`1.5px solid ${typeColor(place.type)}`, fontSize:8, fontWeight:900, color:typeColor(place.type), display:'flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
                            {globalIdx + 1}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:800, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{place.name}</div>
                            <div style={{ fontSize:11, color:typeColor(place.type), fontWeight:700 }}>
                              {place.type === 'tour' ? '📍 Tham quan' : '🍜 Ăn uống'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 24px', borderTop:'1px solid #f1f5f9', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:12, color:'#9ca3af' }}>Bấm ESC hoặc click ra ngoài để đóng</span>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location)}`} target="_blank" rel="noopener noreferrer"
            style={{ padding:'8px 16px', borderRadius:8, background:'#10b981', color:'white', fontWeight:700, fontSize:12, textDecoration:'none' }}>
            Mở Google Maps ↗
          </a>
        </div>
      </div>
    </>,
    document.body
  );
};

// ── Nút tròn gốc ─────────────────────────────────────────────
const MapBubble = ({ targetOffset = 450, data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [open,      setOpen]      = useState(false);
  const [pulse,     setPulse]     = useState(false);

  useEffect(() => {
    if (data) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 3000);
      return () => clearTimeout(t);
    }
  }, [data]);

  return (
    <>
      <style>{`
        @keyframes mbPulse {
          0%,100% { box-shadow: 0 10px 25px rgba(0,0,0,0.3), 0 0 0 0   rgba(16,185,129,0.6); }
          50%      { box-shadow: 0 10px 25px rgba(0,0,0,0.3), 0 0 0 16px rgba(16,185,129,0); }
        }
      `}</style>
      <div
        onClick={() => { if (data) setOpen(true); else window.scrollTo({ top: targetOffset, behavior: 'smooth' }); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position:'fixed', right:'50px', bottom:'165px',
          width:'100px', height:'100px', borderRadius:'50%',
          cursor:'pointer', zIndex:1999, border:'3px solid white',
          display:'flex', justifyContent:'center', alignItems:'center', overflow:'hidden',
          boxShadow: isHovered ? '0 15px 35px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.3)',
          transition:'0.3s all cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isHovered ? 'scale(1.1) rotate(10deg)' : 'scale(1) rotate(0deg)',
          backgroundImage:`url('/map.jpg')`, backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat',
          filter: isHovered ? 'brightness(1.1)' : 'brightness(1.2)',
          animation: pulse && data ? 'mbPulse 1s ease 3' : 'none',
        }}
        title={data ? 'Xem bản đồ hành trình' : 'Cuộn đến bản đồ'}
      >
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', backgroundColor: isHovered ? 'rgba(255,255,255,0.1)':'rgba(255,255,255,0)', transition:'0.3s' }} />
      </div>
      {open && data && <MapPanel data={data} onClose={() => setOpen(false)} />}
    </>
  );
};

export default MapBubble;